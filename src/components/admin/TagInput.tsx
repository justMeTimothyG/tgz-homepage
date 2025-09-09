"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tag, X, Plus, Search } from 'lucide-react';

interface TagData {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TagInput({ value, onChange, placeholder = "Start typing to search tags...", className = "" }: TagInputProps) {
  const [existingTags, setExistingTags] = useState<TagData[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse value prop into selected tags
  useEffect(() => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    setSelectedTags(tags);
  }, [value]);

  // Fetch existing tags
  const fetchTags = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '100');
      params.set('orderBy', 'usage');

      const response = await fetch(`/api/tags?${params}`);
      const data = await response.json();
      
      if (data.ok) {
        setExistingTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (!inputValue) {
      setFilteredTags(existingTags.slice(0, 10)); // Show top 10 by usage
      return;
    }

    const query = inputValue.toLowerCase();
    const filtered = existingTags
      .filter(tag => 
        tag.name.toLowerCase().includes(query) && 
        !selectedTags.includes(tag.name)
      )
      .slice(0, 10);
    
    setFilteredTags(filtered);
  }, [inputValue, existingTags, selectedTags]);

  // Initial load
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Handle input changes with debouncing
  useEffect(() => {
    if (inputValue) {
      const timer = setTimeout(() => {
        fetchTags(inputValue);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputValue, fetchTags]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    if (!tagName.trim()) return;
    
    const trimmedTag = tagName.trim();
    if (selectedTags.includes(trimmedTag)) return;

    const newTags = [...selectedTags, trimmedTag];
    setSelectedTags(newTags);
    onChange(newTags.join(', '));
    setInputValue('');
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredTags[highlightedIndex]) {
        addTag(filteredTags[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredTags.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspacing in empty input
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const isNewTag = (tagName: string) => {
    return !existingTags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Selected Tags */}
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md ${
              isNewTag(tag)
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            {tag}
            {isNewTag(tag) && <Plus className="w-3 h-3" />}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : "Add more tags..."}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-gray-100"
        />

        {loading && <Search className="w-4 h-4 text-gray-400 animate-pulse" />}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredTags.length > 0 ? (
            <>
              {filteredTags.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between ${
                    index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-900 dark:text-gray-100">{tag.name}</span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tag.postCount} post{tag.postCount !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </>
          ) : inputValue ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-3 h-3 text-green-500" />
                <span>Create new tag: <strong>"{inputValue}"</strong></span>
              </div>
              <div className="text-xs">Press Enter to add</div>
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
              Start typing to search existing tags...
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1">
          <Tag className="w-3 h-3 text-blue-500" />
          Existing tag
        </span>
        <span className="ml-4 inline-flex items-center gap-1">
          <Plus className="w-3 h-3 text-green-500" />
          New tag
        </span>
      </div>
    </div>
  );
}