import React from 'react';
import { Clipboard, Upload, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'retrieve';
  onTabChange: (tab: 'upload' | 'retrieve') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Clipboard className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">
              RamSync
            </h1>
          </div>
          
          <nav className="flex space-x-1">
            <button
              onClick={() => onTabChange('upload')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={() => onTabChange('retrieve')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'retrieve'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Access
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};