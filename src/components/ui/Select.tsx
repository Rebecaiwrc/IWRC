import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold text-[#144A63]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-[#F7FCFD] border ${
            error
              ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
              : 'border-[#CCEAF1] focus:bg-white focus:border-[#2098D1] focus:ring-2 focus:ring-[#2098D1]/20'
          } rounded-2xl outline-none transition-all duration-200 text-[#0E2439] cursor-pointer disabled:opacity-50 disabled:bg-slate-100 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
