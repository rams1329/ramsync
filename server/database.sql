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
-- This will be updated, not inserted, for quick share items
INSERT INTO clipboard_items (id, type, content, pin, created_at, expires_at, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'text', '', NULL, NOW(), NOW() + INTERVAL '1 day', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE clipboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow public access to clipboard_items" ON clipboard_items
  FOR ALL USING (true);

CREATE POLICY "Allow public access to clipboard_files" ON clipboard_files
  FOR ALL USING (true);

-- Create storage bucket (run this in Supabase dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('clipboard-files', 'clipboard-files', true);

-- Create storage policy for public access
-- CREATE POLICY "Public can upload files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'clipboard-files');

-- CREATE POLICY "Public can view files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'clipboard-files');

-- CREATE POLICY "Public can delete files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'clipboard-files'); 