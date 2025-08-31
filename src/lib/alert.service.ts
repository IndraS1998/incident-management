// src/lib/alert.service.ts
import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 7000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const alertService = {
    success: (message: string, options?: ToastOptions) => {
      toast.success(message, { ...defaultOptions, ...options });
    },
    error: (message: string, options?: ToastOptions) => {
      toast.error(message, { ...defaultOptions, ...options });
    },
    info: (message: string, options?: ToastOptions) => {
      toast.info(message, { ...defaultOptions, ...options });
    },
    warning: (message: string, options?: ToastOptions) => {
      toast.warning(message, { ...defaultOptions, ...options });
    },
    dismiss: (id?: string) => {
      toast.dismiss(id);
    }
};