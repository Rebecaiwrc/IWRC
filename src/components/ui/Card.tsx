import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#D6EFF5] rounded-3xl p-6 shadow-[0_4px_20px_rgba(32,152,209,0.05)] transition-all duration-200 ${
        onClick ? 'hover:shadow-[0_8px_30px_rgba(32,152,209,0.12)] hover:border-[#2098D1]/40 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
