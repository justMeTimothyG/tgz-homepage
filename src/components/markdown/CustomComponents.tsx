"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, ExternalLink } from 'lucide-react';
import GcdCalculator from './GcdCalculator';
import LcmCalculator from './LcmCalculator';
import GaussianElimination from './GaussianElimination';
import PascalsTriangle from './PascalsTriangle';
import VennSets from './VennSets';
import Exercise, { Task, Hint, Step, Solution } from './Exercise';
import Download from './Download';

// Callout/Alert Component
export function Callout({ type = 'info', children, title, ...props }: {
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
  title?: string;
}) {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-l-4 border-blue-500',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-100',
      textColor: 'text-blue-800 dark:text-blue-200'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-l-4 border-amber-500',
      icon: AlertCircle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-900 dark:text-amber-100',
      textColor: 'text-amber-800 dark:text-amber-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-l-4 border-red-500',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-900 dark:text-red-100',
      textColor: 'text-red-800 dark:text-red-200'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-l-4 border-green-500',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-900 dark:text-green-100',
      textColor: 'text-green-800 dark:text-green-200'
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} p-4 rounded-lg my-6`} {...props}>
      <div className="flex items-start">
        <div className={`${style.iconColor} mr-3 flex-shrink-0 mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className={`${style.titleColor} font-semibold mb-1`}>
              {title}
            </h4>
          )}
          <div
            className={`${style.textColor} prose prose-sm max-w-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:pl-1`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Code Block with Copy Button
export function CodeBlock({ children, language, title, ...props }: {
  children: React.ReactNode;
  language?: string;
  title?: string;
}) {
  const copyToClipboard = () => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children);
    }
  };

  return (
    <div className="relative my-6 group">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium rounded-t-lg border-b border-gray-700">
          {title}
          {language && (
            <span className="text-gray-400 ml-2">({language})</span>
          )}
        </div>
      )}
      <div className="relative">
        <pre className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${title ? 'rounded-t-none' : 'rounded-lg'}`} {...props}>
          <code className={language ? `language-${language}` : ''}>
            {children}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs"
          title="Copy code"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

// Feature Grid Component
export function FeatureGrid({ children, ...props }: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8" {...props}>
      {children}
    </div>
  );
}

export function FeatureCard({ icon, title, children, color = 'blue', ...props }: {
  icon?: string;
  title: string;
  children: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
}) {
  const colors = {
    blue: 'from-blue-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500', 
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-orange-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-xl text-white`} {...props}>
      <div className="flex items-center mb-3">
        {icon && <span className="text-2xl mr-3">{icon}</span>}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="prose prose-sm prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}

// Timeline Component
export function Timeline({ children, ...props }: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative my-8" {...props}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export function TimelineItem({ title, date, children, ...props }: {
  title: string;
  date?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-10" {...props}>
      <div className="absolute left-2 top-2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          {date && <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {children}
        </div>
      </div>
    </div>
  );
}

// Tabs Component
export function Tabs({ children, defaultTab = 0, ...props }: {
  children: React.ReactNode;
  defaultTab?: number;
}) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const childArray = React.Children.toArray(children) as React.ReactElement<{ label?: string }>[];
  
  return (
    <div className="my-6" {...props}>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        {childArray.map((child, index) => {
          if (React.isValidElement(child) && child.props.label) {
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {child.props.label}
              </button>
            );
          }
          return null;
        })}
      </div>
      <div>
        {childArray.map((child, index) => (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabPanel({ label, children, ...props }: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}

// Stats Component
export function Stats({ children, ...props }: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8" {...props}>
      {children}
    </div>
  );
}

export function Stat({ label, value, trend, ...props }: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center" {...props}>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {label}
        {trend && (
          <span className={`ml-2 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </span>
        )}
      </div>
    </div>
  );
}

// External Link Component
export function ExternalLinkComponent({ href, children, ...props }: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
      <ExternalLink className="w-4 h-4 ml-1" />
    </a>
  );
}

// Export calculator and exercise components
export { GcdCalculator, LcmCalculator, GaussianElimination, PascalsTriangle, VennSets, Exercise, Task, Hint, Step, Solution, Download };
