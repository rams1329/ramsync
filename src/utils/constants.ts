export const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 minute', shortLabel: '1m' },
  { value: 5, label: '5 minutes', shortLabel: '5m' },
  { value: 30, label: '30 minutes', shortLabel: '30m' },
  { value: 480, label: '8 hours', shortLabel: '8h' },
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TEXT_LENGTH = 100000; // 100KB

export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/csv',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';