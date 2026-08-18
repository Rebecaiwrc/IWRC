import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold text-[#144A63]">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-[#F7FCFD] border ${
            error
              ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
              : 'border-[#CCEAF1] focus:bg-white focus:border-[#2098D1] focus:ring-2 focus:ring-[#2098D1]/20'
          } rounded-2xl outline-none transition-all duration-200 text-[#0E2439] placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100 ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-500 font-semibold">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
