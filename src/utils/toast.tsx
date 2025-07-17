import React from 'react';
import toast from 'react-hot-toast';
import { CustomToast } from '../components/common/CustomToast';

export const showToast = {
  success: (message: string) => {
    return toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="success" 
        toastId={t.id} 
      />
    ), {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  error: (message: string) => {
    return toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="error" 
        toastId={t.id} 
      />
    ), {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  info: (message: string) => {
    return toast.custom((t) => (
      <CustomToast 
        message={message} 
        type="info" 
        toastId={t.id} 
      />
    ), {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  
  dismissAll: () => {
    toast.dismiss();
  }
}; 