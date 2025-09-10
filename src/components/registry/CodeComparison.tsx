"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeComparisonProps {
  title?: string;
  beforeTitle?: string;
  afterTitle?: string;
  beforeCode: string;
  afterCode: string;
  language?: string;
  showDiff?: boolean;
}

export default function CodeComparison({
  title = "Code Comparison",
  beforeTitle = "Before",
  afterTitle = "After",
  beforeCode,
  afterCode,
  language = "javascript",
  showDiff = false
}: CodeComparisonProps) {
  const [activeTab, setActiveTab] = useState<'before' | 'after' | 'diff'>('before');
  const [copiedSide, setCopiedSide] = useState<'before' | 'after' | null>(null);

  const copyToClipboard = async (code: string, side: 'before' | 'after') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatCode = (code: string) => {
    // Simple syntax highlighting for demonstration
    // In production, you'd use a proper syntax highlighter
    if (!code || typeof code !== 'string') {
      return (
        <div className="table-row">
          <div className="table-cell pr-4 text-gray-500 dark:text-gray-400 text-right select-none w-8 text-xs">
            1
          </div>
          <div className="table-cell">
            <pre className="text-sm text-gray-500 italic">No code provided</pre>
          </div>
        </div>
      );
    }
    
    return code
      .split('\n')
      .map((line, index) => (
        <div key={index} className="table-row">
          <div className="table-cell pr-4 text-gray-500 dark:text-gray-400 text-right select-none w-8 text-xs">
            {index + 1}
          </div>
          <div className="table-cell">
            <pre className="text-sm">{line || ' '}</pre>
          </div>
        </div>
      ));
  };

  const renderDiff = () => {
    const beforeLines = (beforeCode || '').split('\n');
    const afterLines = (afterCode || '').split('\n');
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">- {beforeTitle}</div>
          {Array.from({ length: maxLines }, (_, i) => (
            <div key={`before-${i}`} className="flex">
              <div className="w-8 text-gray-500 dark:text-gray-400 text-right text-xs pr-2">
                {beforeLines[i] !== undefined ? i + 1 : ''}
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-sm flex-1 min-h-[1.5rem]">
                {beforeLines[i] || ''}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">+ {afterTitle}</div>
          {Array.from({ length: maxLines }, (_, i) => (
            <div key={`after-${i}`} className="flex">
              <div className="w-8 text-gray-500 dark:text-gray-400 text-right text-xs pr-2">
                {afterLines[i] !== undefined ? i + 1 : ''}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-sm flex-1 min-h-[1.5rem]">
                {afterLines[i] || ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg my-4 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        
        {/* Tabs */}
        <div className="flex mt-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('before')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'before'
                ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {beforeTitle}
          </button>
          <button
            onClick={() => setActiveTab('after')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'after'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {afterTitle}
          </button>
          {showDiff && (
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'diff'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Diff
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === 'diff' && showDiff ? (
          <div className="p-4">
            {renderDiff()}
          </div>
        ) : (
          <>
            {activeTab === 'before' && (
              <div className="relative">
                <div className="bg-gray-900 text-gray-100 p-4 table">
                  {formatCode(beforeCode)}
                </div>
                <button
                  onClick={() => copyToClipboard(beforeCode, 'before')}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
                  title={copiedSide === 'before' ? 'Copied!' : 'Copy code'}
                >
                  {copiedSide === 'before' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {activeTab === 'after' && (
              <div className="relative">
                <div className="bg-gray-900 text-gray-100 p-4 table">
                  {formatCode(afterCode)}
                </div>
                <button
                  onClick={() => copyToClipboard(afterCode, 'after')}
                  className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
                  title={copiedSide === 'after' ? 'Copied!' : 'Copy code'}
                >
                  {copiedSide === 'after' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
        Code Comparison Component • Language: {language} • Click tabs to switch views
      </div>
    </div>
  );
}