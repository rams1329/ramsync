import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage (in production, use a database)
const storage = new Map();
const files = new Map();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

// File upload configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

// Utility functions
const generatePin = () => {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (storage.has(pin));
  return pin;
};

const cleanupExpired = () => {
  const now = new Date();
  for (const [key, item] of storage.entries()) {
    if (new Date(item.expiresAt) < now) {
      // Delete associated files
      if (item.files) {
        item.files.forEach(file => {
          const filePath = files.get(file.fileName);
          if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          files.delete(file.fileName);
        });
      }
      storage.delete(key);
    }
  }
};

// Cleanup expired content every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

// Routes
app.post('/api/clipboard/upload', uploadLimiter, upload.array('files'), (req, res) => {
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
    const pin = secureMode === 'true' ? generatePin() : null;
    
    // For quick share (no PIN), use default 24 hours expiration
    // For secure share (PIN), use provided expiration or default to 5 minutes
    const expirationMinutes = secureMode === 'true' 
      ? (expiration ? parseInt(expiration) : 5)
      : (24 * 60); // 24 hours for quick share
    
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Process uploaded files
    const processedFiles = uploadedFiles.map(file => {
      const fileName = `${id}_${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      // Move file to permanent location
      fs.renameSync(file.path, filePath);
      files.set(fileName, filePath);

      return {
        fileName: file.originalname,
        fileUrl: `/api/files/${fileName}`,
        fileSize: file.size,
        mimeType: file.mimetype
      };
    });

    const item = {
      id,
      type,
      content: content || undefined,
      files: processedFiles.length > 0 ? processedFiles : undefined,
      pin,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessCount: 0,
      isActive: true
    };

    // Store the item
    const storageKey = pin || 'latest';
    storage.set(storageKey, item);

    res.json({
      id,
      pin,
      url: pin ? `${req.protocol}://${req.get('host')}/pin/${pin}` : `${req.protocol}://${req.get('host')}/latest`,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clipboard/pin/:pin', retrieveLimiter, (req, res) => {
  try {
    const { pin } = req.params;

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({ error: 'Invalid PIN format' });
    }

    const item = storage.get(pin);
    if (!item) {
      return res.status(404).json({ error: 'Content not found or expired' });
    }

    // Check if expired
    if (new Date(item.expiresAt) < new Date()) {
      storage.delete(pin);
      return res.status(404).json({ error: 'Content expired' });
    }

    // Increment access count
    item.accessCount++;
    storage.set(pin, item);

    res.json(item);

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clipboard/latest', retrieveLimiter, (req, res) => {
  try {
    const item = storage.get('latest');
    if (!item) {
      return res.status(404).json({ error: 'No content available' });
    }

    // Check if expired
    if (new Date(item.expiresAt) < new Date()) {
      storage.delete('latest');
      return res.status(404).json({ error: 'Content expired' });
    }

    // Increment access count
    item.accessCount++;
    storage.set('latest', item);

    res.json(item);

  } catch (error) {
    console.error('Retrieve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/files/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = files.get(fileName);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    storage: storage.size,
    files: files.size
  });
});

app.get('/api/clipboard/cleanup', (req, res) => {
  const beforeCount = storage.size;
  cleanupExpired();
  const afterCount = storage.size;
  
  res.json({
    message: 'Cleanup completed',
    removed: beforeCount - afterCount,
    remaining: afterCount
  });
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
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});