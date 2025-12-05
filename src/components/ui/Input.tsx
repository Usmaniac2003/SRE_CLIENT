'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-[#4A5A52]">{label}</label>}
      <input
        {...props}
        className={`
          border border-[#D9E6DF] rounded-md px-3 py-2 
          bg-white text-[#1A1F1C] placeholder:text-[#8E9C95]
          focus:outline-none focus:ring-2 focus:ring-[#1B9C6F]
          ${className}
        `}
      />
    </div>
  );
}
