# 🗄️ Supabase Setup Guide

## 📋 Prerequisites
- Supabase account at [supabase.com](https://supabase.com)
- Your project credentials (you have these)

## 🔧 Step 1: Environment Variables

Create a `.env` file in your project root:

```env
SUPABASE_URL=https://effdqvvwbkcwnclrmjzv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmRxdnZ3Ymtjd25jbHJtanp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMxNTMsImV4cCI6MjA2ODIxOTE1M30.yhV2aifvAYKVZx1diA8X6EQGTGylpzXTGJd0hUqjP2U
NODE_ENV=development
PORT=3001
```

## 🗃️ Step 2: Create Database Tables

1. **Go to your Supabase dashboard**
2. **Click "SQL Editor"**
3. **Copy and paste this SQL script:**

```sql
-- Create clipboard_items table
CREATE TABLE IF NOT EXISTS clipboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'file', 'mixed')),
  content TEXT,
  pin VARCHAR(6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create clipboard_files table
CREATE TABLE IF NOT EXISTS clipboard_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clipboard_item_id UUID REFERENCES clipboard_items(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clipboard_items_pin ON clipboard_items(pin);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_expires_at ON clipboard_items(expires_at);
CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at);
CREATE INDEX IF NOT EXISTS idx_clipboard_files_item_id ON clipboard_files(clipboard_item_id);

-- Create a special row for latest non-PIN item
INSERT INTO clipboard_items (id, type, content, pin, created_at, expires_at, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'text', '', NULL, NOW(), NOW() + INTERVAL '1 day', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE clipboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public access to clipboard_items" ON clipboard_items
  FOR ALL USING (true);

CREATE POLICY "Allow public access to clipboard_files" ON clipboard_files
  FOR ALL USING (true);
```

4. **Click "RUN" to execute the script**

## 📁 Step 3: Create Storage Bucket

1. **Go to "Storage" in Supabase dashboard**
2. **Click "Create a new bucket"**
3. **Bucket name**: `clipboard-files`
4. **Make it Public**: ✅ Check this box
5. **Click "Create bucket"**

## 🔐 Step 4: Create Storage Policies

1. **Click on your `clipboard-files` bucket**
2. **Go to "Policies" tab**
3. **Click "New Policy"**
4. **Select "For full customization"**
5. **Add these policies:**

### Policy 1: Upload Files
```sql
CREATE POLICY "Public can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'clipboard-files');
```

### Policy 2: Download Files
```sql
CREATE POLICY "Public can view files" ON storage.objects
  FOR SELECT USING (bucket_id = 'clipboard-files');
```

### Policy 3: Delete Files
```sql
CREATE POLICY "Public can delete files" ON storage.objects
  FOR DELETE USING (bucket_id = 'clipboard-files');
```

## ✅ Step 5: Test the Setup

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Visit health check:**
   ```
   http://localhost:3000/api/health
   ```

3. **Should return:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-16T...",
     "database": "supabase",
     "storage": "supabase"
   }
   ```

## 🎯 What's Changed

### ✅ **Database**: 
- No more in-memory storage
- All data persists in Supabase PostgreSQL
- Automatic cleanup of expired items

### ✅ **File Storage**: 
- No more local file storage
- Files uploaded to Supabase Storage
- Automatic file cleanup on expiration

### ✅ **Features**:
- All file types supported (.js, .java, etc.)
- Persistent data (survives server restarts)
- Scalable storage
- Automatic expiration cleanup

## 🚀 Deploy to Render

**Environment Variables on Render:**
- `SUPABASE_URL`: `https://effdqvvwbkcwnclrmjzv.supabase.co`
- `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmRxdnZ3Ymtjd25jbHJtanp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMxNTMsImV4cCI6MjA2ODIxOTE1M30.yhV2aifvAYKVZx1diA8X6EQGTGylpzXTGJd0hUqjP2U`
- `NODE_ENV`: `production`
- `PORT`: `3001`

That's it! Your app now uses Supabase for everything! 🎉 