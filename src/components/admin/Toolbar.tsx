"use client";

import React from 'react';
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Save,
  Loader2
} from 'lucide-react';

interface ToolbarProps {
  onInsertMarkdown: (markdown: string) => void;
  onSave: () => void;
  saving: boolean;
  hasUnsavedChanges: boolean;
}

export default function Toolbar({ onInsertMarkdown, onSave, saving, hasUnsavedChanges }: ToolbarProps) {
  const toolbarItems = [
    {
      icon: Bold,
      label: 'Bold',
      markdown: '**bold text**',
      shortcut: 'Cmd+B',
    },
    {
      icon: Italic,
      label: 'Italic',
      markdown: '*italic text*',
      shortcut: 'Cmd+I',
    },
    {
      icon: Link,
      label: 'Link',
      markdown: '[link text](https://example.com)',
      shortcut: 'Cmd+K',
    },
    {
      icon: Quote,
      label: 'Quote',
      markdown: '\n> Quote text\n',
    },
    {
      icon: Code,
      label: 'Inline Code',
      markdown: '`code`',
    },
    {
      icon: List,
      label: 'Bullet List',
      markdown: '\n- List item\n- List item\n',
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      markdown: '\n1. List item\n2. List item\n',
    },
    {
      icon: Image,
      label: 'Image',
      markdown: '![Alt text](image-url)',
    },
  ];

  const handleKeyboardShortcut = React.useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey)) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          onInsertMarkdown('**bold text**');
          break;
        case 'i':
          e.preventDefault();
          onInsertMarkdown('*italic text*');
          break;
        case 'k':
          e.preventDefault();
          onInsertMarkdown('[link text](https://example.com)');
          break;
        case 's':
          e.preventDefault();
          onSave();
          break;
      }
    }
  }, [onInsertMarkdown, onSave]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 flex-wrap">
          {toolbarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onInsertMarkdown(item.markdown)}
                title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          
          {/* Code Block */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
          <button
            onClick={() => onInsertMarkdown('\n```javascript\n// Your code here\n```\n')}
            title="Code Block"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <span className="text-xs font-mono">{'{}'}</span>
          </button>

          {/* Headers */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => onInsertMarkdown(`\n${'#'.repeat(level)} Heading ${level}\n`)}
              title={`Heading ${level}`}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <span className="text-xs font-bold">H{level}</span>
            </button>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
            hasUnsavedChanges
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium">Shortcuts:</span>
        <span className="ml-2">Cmd+S Save</span>
        <span className="ml-3">Cmd+B Bold</span>
        <span className="ml-3">Cmd+I Italic</span>
        <span className="ml-3">Cmd+K Link</span>
      </div>
    </div>
  );
}