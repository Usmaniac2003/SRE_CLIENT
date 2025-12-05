'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string | number }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-[#4A5A52]">{label}</label>}

      <select
        {...props}
        className={`
          border border-[#D9E6DF] rounded-md px-3 py-2 bg-white
          focus:outline-none focus:ring-2 focus:ring-[#1B9C6F]
          ${className}
        `}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
