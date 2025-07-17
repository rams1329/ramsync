import { MAX_FILE_SIZE, MAX_TEXT_LENGTH, ALLOWED_FILE_TYPES } from './constants';

export const validateText = (text: string): string | null => {
  if (text.length > MAX_TEXT_LENGTH) {
    return `Text too long. Maximum ${MAX_TEXT_LENGTH / 1000}KB allowed`;
  }
  return null;
};

export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed`;
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `File type "${file.type}" not allowed`;
  }
  
  return null;
};

export const validateFiles = (files: File[]): string | null => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_FILE_SIZE) {
    return `Total file size too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB allowed`;
  }
  
  for (const file of files) {
    const error = validateFile(file);
    if (error) return error;
  }
  
  return null;
};

export const validatePin = (pin: string): boolean => {
  return /^\d{6}$/.test(pin);
};

export const generatePin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};