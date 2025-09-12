"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  components: string[] | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface AdminContextType {
  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  currentView: 'list' | 'edit' | 'create';
  setCurrentView: (view: 'list' | 'edit' | 'create') => void;
  
  // Posts Management
  posts: BlogPost[];
  setPosts: (posts: BlogPost[]) => void;
  selectedPost: BlogPost | null;
  setSelectedPost: (post: BlogPost | null) => void;
  
  // Loading & Error States
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'draft' | 'published' | 'archived';
  setStatusFilter: (status: 'all' | 'draft' | 'published' | 'archived') => void;
  
  // Actions
  refreshPosts: () => Promise<void>;
  selectPostBySlug: (slug: string) => Promise<void>;
  createNewPost: () => void;
  
  // Notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create'>('list');
  
  // Posts Management
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  
  // Toast notifications state (simple implementation)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const refreshPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch('/api/admin/posts', {
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const selectPostBySlug = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch(`/api/admin/posts/${slug}`, {
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      setSelectedPost(data.post);
      setCurrentView('edit');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const createNewPost = () => {
    setSelectedPost(null);
    setCurrentView('create');
  };
  
  const value: AdminContextType = {
    // UI State
    sidebarCollapsed,
    setSidebarCollapsed,
    currentView,
    setCurrentView,
    
    // Posts Management
    posts,
    setPosts,
    selectedPost,
    setSelectedPost,
    
    // Loading & Error States
    loading,
    setLoading,
    error,
    setError,
    
    // Search & Filter
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    
    // Actions
    refreshPosts,
    selectPostBySlug,
    createNewPost,
    
    // Notifications
    showToast,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
      {/* Simple Toast Implementation */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
          toastType === 'success' ? 'bg-green-600' : 
          toastType === 'error' ? 'bg-red-600' : 
          'bg-blue-600'
        }`}>
          {toastMessage}
        </div>
      )}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}