import React, { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { validatePin } from '../../utils/validation';

interface PinInputProps {
  onSubmit: (pin: string) => void;
  isLoading: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({ onSubmit, isLoading }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePin(pin)) {
      setError('PIN must be 6 digits');
      return;
    }
    
    setError(null);
    onSubmit(pin);
  };

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Enter PIN
        </h2>
        <p className="text-gray-600">
          Enter the 6-digit PIN to access shared content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={pin}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="000000"
            className={`w-full text-center text-3xl font-mono font-bold tracking-widest py-4 px-6 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            maxLength={6}
          />
          {error && (
            <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || pin.length !== 6}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Searching...
            </div>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Get Content
            </>
          )}
        </button>
      </form>
    </div>
  );
};