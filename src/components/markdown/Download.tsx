"use client";

import React from 'react';
import { DownloadCloud, Loader2, AlertCircle } from 'lucide-react';

type VariantLink = {
  variant: string;
  link: string;
  filetype?: string; // e.g., pdf, png, zip
  fileName?: string;
};

type SingleDownloadProps = {
  href: string; // single file URL
  variants?: never;
  fileType?: string; // file type label for single file
};

type VariantsDownloadProps = {
  href?: never;
  variants: VariantLink[]; // multiple variants
  fileType?: never; // use per-variant filetype
};

type CommonProps = {
  title: string;
  description?: string;
  fileName?: string; // optional override for single file
  accent?: 'blue' | 'green' | 'purple' | 'gray';
};

type DownloadProps = (SingleDownloadProps | VariantsDownloadProps) & CommonProps;

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
  const isVariants = (p: DownloadProps): p is VariantsDownloadProps & CommonProps =>
    'variants' in p && Array.isArray((p as VariantsDownloadProps).variants);
  const isSingle = (p: DownloadProps): p is SingleDownloadProps & CommonProps =>
    'href' in p && typeof (p as SingleDownloadProps).href === 'string';

  const hasVariants = isVariants(props);
  const variants: VariantLink[] = hasVariants ? props.variants : [];
  const activeLink: string | undefined = isSingle(props) ? props.href : undefined;
  const fileTypeTag: string | undefined = isSingle(props) ? props.fileType : undefined;
  const activeName = !hasVariants ? (fileName || guessFileName(activeLink || '')) : undefined;

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

  const handleDownload = async (link?: string, nameOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const linkToUse = link ?? activeLink;
      if (!linkToUse) throw new Error('Kein Link verfügbar');
      const res = await fetch(linkToUse, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const cd = filenameFromContentDisposition(res.headers.get('content-disposition'));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const guessed = guessFileName(linkToUse);
      a.download = cd || nameOverride || activeName || guessed;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      setError('Direkter Download fehlgeschlagen. Öffne Datei in neuem Tab.');
      const linkToUse = link ?? activeLink;
      if (linkToUse) window.open(linkToUse, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  // Single file: whole card is a button
  if (!hasVariants) {
    return (
      <button
        onClick={() => handleDownload()}
        disabled={loading}
        className={`w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors cursor-pointer disabled:cursor-not-allowed ${accentClasses.ring}`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${accentClasses.icon}`}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <DownloadCloud className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h3>
              {fileTypeTag && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${accentClasses.badge} uppercase tracking-wide`}>
                  {fileTypeTag}
                </span>
              )}
            </div>
            {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
            {error && (
              <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Variants: list of options with individual download buttons; card itself is not clickable
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-start gap-3 mb-3">
        <div className={`mt-0.5 ${accentClasses.icon}`}>
          <DownloadCloud className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h3>
          </div>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {variants.map((v) => (
          <li key={v.variant + v.link} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{v.variant}</span>
              {v.filetype && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${accentClasses.badge} uppercase tracking-wide`}>{v.filetype}</span>
              )}
            </div>
            <button
              onClick={() => handleDownload(v.link, v.fileName)}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-white text-xs ${accentClasses.button} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DownloadCloud className="w-3.5 h-3.5" />}
              Herunterladen
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
}
