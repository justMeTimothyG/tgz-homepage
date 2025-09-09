"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import Markdown from '@/components/Markdown';
import Toolbar from './Toolbar';
import StatusBadge from './StatusBadge';
import TagInput from './TagInput';
import { formatDateTime } from '@/lib/utils';
import { Calendar, Tag, FileText } from 'lucide-react';

interface PostEditorProps {
  isNewPost?: boolean;
}

export default function PostEditor({ isNewPost = false }: PostEditorProps) {
  const {
    selectedPost,
    showToast,
    setCurrentView
  } = useAdmin();

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '# New Post\n\nStart writing your post here...',
    status: 'draft' as 'draft' | 'published' | 'archived',
    publishedAt: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load post data
  useEffect(() => {
    if (selectedPost && !isNewPost) {
      setFormData({
        slug: selectedPost.slug,
        title: selectedPost.title,
        excerpt: selectedPost.excerpt || '',
        content: selectedPost.content,
        status: selectedPost.status,
        publishedAt: selectedPost.publishedAt 
          ? new Date(selectedPost.publishedAt).toISOString().split('T')[0] 
          : '',
        tags: selectedPost.tags.map(tag => tag.name),
      });
      setTagInput(selectedPost.tags.map(tag => tag.name).join(', '));
      setHasUnsavedChanges(false);
    } else if (isNewPost) {
      // Reset form for new post
      setFormData({
        slug: '',
        title: '',
        excerpt: '',
        content: '# New Post\n\nStart writing your post here...',
        status: 'draft',
        publishedAt: '',
        tags: [],
      });
      setTagInput('');
      setHasUnsavedChanges(false);
    }
  }, [selectedPost, isNewPost]);

  // Track changes
  useEffect(() => {
    const originalData = selectedPost ? {
      slug: selectedPost.slug,
      title: selectedPost.title,
      excerpt: selectedPost.excerpt || '',
      content: selectedPost.content,
      status: selectedPost.status,
      publishedAt: selectedPost.publishedAt 
        ? new Date(selectedPost.publishedAt).toISOString().split('T')[0] 
        : '',
      tags: selectedPost.tags.map(tag => tag.name),
    } : null;

    if (originalData && selectedPost) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData) ||
                        tagInput !== selectedPost.tags.map(tag => tag.name).join(', ');
      setHasUnsavedChanges(hasChanged);
    } else {
      // For new posts, check if any field has been modified from defaults
      const hasChanged = formData.slug !== '' || 
                        formData.title !== '' || 
                        formData.excerpt !== '' || 
                        formData.content !== '# New Post\n\nStart writing your post here...' ||
                        tagInput !== '';
      setHasUnsavedChanges(hasChanged);
    }
  }, [formData, tagInput, selectedPost]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && (isNewPost || !selectedPost)) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (generatedSlug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
      }
    }
  }, [formData.title, formData.slug, isNewPost, selectedPost]);

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      showToast('Please fill in title and content', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const payload = {
        slug: formData.slug,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        status: formData.status,
        publishedAt: formData.publishedAt || null,
        tags: tagsArray,
        ...(selectedPost && !isNewPost ? { newSlug: formData.slug } : {}),
      };

      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const url = isNewPost 
        ? '/api/admin/posts'
        : `/api/admin/posts/${selectedPost?.slug}`;
      
      const method = isNewPost ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'content-type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save post');
      }

      showToast(`Post ${isNewPost ? 'created' : 'updated'} successfully`, 'success');
      setHasUnsavedChanges(false);
      
      // Navigate back to list (user can manually refresh if needed)
      setCurrentView('list');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const insertMarkdown = (markdown: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = formData.content.substring(0, start) + markdown + formData.content.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isNewPost ? 'Create New Post' : 'Edit Post'}
            </h1>
            {selectedPost && !isNewPost && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDateTime(selectedPost.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Updated {formatDateTime(selectedPost.updatedAt)}</span>
                </div>
                <StatusBadge status={selectedPost.status} />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Unsaved changes
              </span>
            )}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <Toolbar
          onInsertMarkdown={insertMarkdown}
          onSave={handleSave}
          saving={submitting}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-1 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Status & Publish Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'draft' | 'published' | 'archived' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <TagInput
                value={tagInput}
                onChange={setTagInput}
                placeholder="Start typing to search or create tags..."
              />
            </div>
          </div>

          {/* Content Editor/Preview */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            
            {previewMode ? (
              <div className="min-h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                <div className="prose dark:prose-invert max-w-none">
                  <Markdown>{formData.content}</Markdown>
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                required
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}