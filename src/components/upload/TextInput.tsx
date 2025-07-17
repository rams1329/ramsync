import React from 'react';
import { Type } from 'lucide-react';
import { validateText } from '../../utils/validation';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Enter your text here..." 
}) => {
  const error = validateText(value);
  
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Type className="w-4 h-4 mr-2" />
        Text Content
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={6}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {value.length.toLocaleString()} chars
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};