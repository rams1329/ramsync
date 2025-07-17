import React, { useState } from 'react';
import { Copy, Download, File, Clock, Check } from 'lucide-react';
import { ClipboardItem } from '../../types/clipboard';
import { formatFileSize } from '../../utils/validation';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface ContentDisplayProps {
  item: ClipboardItem;
  onBack: () => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ item, onBack }) => {
  const [copiedText, setCopiedText] = useState(false);
  
  const copyText = async () => {
    if (!item.content) return;
    
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      toast.success('Text copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeRemaining = formatDistanceToNow(new Date(item.expiresAt), { addSuffix: true });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Shared Content
              </h2>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Expires {timeRemaining}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === 'text' 
                  ? 'bg-blue-100 text-blue-800'
                  : item.type === 'file'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
              }`}>
                {item.type === 'mixed' ? 'Text + Files' : item.type}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {item.content && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Text Content</h3>
                <button
                  onClick={copyText}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {copiedText ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copiedText ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {item.content}
                </pre>
              </div>
            </div>
          )}

          {item.files && item.files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Files ({item.files.length})
              </h3>
              <div className="space-y-2">
                {item.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center min-w-0">
                      <File className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)} • {file.mimeType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(file.fileUrl, file.fileName)}
                      className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t">
          <button
            onClick={onBack}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Back to Access
          </button>
        </div>
      </div>
    </div>
  );
};