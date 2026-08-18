import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'emerald';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs';

  const variants = {
    default: 'bg-[#E5F5F8] text-[#146A88] border-[#CAEAF1]',
    success: 'bg-[#EBF7D4] text-[#48780E] border-[#D4EEA0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    info: 'bg-[#DDF4F9] text-[#136F90] border-[#BDE7F0]',
    purple: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
    emerald: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
