"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RevealableTableProps {
  headers: string[];
  data: Array<{
    label: string;
    values: Array<string | null>;
  }>;
  className?: string;
}

export default function RevealableTable({ headers, data, className = '' }: RevealableTableProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`not-prose my-6 ${className}`}>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setRevealed(!revealed)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={revealed ? "Antworten verbergen" : "Antworten anzeigen"}
        >
          {revealed ? (
            <>
              <EyeOff className="w-4 h-4" />
              Antworten verbergen
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Antworten anzeigen
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-spacing-0 text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/60 ${idx === 1 ? 'text-left' : 'text-center'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <td className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 text-center">
                  {rowIdx + 1}
                </td>
                <td className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200">
                  {row.label}
                </td>
                {row.values.map((value, valIdx) => (
                  <td
                    key={valIdx}
                    className="px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 text-center"
                  >
                    {revealed && value ? (
                      <span className="font-medium">{value}</span>
                    ) : (
                      <span className="text-transparent select-none">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
