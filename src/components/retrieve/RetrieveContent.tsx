import React, { useState } from 'react';
import { PinInput } from './PinInput';
import { LatestAccess } from './LatestAccess';
import { ContentDisplay } from './ContentDisplay';
import { ErrorMessage } from '../common/ErrorMessage';
import { useClipboardStore } from '../../store/clipboardStore';
import { ClipboardItem } from '../../types/clipboard';

export const RetrieveContent: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<ClipboardItem | null>(null);
  const { getByPin, getLatest, isLoading, error, clearError } = useClipboardStore();

  const handlePinSubmit = async (pin: string) => {
    const item = await getByPin(pin);
    if (item) {
      setCurrentItem(item);
    }
  };

  const handleGetLatest = async () => {
    const item = await getLatest();
    if (item) {
      setCurrentItem(item);
    }
  };

  const handleBack = () => {
    setCurrentItem(null);
    clearError();
  };

  if (currentItem) {
    return <ContentDisplay item={currentItem} onBack={handleBack} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {error && (
        <ErrorMessage message={error} onClose={clearError} />
      )}
      
      <PinInput 
        onSubmit={handlePinSubmit}
        isLoading={isLoading}
      />
      
      <div className="text-center">
        <div className="inline-flex items-center">
          <div className="h-px bg-gray-300 w-16"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="h-px bg-gray-300 w-16"></div>
        </div>
      </div>
      
      <LatestAccess 
        onGetLatest={handleGetLatest}
        isLoading={isLoading}
      />
    </div>
  );
};