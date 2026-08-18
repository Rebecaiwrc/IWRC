import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2098D1] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';
  
  const variants = {
    primary: 'bg-[#2098D1] hover:bg-[#1883B5] text-white shadow-[#2098D1]/20 hover:shadow-md hover:shadow-[#2098D1]/30 active:scale-[0.98]',
    secondary: 'bg-[#DDF5F9] hover:bg-[#C8EEF5] text-[#136F90] shadow-none hover:text-[#0C5570]',
    outline: 'border-2 border-[#C0E7F0] bg-white hover:bg-[#F2FBFC] text-[#175C7A] hover:border-[#2098D1]',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20',
    ghost: 'bg-transparent hover:bg-[#E5F6F9] text-[#186A88] shadow-none',
    lime: 'bg-[#9ECE42] hover:bg-[#8DBD32] text-white shadow-[#9ECE42]/20'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
