'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck, FiClock, FiPackage, FiAlertTriangle } from 'react-icons/fi';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '' 
}) => {
  // Handle escape key and prevent body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  loadingText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
  loadingText = 'Processing...'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FiX className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <FiAlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <FiPackage className="w-6 h-6 text-blue-600" />;
      default:
        return <FiX className="w-6 h-6 text-red-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-red-100';
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${getIconBg()} rounded-full flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        {message}
      </p>
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${getConfirmButtonStyle()}`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {loadingText}
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </BaseModal>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'Got it'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="w-6 h-6 text-green-600" />;
      case 'error':
        return <FiX className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <FiClock className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <FiPackage className="w-6 h-6 text-blue-600" />;
      default:
        return <FiPackage className="w-6 h-6 text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-blue-900';
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${getIconBg()} rounded-full flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${getTitleColor()}`}>{title}</h3>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        {message}
      </p>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg text-white transition-colors duration-200 ${getButtonStyle()}`}
        >
          {buttonText}
        </button>
      </div>
    </BaseModal>
  );
};

// Hook for easier modal management
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalData, setModalData] = React.useState<any>(null);

  const openModal = (data?: any) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal
  };
};
