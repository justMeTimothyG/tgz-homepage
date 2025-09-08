"use client";
import React from 'react';
import Markdown from '@/components/Markdown';

export default function AdminPage() {
  const [slug, setSlug] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [status, setStatus] = React.useState<'draft' | 'published' | 'archived'>('draft');
  const [publishedAt, setPublishedAt] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [content, setContent] = React.useState('# New Post');
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        slug,
        title,
        content,
        excerpt: excerpt || null,
        status,
        publishedAt: publishedAt || null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.NEXT_PUBLIC_ADMIN_TOKEN
            ? { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setResult('Saved: ' + payload.slug);
    } catch (err: unknown) {
      setResult((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6 grid gap-6 md:grid-cols-2">
      <form onSubmit={onSubmit} className="grid gap-4">
        <h1 className="text-xl font-semibold">Create / Edit Post</h1>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Slug</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="border rounded p-2" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded p-2" required />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Excerpt</span>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="border rounded p-2" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Status</span>
            <select
              value={status}
              onChange={(e) => {
                const v = e.target.value;
                if (v === 'draft' || v === 'published' || v === 'archived') {
                  setStatus(v);
                }
              }}
              className="border rounded p-2"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm opacity-70">Published At (YYYY-MM-DD)</span>
            <input value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="border rounded p-2" placeholder="2025-09-06" />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">Tags (comma separated)</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="border rounded p-2" placeholder="personal, updates" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm opacity-70">MDX</span>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={18} className="border rounded p-2 font-mono" />
        </label>
        <button disabled={submitting} className="bg-black text-white rounded p-2 disabled:opacity-50">
          {submitting ? 'Saving…' : 'Save'}
        </button>
        {result && <p className="text-sm">{result}</p>}
      </form>

      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-2">Preview</h2>
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
