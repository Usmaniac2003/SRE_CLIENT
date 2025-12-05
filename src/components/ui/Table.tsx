'use client';

import React from 'react';

interface TableProps {
  columns: string[];
  children: React.ReactNode;
}

export function Table({ columns, children }: TableProps) {
  return (
    <div className="overflow-x-auto border border-[#D9E6DF] rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-[#E7F5EF] text-[#1B9C6F]">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="text-left px-4 py-2 font-semibold border-b border-[#D9E6DF]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white text-[#1A1F1C]">{children}</tbody>
      </table>
    </div>
  );
}
