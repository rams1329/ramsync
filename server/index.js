import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase, TABLES, STORAGE_BUCKET } from './supabase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../dist')));
// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: { error: 'Too many uploads. Please try again later.' }
});

const retrieveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: 'Too many requests. Please try again later.' }
});

// File upload configuration - temporary local storage before uploading to Supabase
const uploadDir = path.join(__dirname, 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
  // Removed fileFilter to allow all file types
});

// Utility functions
const generatePin = async () => {
  let pin;
  let exists = true;
  
  while (exists) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data } = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('pin')
      .eq('pin', pin)
      .single();
      
    exists = !!data;
  }
  
  return pin;
};

const cleanupExpired = async () => {
  try {
    // Get expired items
    const { data: expiredItems } = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('id')
      .lt('expires_at', new Date().toISOString());

    if (expiredItems && expiredItems.length > 0) {
      const expiredIds = expiredItems.map(item => item.id);
      
      // Delete files from storage
      const { data: filesToDelete } = await supabase
        .from(TABLES.FILES)
        .select('file_path')
        .in('clipboard_item_id', expiredIds);

      if (filesToDelete && filesToDelete.length > 0) {
        const filePaths = filesToDelete.map(file => file.file_path);
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(filePaths);
      }
      
      // Delete expired items (files will be cascade deleted)
      await supabase
        .from(TABLES.CLIPBOARD_ITEMS)
        .delete()
        .in('id', expiredIds);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// Cleanup expired content every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

// Upload file to Supabase storage
const uploadFileToSupabase = async (file, itemId) => {
  try {
    const fileName = `${itemId}/${uuidv4()}_${file.originalname}`;
    const fileBuffer = fs.readFileSync(file.path);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;
    
    // Delete temp file
    fs.unlinkSync(file.path);
    
    return {
      fileName: file.originalname,
      filePath: fileName,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Routes
app.post('/api/clipboard/upload', uploadLimiter, upload.array('files'), async (req, res) => {
  try {
    const { type, content, expiration, secureMode } = req.body;
    const uploadedFiles = req.files || [];

    // Validation
    if (!type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type === 'text' && !content) {
      return res.status(400).json({ error: 'Text content required' });
    }

    if (type === 'file' && uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'Files required' });
    }

    const id = uuidv4();
    const pin = secureMode === 'true' ? await generatePin() : null;
    
    // For quick share (no PIN), use default 24 hours expiration
    // For secure share (PIN), use provided expiration or default to 5 minutes
    const expirationMinutes = secureMode === 'true' 
      ? (expiration ? parseInt(expiration) : 5)
      : (24 * 60); // 24 hours for quick share
    
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Handle file uploads to Supabase
    const processedFiles = [];
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        const fileData = await uploadFileToSupabase(file, id);
        processedFiles.push(fileData);
      }
    }

    // Create clipboard item
    let clipboardData;
    
    if (pin) {
      // Secure share - insert new item
      const { data, error } = await supabase
        .from(TABLES.CLIPBOARD_ITEMS)
        .insert({
          id,
          type,
          content: content || null,
          pin,
          expires_at: expiresAt.toISOString(),
          access_count: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      clipboardData = data;
    } else {
      // Quick share - update the special latest item
      const { data, error } = await supabase
        .from(TABLES.CLIPBOARD_ITEMS)
        .update({
          type,
          content: content || null,
          expires_at: expiresAt.toISOString(),
          access_count: 0,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .select()
        .single();

      if (error) throw error;
      clipboardData = data;
    }

    // Insert file records
    if (processedFiles.length > 0) {
      const fileRecords = processedFiles.map(file => ({
        clipboard_item_id: clipboardData.id,
        original_name: file.fileName,
        file_path: file.filePath,
        file_size: file.fileSize,
        mime_type: file.mimeType
      }));

      const { error: filesError } = await supabase
        .from(TABLES.FILES)
        .insert(fileRecords);

      if (filesError) throw filesError;
    }

    res.json({
      id: clipboardData.id,
      pin,
      url: pin ? `${req.protocol}://${req.get('host')}/pin/${pin}` : `${req.protocol}://${req.get('host')}/latest`,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clipboard/pin/:pin', retrieveLimiter, async (req, res) => {
  try {
    const { pin } = req.params;

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ error: 'Invalid PIN format' });
    }

    // Get clipboard item
    const { data: item, error } = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('*')
      .eq('pin', pin)
      .single();

    if (error || !item) {
      return res.status(404).json({ error: 'Content not found or expired' });
    }

    // Check if expired
    if (new Date(item.expires_at) < new Date()) {
      await supabase
        .from(TABLES.CLIPBOARD_ITEMS)
        .delete()
        .eq('id', item.id);
      return res.status(404).json({ error: 'Content expired' });
    }

    // Get associated files
    const { data: files } = await supabase
      .from(TABLES.FILES)
      .select('*')
      .eq('clipboard_item_id', item.id);

    // Format files for response
    const formattedFiles = files ? files.map(file => ({
      fileName: file.original_name,
      fileUrl: `/api/files/${file.file_path}`,
      fileSize: file.file_size,
      mimeType: file.mime_type
    })) : [];

    // Increment access count
    await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .update({ access_count: item.access_count + 1 })
      .eq('id', item.id);

    res.json({
      id: item.id,
      type: item.type,
      content: item.content,
      files: formattedFiles.length > 0 ? formattedFiles : undefined,
      pin: item.pin,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      accessCount: item.access_count + 1,
      isActive: item.is_active
    });

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clipboard/latest', retrieveLimiter, async (req, res) => {
  try {
    // Get the special latest item
    const { data: item, error } = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (error || !item || !item.is_active) {
      return res.status(404).json({ error: 'No content available' });
    }

    // Check if expired
    if (new Date(item.expires_at) < new Date()) {
      await supabase
        .from(TABLES.CLIPBOARD_ITEMS)
        .update({ is_active: false })
        .eq('id', item.id);
      return res.status(404).json({ error: 'Content expired' });
    }

    // Get associated files
    const { data: files } = await supabase
      .from(TABLES.FILES)
      .select('*')
      .eq('clipboard_item_id', item.id);

    // Format files for response
    const formattedFiles = files ? files.map(file => ({
      fileName: file.original_name,
      fileUrl: `/api/files/${file.file_path}`,
      fileSize: file.file_size,
      mimeType: file.mime_type
    })) : [];

    // Increment access count
    await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .update({ access_count: item.access_count + 1 })
      .eq('id', item.id);

    res.json({
      id: item.id,
      type: item.type,
      content: item.content,
      files: formattedFiles.length > 0 ? formattedFiles : undefined,
      pin: item.pin,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      accessCount: item.access_count + 1,
      isActive: item.is_active
    });

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/files/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file info for proper headers
    const { data: fileInfo } = await supabase
      .from(TABLES.FILES)
      .select('original_name, mime_type')
      .eq('file_path', filePath)
      .single();

    if (fileInfo) {
      res.setHeader('Content-Type', fileInfo.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.original_name}"`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    res.send(buffer);

  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'supabase',
    storage: 'supabase'
  });
});

app.get('/api/clipboard/cleanup', async (req, res) => {
  try {
    const beforeCount = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('id', { count: 'exact', head: true });
    
    await cleanupExpired();
    
    const afterCount = await supabase
      .from(TABLES.CLIPBOARD_ITEMS)
      .select('id', { count: 'exact', head: true });
    
    res.json({
      message: 'Cleanup completed',
      removed: (beforeCount.count || 0) - (afterCount.count || 0),
      remaining: afterCount.count || 0
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Database: Supabase`);
  console.log(`Storage: Supabase`);
});
