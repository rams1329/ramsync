import React from 'react';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  toastId: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({ message, type, toastId }) => {
  const handleClose = () => {
    toast.dismiss(toastId);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />;
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className={`${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg max-w-sm flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-black hover:bg-opacity-10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}; 