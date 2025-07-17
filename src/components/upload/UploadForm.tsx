import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { ShareModeToggle } from './ShareModeToggle';
import { ExpirationSelector } from './ExpirationSelector';
import { TextInput } from './TextInput';
import { FileUpload } from './FileUpload';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { useClipboardStore } from '../../store/clipboardStore';
import { ShareResult } from '../../types/clipboard';
import { showToast } from '../../utils/toast';

export const UploadForm: React.FC = () => {
  const [secureMode, setSecureMode] = useState(false);
  const [expiration, setExpiration] = useState(5);
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const { uploadContent, isLoading, error, clearError } = useClipboardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textContent.trim() && files.length === 0) {
      showToast.error('Please enter text or select files to share');
      return;
    }

    try {
      const type = textContent.trim() && files.length > 0 
        ? 'mixed' 
        : textContent.trim() 
          ? 'text' 
          : 'file';

      const result = await uploadContent({
        type,
        content: textContent.trim() || undefined,
        files: files.length > 0 ? files : undefined,
        expiration: secureMode ? expiration : undefined,
        secureMode,
      });

      setShareResult(result);
      showToast.success('Content shared successfully!');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const copyToClipboard = async (text: string, type: 'pin' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'pin') {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
      showToast.success(`${type === 'pin' ? 'PIN' : 'URL'} copied to clipboard!`);
    } catch (error) {
      showToast.error('Failed to copy to clipboard');
    }
  };

  const reset = () => {
    setTextContent('');
    setFiles([]);
    setShareResult(null);
    clearError();
  };

  if (shareResult) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Content Shared Successfully!
            </h2>
            <p className="text-gray-600">
              Your content will expire on {new Date(shareResult.expiresAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            {shareResult.pin && (
              <div className="bg-blue-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-800 mb-2">
                  Your PIN
                </label>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-mono font-bold text-blue-600 tracking-widest">
                    {shareResult.pin}
                  </div>
                  <button
                    onClick={() => copyToClipboard(shareResult.pin!, 'pin')}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    {copiedPin ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share URL
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 font-mono text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                  {shareResult.url}
                </div>
                <button
                  onClick={() => copyToClipboard(shareResult.url, 'url')}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {copiedUrl ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Share Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Share Content
          </h1>
          <p className="text-gray-600">
            Share text and files temporarily with secure PIN protection
          </p>
        </div>

        {error && (
          <ErrorMessage message={error} onClose={clearError} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ShareModeToggle 
            secureMode={secureMode}
            onChange={setSecureMode}
          />

          {secureMode && (
            <ExpirationSelector 
              value={expiration}
              onChange={setExpiration}
            />
          )}

          <TextInput 
            value={textContent}
            onChange={setTextContent}
          />

          <FileUpload 
            files={files}
            onChange={setFiles}
          />

          <button
            type="submit"
            disabled={isLoading || (!textContent.trim() && files.length === 0)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Sharing...</span>
              </div>
            ) : (
              `Share ${secureMode ? 'Securely' : 'Quickly'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};