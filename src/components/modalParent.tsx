import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  width?: string;
  height?: string;
  maxHeight?: string;
  showCloseButton?: boolean;
  onReset?: () => void;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  width,
  height,
  maxHeight = '90vh',
  showCloseButton = true,
  onReset,
  className = '',
  overlayClassName = '',
  contentClassName = ''
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onReset?.();
    onClose();
  };

  // Size mappings
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    fullscreen: 'max-w-full mx-8'
  };

  const modalWidth = width || sizeClasses[size];
  const modalHeight = height || (size === 'fullscreen' ? '95vh' : 'auto');

  return (
    <div className={`fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50 mt-20 ${overlayClassName}`}>
      <div 
        className={`
          bg-white rounded-lg shadow-lg p-6 w-full 
          ${modalWidth} 
          border border-[#F6F6F8]
          ${className}
        `}
        style={{ 
          height: modalHeight,
          maxHeight: size === 'fullscreen' ? '95vh' : maxHeight 
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {showCloseButton && (
            <button 
              onClick={handleClose}
              className="text-[#232528] hover:text-[#FFA400] cursor-pointer ml-4 flex-shrink-0"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className={`overflow-y-auto h-full ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;