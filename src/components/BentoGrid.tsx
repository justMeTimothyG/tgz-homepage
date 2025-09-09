import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
}

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCard({ 
  title, 
  description, 
  icon: Icon, 
  size = 'medium',
  className,
  children 
}: BentoCardProps) {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-3'
  };

  const heightClasses = {
    small: 'row-span-1',
    medium: 'row-span-1',
    large: 'row-span-1 md:row-span-2'
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6',
      'hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200',
      'flex flex-col justify-between',
      sizeClasses[size],
      heightClasses[size],
      className
    )}>
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr',
      className
    )}>
      {children}
    </div>
  );
}