"use client";

import React from 'react';
import { DownloadCloud, Loader2, File as FileIcon, AlertCircle, ExternalLink } from 'lucide-react';

type VariantLink = {
  variant: string;
  link: string;
  filetype?: string; // e.g., pdf, png, zip
  fileName?: string;
};

type DownloadProps = (
  | {
      href: string; // single file URL
      variants?: never;
      fileType?: string; // file type label for single file
    }
  | {
      href?: never;
      variants: VariantLink[]; // multiple variants
      fileType?: never; // use per-variant filetype
    }
) & {
  title: string;
  description?: string;
  fileName?: string; // optional override for single file
  accent?: 'blue' | 'green' | 'purple' | 'gray';
};

function guessFileName(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() || 'download';
    return decodeURIComponent(last);
  } catch {
    const parts = url.split('?')[0].split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'download');
  }
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  // content-disposition: attachment; filename="name.ext"; filename*=UTF-8''name.ext
  const matchStar = header.match(/filename\*=(?:UTF-8''|)([^;\n]+)/i);
  if (matchStar && matchStar[1]) return decodeURIComponent(matchStar[1].replace(/"/g, ''));
  const match = header.match(/filename=([^;\n]+)/i);
  if (match && match[1]) return match[1].replace(/"/g, '').trim();
  return null;
}

export default function Download(props: DownloadProps) {
  const { title, description, fileName, accent = 'blue' } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasVariants = Array.isArray((props as any).variants) && (props as any).variants.length > 0;
  const variants = (hasVariants ? (props as any).variants : []) as VariantLink[];
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const activeLink = hasVariants ? variants[Math.min(selectedIndex, Math.max(0, variants.length - 1))]?.link : (props as any).href;
  const activeType = hasVariants ? variants[Math.min(selectedIndex, Math.max(0, variants.length - 1))]?.filetype : (props as any).fileType;
  const activeName = hasVariants
    ? variants[Math.min(selectedIndex, Math.max(0, variants.length - 1))]?.fileName || guessFileName(activeLink || '')
    : (fileName || guessFileName((props as any).href || ''));

  const accentClasses = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-700',
      ring: 'focus:ring-blue-500',
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      button: 'bg-green-600 hover:bg-green-700',
      ring: 'focus:ring-green-500',
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-700',
      ring: 'focus:ring-purple-500',
    },
    gray: {
      icon: 'text-gray-600 dark:text-gray-400',
      badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      button: 'bg-gray-700 hover:bg-gray-800',
      ring: 'focus:ring-gray-500',
    },
  }[accent];

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!activeLink) throw new Error('Kein Link verfügbar');
      const res = await fetch(activeLink, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const cd = filenameFromContentDisposition(res.headers.get('content-disposition'));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cd || activeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback: open in new tab
      setError('Direkter Download fehlgeschlagen. Öffne Datei in neuem Tab.');
      if (activeLink) window.open(activeLink, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 not-prose">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${accentClasses.icon}`}>
          <DownloadCloud className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${accentClasses.badge} whitespace-nowrap flex items-center gap-1`}>
              <FileIcon className="w-3.5 h-3.5" />
              {activeName}
            </span>
            {activeType && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${accentClasses.badge} uppercase tracking-wide`}>{activeType}</span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
          )}
          {hasVariants && variants.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400">Variante:</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {variants.map((v, i) => (
                  <option key={v.variant + i} value={i}>
                    {v.variant}{v.filetype ? ` · ${v.filetype}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded text-white text-sm ${accentClasses.button} disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none ${accentClasses.ring}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
              {loading ? 'Lade…' : 'Download'}
            </button>
            <a
              href={activeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:underline"
            >
              Direktlink <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          {error && (
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
