'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '@/features/shared/context/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // SVG Round Brazil Flag
  const BrazilFlag = ({ size = 22 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      className="rounded-full shadow-sm ring-1 ring-black/10 shrink-0 inline-block overflow-hidden"
    >
      <circle fill="#009B3A" cx="18" cy="18" r="18" />
      <path fill="#FEDF00" d="M18,3.5 L33,18 L18,32.5 L3,18 Z" />
      <circle fill="#002776" cx="18" cy="18" r="7.5" />
      <path fill="#FFFFFF" d="M10.8,17.5 C12.5,14.5 17,14 24.8,18.8 C24.2,19.8 23.5,20.4 22.8,20.8 C16.5,16.5 12.8,17 10.8,17.5 Z" />
    </svg>
  );

  // SVG Round USA Flag
  const UsaFlag = ({ size = 22 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 36 36" 
      className="rounded-full shadow-sm ring-1 ring-black/10 shrink-0 inline-block overflow-hidden"
    >
      <defs>
        <clipPath id="usa-circle">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#usa-circle)">
        <rect width="36" height="36" fill="#B22234" />
        <path d="M0,2.77 h36 M0,8.31 h36 M0,13.85 h36 M0,19.38 h36 M0,24.92 h36 M0,30.46 h36" stroke="#FFFFFF" strokeWidth="2.77" />
        <rect width="18" height="19.4" fill="#3C3B6E" />
        <circle cx="5" cy="5" r="1" fill="#FFFFFF" />
        <circle cx="13" cy="5" r="1" fill="#FFFFFF" />
        <circle cx="9" cy="9" r="1" fill="#FFFFFF" />
        <circle cx="5" cy="13" r="1" fill="#FFFFFF" />
        <circle cx="13" cy="13" r="1" fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
        title={language === 'pt' ? 'Mudar para Inglês (EN)' : 'Switch to Portuguese (PT)'}
        className={`relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center ${className}`}
      >
        {language === 'pt' ? <BrazilFlag size={24} /> : <UsaFlag size={24} />}
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl ${className}`}>
        <button
          type="button"
          onClick={() => handleSelect('pt')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'pt' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrazilFlag size={20} />
          Português (BR)
        </button>
        <button
          type="button"
          onClick={() => handleSelect('en')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'en' 
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UsaFlag size={20} />
          English (US)
        </button>
      </div>
    );
  }

  // Dropdown Variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm transition-all cursor-pointer"
        title={language === 'pt' ? 'Idioma: Português' : 'Language: English'}
      >
        {language === 'pt' ? <BrazilFlag size={20} /> : <UsaFlag size={20} />}
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          {language === 'pt' ? 'PT-BR' : 'EN'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            {language === 'pt' ? 'Selecionar Idioma' : 'Select Language'}
          </div>

          <button
            type="button"
            onClick={() => handleSelect('pt')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
              language === 'pt'
                ? 'bg-sky-50 text-[#146482] dark:bg-sky-950/40 dark:text-sky-300 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BrazilFlag size={20} />
              <span>Português (Brasil)</span>
            </div>
            {language === 'pt' && <Check size={14} className="text-[#2098D1]" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('en')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-sky-50 text-[#146482] dark:bg-sky-950/40 dark:text-sky-300 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UsaFlag size={20} />
              <span>English (US)</span>
            </div>
            {language === 'en' && <Check size={14} className="text-[#2098D1]" />}
          </button>
        </div>
      )}
    </div>
  );
};
