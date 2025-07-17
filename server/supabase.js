import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://effdqvvwbkcwnclrmjzv.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmRxdnZ3Ymtjd25jbHJtanp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMxNTMsImV4cCI6MjA2ODIxOTE1M30.yhV2aifvAYKVZx1diA8X6EQGTGylpzXTGJd0hUqjP2U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  CLIPBOARD_ITEMS: 'clipboard_items',
  FILES: 'clipboard_files'
};

// Storage bucket name
export const STORAGE_BUCKET = 'clipboard-files'; 