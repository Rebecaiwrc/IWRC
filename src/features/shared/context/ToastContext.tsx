'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      {/* Global Toast Container */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none max-w-md w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-fadeIn ${
              t.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-500/40 shadow-emerald-950/20'
                : t.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-500/40 shadow-rose-950/20'
                : 'bg-slate-900/95 text-white border-slate-700/60 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info size={18} className="text-sky-400 shrink-0" />}
              <p className="text-xs font-bold leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback in case it's used outside provider
    return {
      showToast: (msg: string) => console.log('Toast:', msg),
      showSuccess: (msg: string) => console.log('Success Toast:', msg),
      showError: (msg: string) => console.error('Error Toast:', msg),
    };
  }
  return context;
}
