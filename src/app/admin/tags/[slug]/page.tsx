"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Tag, 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  ArrowLeft, 
  Eye,
  FileText,
  Clock,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
  color?: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

interface TagPageData {
  ok: boolean;
  tag: TagData;
  posts: BlogPost[];
  error?: string;
}

export default function AdminTagPage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<TagPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color: '',
    icon: '',
  });
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string>('');
  
  const router = useRouter();

  // Handle async params
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  const fetchTagData = useCallback(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tags/${slug}`);
      const result = await response.json() as TagPageData;
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tag data');
      }
      
      setData(result);
      setEditForm({
        name: result.tag.name,
        description: result.tag.description || '',
        color: result.tag.color || '',
        icon: result.tag.icon || '',
      });
    } catch (err) {
      console.error('Error fetching tag data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTagData();
  }, [slug, fetchTagData]);

  const handleSave = async () => {
    if (!data) return;
    
    setSaving(true);
    try {
      // Get admin token from localStorage if available (optional for development)
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Only add admin token header if we have one
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }
      
      const response = await fetch(`/api/tags/${slug}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update tag');
      }
      
      // If slug changed, navigate to new URL
      if (result.slugChanged && result.newSlug) {
        router.push(`/admin/tags/${result.newSlug}`);
      } else {
        // Refresh data
        await fetchTagData();
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving tag:', err);
      alert(err instanceof Error ? err.message : 'Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromPost = async (postId: string) => {
    if (!data || !confirm('Remove this tag from the post?')) return;
    
    try {
      // Get admin token from localStorage if available (optional for development)
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      
      const headers: HeadersInit = {};
      
      // Only add admin token header if we have one
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }
      
      const response = await fetch(`/api/tags/${slug}/posts/${postId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove tag from post');
      }
      
      // Refresh data
      await fetchTagData();
    } catch (err) {
      console.error('Error removing tag from post:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove tag from post');
    }
  };

  const handleDeleteTag = async () => {
    if (!data || !confirm(`Delete the entire tag "${data.tag.name}" and remove it from all posts?`)) return;
    
    try {
      // Get admin token from localStorage if available (optional for development)
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      
      const headers: HeadersInit = {};
      
      // Only add admin token header if we have one
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }
      
      const response = await fetch(`/api/tags/${slug}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete tag');
      }
      
      // Navigate back to tags list
      router.push('/admin/tags');
    } catch (err) {
      console.error('Error deleting tag:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Tag nicht gefunden
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Der angeforderte Tag konnte nicht gefunden werden.'}
            </p>
            <Link 
              href="/admin/tags" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Tag-Übersicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/admin/tags" 
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Tag-Übersicht
          </Link>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  title="Speichern"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Speichert...' : 'Speichern'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2"
                  title="Abbrechen"
                >
                  <X className="w-4 h-4" />
                  Abbrechen
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  title="Tag bearbeiten"
                >
                  <Edit2 className="w-4 h-4" />
                  Bearbeiten
                </button>
                <button
                  onClick={handleDeleteTag}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  title="Tag löschen"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            data.tag.color 
              ? `bg-[${data.tag.color}] text-white` 
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {data.tag.icon ? (
              <span className="text-lg">{data.tag.icon}</span>
            ) : (
              <Tag className="w-6 h-6" />
            )}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tag Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Tag Name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="🏷️"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Farbe
                    </label>
                    <input
                      type="text"
                      value={editForm.color}
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Beschreibung..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.tag.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>/{data.tag.slug}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(data.tag.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                  <span>{data.posts.length} Beiträge</span>
                </div>
                {data.tag.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {data.tag.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Zugeordnete Beiträge ({data.posts.length})
          </h2>
        </div>
        
        {data.posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Keine Beiträge gefunden</p>
            <p className="text-sm">Dieser Tag ist noch keinem Beitrag zugeordnet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link 
                        href={`/admin/posts/${post.slug || post.id}`} 
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {post.title}
                      </Link>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {post.status === 'published' ? (
                          <><Eye className="w-3 h-3 inline mr-1" />Veröffentlicht</>
                        ) : post.status === 'draft' ? (
                          <><Edit2 className="w-3 h-3 inline mr-1" />Entwurf</>
                        ) : (
                          <><X className="w-3 h-3 inline mr-1" />Archiviert</>
                        )}
                      </span>
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Veröffentlicht: {new Date(post.publishedAt).toLocaleDateString('de-DE')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Aktualisiert: {new Date(post.updatedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromPost(post.id)}
                    className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Tag von diesem Beitrag entfernen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}