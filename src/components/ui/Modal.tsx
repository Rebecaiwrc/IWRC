'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  hasUnsavedChanges?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = false,
  closeOnEsc = false,
  hasUnsavedChanges = false
}) => {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowDiscardConfirm(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, hasUnsavedChanges]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081B2B]/40 backdrop-blur-xs transition-all duration-300 animate-fadeIn">
      {/* Backdrop click - default false across whole system */}
      <div 
        className="absolute inset-0" 
        onClick={closeOnOverlayClick ? handleAttemptClose : undefined} 
      />
      
      {/* Modal Box */}
      <div className={`relative w-full ${sizeClasses[size]} bg-white border border-[#D5EEF4] rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2F4F7] bg-[#F7FCFD]">
          <h3 className="text-base font-black text-[#0D2439]">
            {title}
          </h3>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="text-slate-400 hover:text-[#2098D1] hover:bg-[#E5F5F8] p-2 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content with clean slightly thicker scrollbar */}
        <div className="p-6 overflow-y-auto flex-1 text-[#0D2439] custom-modal-scrollbar">
          {children}
        </div>

        {/* Built-in Unsaved Changes Confirmation Dialog */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-50 bg-[#081B2B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-amber-200 shadow-2xl space-y-4">
              <div className="flex items-start gap-3 text-amber-900">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Informações não salvas</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Existem informações não salvas. Deseja realmente sair?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Continuar preenchendo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Sair sem salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
