// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer = null 
}) => {
  
  // Size classes
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-4xl'
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27 && onClose) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl 
        border border-white/20 w-full ${sizeClasses[size]} max-h-[90vh] 
        overflow-y-auto transform transition-all duration-300 scale-100
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            {title && (
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "ยืนยันการดำเนินการ",
  message = "คุณแน่ใจหรือไม่?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  variant = "danger"
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="small"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">
          {variant === 'danger' ? '⚠️' : '❓'}
        </div>
        <p className="text-white text-lg mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <Button 
            variant="ghost" 
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal
export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "แจ้งเตือน",
  message,
  icon = "ℹ️",
  buttonText = "ตกลง"
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="small"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <p className="text-white text-lg mb-6">{message}</p>
        
        <Button 
          variant="primary" 
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

export default Modal;