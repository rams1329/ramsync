export interface ClipboardItem {
  id: string;
  type: 'text' | 'file' | 'mixed';
  content?: string;
  files?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  pin: string | null;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  isActive: boolean;
}

export interface UploadRequest {
  type: 'text' | 'file' | 'mixed';
  content?: string;
  files?: File[];
  expiration?: number; // minutes - optional for quick share
  secureMode: boolean;
}

export interface ShareResult {
  id: string;
  pin?: string;
  url: string;
  expiresAt: string;
}