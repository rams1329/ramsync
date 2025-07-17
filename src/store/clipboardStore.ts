import { create } from 'zustand';
import { ClipboardItem, UploadRequest, ShareResult } from '../types/clipboard';

interface ClipboardStore {
  items: ClipboardItem[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  
  // Actions
  uploadContent: (request: UploadRequest) => Promise<ShareResult>;
  getByPin: (pin: string) => Promise<ClipboardItem | null>;
  getLatest: () => Promise<ClipboardItem | null>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to safely parse JSON response
const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // If not JSON, likely HTML error page
    const text = await response.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error('Server returned HTML instead of JSON. Please ensure the server is running and accessible.');
    }
    throw new Error('Server returned non-JSON response');
  }
  return response.json();
};

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,

  uploadContent: async (request: UploadRequest): Promise<ShareResult> => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    
    try {
      const formData = new FormData();
      formData.append('type', request.type);
      formData.append('secureMode', request.secureMode.toString());
      
      // Only append expiration if it's provided (for secure mode)
      if (request.expiration !== undefined) {
        formData.append('expiration', request.expiration.toString());
      }
      
      if (request.content) {
        formData.append('content', request.content);
      }
      
      if (request.files) {
        request.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }

      const response = await fetch('/api/clipboard/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await parseJsonResponse(response);
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const result = await parseJsonResponse(response);
      set({ isLoading: false, uploadProgress: 100 });
      return result;
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle network errors
      if (errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the server is running.';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        uploadProgress: 0
      });
      throw error;
    }
  },

  getByPin: async (pin: string): Promise<ClipboardItem | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/clipboard/pin/${pin}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await parseJsonResponse(response);
          set({ isLoading: false, error: errorData.error || 'Content not found or expired' });
          return null;
        }
        const errorData = await parseJsonResponse(response);
        throw new Error(errorData.error || 'Failed to retrieve content');
      }

      const item = await parseJsonResponse(response);
      set({ isLoading: false });
      return item;
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle network errors
      if (errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the server is running.';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage
      });
      return null;
    }
  },

  getLatest: async (): Promise<ClipboardItem | null> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/clipboard/latest');
      
      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await parseJsonResponse(response);
          set({ isLoading: false, error: errorData.error || 'No content available' });
          return null;
        }
        const errorData = await parseJsonResponse(response);
        throw new Error(errorData.error || 'Failed to retrieve latest content');
      }

      const item = await parseJsonResponse(response);
      set({ isLoading: false });
      return item;
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle network errors
      if (errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and ensure the server is running.';
      }
      
      set({ 
        isLoading: false, 
        error: errorMessage
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));