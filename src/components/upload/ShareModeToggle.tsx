import React from 'react';
import { Lock, Zap } from 'lucide-react';

interface ShareModeToggleProps {
  secureMode: boolean;
  onChange: (secure: boolean) => void;
}

export const ShareModeToggle: React.FC<ShareModeToggleProps> = ({ 
  secureMode, 
  onChange 
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-1 flex">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-all ${
          !secureMode
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Zap className="w-4 h-4 mr-2" />
        Quick Share
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-all ${
          secureMode
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Lock className="w-4 h-4 mr-2" />
        Secure Share
      </button>
    </div>
  );
};