'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B2B]/40 backdrop-blur-xs transition-all duration-300 animate-fadeIn">
      {/* Backdrop click */}
      <div 
        className="absolute inset-0" 
        onClick={closeOnOverlayClick ? onClose : undefined} 
      />
      
      {/* Modal Box */}
      <div className={`relative w-full ${sizeClasses[size]} bg-white border border-[#D5EEF4] rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2F4F7] bg-[#F7FCFD]">
          <h3 className="text-base font-black text-[#0D2439]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] p-2 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content with clean slightly thicker scrollbar */}
        <div className="p-6 overflow-y-auto flex-1 text-[#0D2439] custom-modal-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
