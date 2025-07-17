import React from 'react';
import { Clock } from 'lucide-react';
import { EXPIRATION_OPTIONS } from '../../utils/constants';

interface ExpirationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

export const ExpirationSelector: React.FC<ExpirationSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <Clock className="w-4 h-4 mr-2" />
        Expires in
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {EXPIRATION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              value === option.value
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};