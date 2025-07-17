import React from 'react';
import { Zap } from 'lucide-react';

interface LatestAccessProps {
  onGetLatest: () => void;
  isLoading: boolean;
}

export const LatestAccess: React.FC<LatestAccessProps> = ({ onGetLatest, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Get Latest
        </h2>
        <p className="text-gray-600">
          Access the most recent quick share content
        </p>
      </div>

      <button
        onClick={onGetLatest}
        disabled={isLoading}
        className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Loading...
          </div>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            Get Latest Content
          </>
        )}
      </button>
    </div>
  );
};