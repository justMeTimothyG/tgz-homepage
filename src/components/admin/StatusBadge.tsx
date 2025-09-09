"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'archived';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const baseClasses = cn(
    'inline-flex items-center font-medium rounded-full',
    size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
  );

  const statusClasses = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  };

  const statusIcons = {
    draft: '●',
    published: '●',
    archived: '●',
  };

  return (
    <span className={cn(baseClasses, statusClasses[status])}>
      <span className="mr-1 opacity-70">
        {statusIcons[status]}
      </span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}