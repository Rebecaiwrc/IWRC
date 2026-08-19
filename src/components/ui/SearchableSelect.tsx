'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  emptyText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'Selecione uma opção...',
  searchPlaceholder = 'Digite para pesquisar...',
  options,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  emptyText = 'Nenhum resultado encontrado'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, search]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-[#144A63] dark:text-slate-200">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-2.5 text-sm bg-[#F7FCFD] dark:bg-slate-900 border ${
          error
            ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
            : isOpen
            ? 'border-[#2098D1] ring-2 ring-[#2098D1]/20 bg-white dark:bg-slate-950'
            : 'border-[#CCEAF1] dark:border-slate-800 hover:border-[#2098D1]/60'
        } rounded-2xl outline-none transition-all duration-200 text-left flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption
              ? 'font-semibold text-[#0E2439] dark:text-white'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {selectedOption && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Limpar seleção"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2098D1]' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-[#CCEAF1] dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-[#F7FCFD] dark:bg-slate-950/60">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-[#CCEAF1] dark:border-slate-800 rounded-xl outline-none focus:border-[#2098D1] focus:ring-1 focus:ring-[#2098D1] text-[#0E2439] dark:text-white font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {filteredOptions.length > 0 && (
              <div className="flex justify-between items-center px-1 pt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Resultados: {filteredOptions.length}</span>
                {search && <span className="text-[#2098D1] font-semibold">Filtrado por &quot;{search}&quot;</span>}
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-50 dark:divide-slate-800/40">
            {filteredOptions.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-400">
                <Search size={22} className="mx-auto mb-1.5 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold">{emptyText}</p>
                {search && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tente buscar por outra palavra ou código
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-[#E5F5F8] dark:bg-cyan-950/40 text-[#144A63] dark:text-cyan-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[#0E2439] dark:text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate font-semibold">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={16} className="text-[#2098D1] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 font-medium">{helperText}</p>}
    </div>
  );
};
