'use client';

import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  className,
  ...props
}: ButtonProps) {
  const base =
    'px-4 py-2 rounded-md font-medium transition text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#1B9C6F] text-white hover:bg-[#149161]',
    secondary:
      'bg-[#E7F5EF] text-[#1B9C6F] hover:bg-[#D9EFE6]',
    danger:
      'bg-[#E74C3C] text-white hover:bg-[#C0392B]',
    ghost:
      'bg-transparent text-[#1B9C6F] hover:bg-[#F0F5F2]',
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
