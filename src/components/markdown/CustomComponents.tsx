"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, ExternalLink, icons, type LucideProps } from 'lucide-react';
import GcdCalculator from './GcdCalculator';
import LcmCalculator from './LcmCalculator';
import GaussianElimination from './GaussianElimination';
import PascalsTriangle from './PascalsTriangle';
import VennSets from './VennSets';
import Download from './Download';
import RevealableTable from './RevealableTable';
import TAccount from './TAccount';
import TAccountLedger from './TAccountLedger';

// Utility: merge class names
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

type TableLines = 'none' | 'horizontal' | 'vertical' | 'both';
type TableAlign = 'left' | 'center' | 'right';

type TableEnhanceOptions = {
  lines: TableLines;
  align: TableAlign;
  dense: boolean;
};

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: TableLines;
  align?: TableAlign;
  dense?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type IconRegistry = typeof icons;
type IconName = keyof IconRegistry;

function normalizeIconName(rawName?: string): IconName | undefined {
  if (!rawName) return undefined;
  const trimmed = rawName.trim();
  if (!trimmed) return undefined;

  if (trimmed in icons) {
    return trimmed as IconName;
  }

  const camelized = trimmed
    .toLowerCase()
    .replace(/[\s_-]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^\w/, (char) => char.toUpperCase());
  if (camelized in icons) {
    return camelized as IconName;
  }

  const pascal = trimmed
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
  if (pascal in icons) {
    return pascal as IconName;
  }

  return undefined;
}

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  label?: string;
  fallback?: React.ReactNode;
}

export function Icon({ name, label, fallback = null, className, size, ...rest }: IconProps) {
  const iconName = normalizeIconName(name);
  const LucideIcon = iconName ? icons[iconName] : undefined;

  if (!LucideIcon) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Icon "${name}" could not be found in lucide-react.`);
    }
    if (fallback) {
      return (
        <span className={cx('inline-flex items-center justify-center align-[0.125em]', className)}>
          {fallback}
        </span>
      );
    }
    return null;
  }

  const ariaProps =
    label != null && label.trim().length > 0
      ? { role: 'img', 'aria-label': label }
      : { 'aria-hidden': true };

  const hasExplicitColor = className
    ? className.split(/\s+/).some((token) =>
        token.startsWith('text-') || token.startsWith('stroke-') || token.startsWith('fill-')
      )
    : false;

  return (
    <LucideIcon
      {...rest}
      size={size ?? '1em'}
      {...ariaProps}
      className={cx(
        'inline-block h-[1em] w-[1em] align-[0.18em]',
        !hasExplicitColor && 'text-inherit',
        className
      )}
    />
  );
}

function enhanceTableTree(node: React.ReactNode, opts: TableEnhanceOptions): React.ReactNode {
  const alignMap: Record<TableAlign, string[]> = {
    left: ['[&>tr>th]:text-left', '[&>tr>td]:text-left'],
    center: ['[&>tr>th]:text-center', '[&>tr>td]:text-center'],
    right: ['[&>tr>th]:text-right', '[&>tr>td]:text-right'],
  };

  const vertHead = opts.lines === 'vertical' || opts.lines === 'both' ? [
    '[&>tr>th:not(:last-child)]:border-r',
    '[&>tr>th:not(:last-child)]:border-gray-200',
    'dark:[&>tr>th:not(:last-child)]:border-gray-700',
  ] : [];

  const vertBody = opts.lines === 'vertical' || opts.lines === 'both' ? [
    '[&>tr>td:not(:last-child)]:border-r',
    '[&>tr>td:not(:last-child)]:border-gray-200',
    'dark:[&>tr>td:not(:last-child)]:border-gray-700',
  ] : [];

  const horizHead = opts.lines === 'horizontal' || opts.lines === 'both' ? [
    '[&>tr]:border-b',
    '[&>tr]:border-gray-200',
    'dark:[&>tr]:border-gray-700',
  ] : [];

  const horizBody = opts.lines === 'horizontal' || opts.lines === 'both' ? [
    '[&>tr:not(:last-child)>td]:border-b',
    '[&>tr:not(:last-child)>td]:border-gray-200',
    'dark:[&>tr:not(:last-child)>td]:border-gray-700',
  ] : [];

  const headPad = opts.dense ? ['[&>tr>th]:px-3', '[&>tr>th]:py-1.5'] : ['[&>tr>th]:px-4', '[&>tr>th]:py-2.5'];
  const bodyPad = opts.dense ? ['[&>tr>td]:px-3', '[&>tr>td]:py-1.5'] : ['[&>tr>td]:px-4', '[&>tr>td]:py-2.5'];

  return React.Children.map(node, (child) => {
    if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) return child;

    const type = typeof child.type === 'string' ? child.type : undefined;
    const addedClasses: string[] = [];

    if (type === 'thead') {
      addedClasses.push(
        '[&>tr>th]:text-xs',
        '[&>tr>th]:font-semibold',
        '[&>tr>th]:uppercase',
        '[&>tr>th]:tracking-wide',
        '[&>tr>th]:text-gray-700',
        'dark:[&>tr>th]:text-gray-300',
        '[&>tr>th]:bg-gray-100',
        'dark:[&>tr>th]:bg-gray-900/60',
        ...headPad,
        ...alignMap[opts.align],
        ...vertHead,
        ...horizHead,
      );
    } else if (type === 'tbody' || type === 'tfoot') {
      addedClasses.push(
        '[&>tr>td]:text-sm',
        '[&>tr>td]:text-gray-800',
        'dark:[&>tr>td]:text-gray-200',
        '[&>tr>td]:align-middle',
        ...bodyPad,
        ...alignMap[opts.align],
        ...vertBody,
        ...horizBody,
      );
    }

    const classAddition = addedClasses.join(' ').trim();
    const mergedClass = classAddition ? cx(child.props.className, classAddition) : child.props.className;
    const enhancedChildren = enhanceTableTree(child.props.children, opts);
    const finalChildren = enhancedChildren === undefined ? child.props.children : enhancedChildren;

    return React.cloneElement(child, { ...child.props, className: mergedClass }, finalChildren);
  });
}

// Table component with configurable borders and alignment
function Table({ lines = 'horizontal', align = 'left', dense = false, className, children, ...rest }: TableProps) {
  const wrapperClass = cx('not-prose overflow-x-auto my-6', className);
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  const tableClass = cx('w-full border-collapse border-spacing-0 text-sm', alignClass);

  const content = enhanceTableTree(children, { align, lines, dense });
  const finalContent = content === undefined ? children : content;

  return (
    <div className={wrapperClass} {...rest}>
      <table className={tableClass}>
        {finalContent}
      </table>
    </div>
  );
}

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

type NumberedListVariant = 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';

export interface NumberedListProps extends React.OlHTMLAttributes<HTMLOListElement> {
  variant?: NumberedListVariant;
  tight?: boolean;
}

type ListVariant = 'disc' | 'circle' | 'square';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: ListVariant;
  tight?: boolean;
}

function NumberedList(props: NumberedListProps) {
  const {
    variant = 'decimal',
    tight = false,
    className = '',
    style,
    start,
    children,
    type: _type,
    ...rest
  } = props;

  const listStyleTypeMap: Record<NumberedListVariant, React.CSSProperties['listStyleType']> = {
    decimal: 'decimal',
    'lower-alpha': 'lower-alpha',
    'upper-alpha': 'upper-alpha',
    'lower-roman': 'lower-roman',
    'upper-roman': 'upper-roman',
  };

  const olTypeAttr: Record<NumberedListVariant, '1' | 'a' | 'A' | 'i' | 'I'> = {
    decimal: '1',
    'lower-alpha': 'a',
    'upper-alpha': 'A',
    'lower-roman': 'i',
    'upper-roman': 'I',
  };

  const spacingClass = tight ? 'space-y-1' : 'space-y-2';
  const mergedClassName = [
    'pl-6 list-outside',
    '[&_.mdx-indent]:ml-2 [&_.mdx-indent]:border-l [&_.mdx-indent]:border-gray-200 dark:[&_.mdx-indent]:border-gray-700/60',
    spacingClass,
    '[&>li]:mr-4',
    className,
  ].filter(Boolean).join(' ');

  const mergedStyle: React.CSSProperties = {
    listStyleType: listStyleTypeMap[variant],
    ...style,
  };

  return (
    <ol
      {...rest}
      start={start}
      type={olTypeAttr[variant]}
      className={mergedClassName}
      style={mergedStyle}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cx((child.props as { className?: string })?.className, 'mdx-indent'),
            })
          : child
      )}
    </ol>
  );
}

function List(props: ListProps) {
  const {
    variant = 'disc',
    tight = false,
    className = '',
    style,
    children,
    ...rest
  } = props;

  const spacingClass = tight ? 'space-y-1' : 'space-y-2';
  const mergedClassName = [
    'pl-6 list-outside',
    '[&_.mdx-indent]:ml-2 [&_.mdx-indent]:border-l [&_.mdx-indent]:border-gray-200 dark:[&_.mdx-indent]:border-gray-700/60',
    spacingClass,
    '[&>li]:mr-4',
    className,
  ].filter(Boolean).join(' ');

  const mergedStyle: React.CSSProperties = {
    listStyleType: variant,
    ...style,
  };

  return (
    <ul
      {...rest}
      className={mergedClassName}
      style={mergedStyle}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cx((child.props as { className?: string })?.className, 'mdx-indent'),
            })
          : child
      )}
    </ul>
  );
}

// Export calculator utilities for reuse
export { GcdCalculator, LcmCalculator, GaussianElimination, PascalsTriangle, VennSets, Download, NumberedList, List, Table, RevealableTable, TAccount, TAccountLedger };
