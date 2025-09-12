"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Package,
  Code,
  Globe,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  sourceType: 'custom' | 'npm' | 'remote' | 'builtin';
  version: string;
  status: 'draft' | 'published' | 'deprecated';
  isPublished: boolean;
  thumbnailUrl?: string;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComponentsResponse {
  success: boolean;
  components: ComponentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ComponentStudioPage() {
  const router = useRouter();
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // UI state
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch components
  const fetchComponents = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(sourceTypeFilter && { sourceType: sourceTypeFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch(`/api/admin/components?${params}`, {
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });
      const data: ComponentsResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch components');
      }

      setComponents(data.components);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load components');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh on filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchComponents(1);
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter, sourceTypeFilter, statusFilter]);

  // Handle component actions
  const handleDelete = async (componentId: string) => {
    if (!confirm('Are you sure you want to delete this component?')) return;

    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });

      if (response.ok) {
        fetchComponents(currentPage);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete component');
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      alert('Failed to delete component');
    }
  };

  const handleBulkStatusUpdate = async (status: 'draft' | 'published' | 'deprecated') => {
    if (selectedComponents.length === 0) return;

    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }

      const response = await fetch('/api/admin/components?action=bulk-status', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          componentIds: selectedComponents,
          status,
        }),
      });

      if (response.ok) {
        setSelectedComponents([]);
        fetchComponents(currentPage);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update components');
      }
    } catch (error) {
      console.error('Error updating components:', error);
      alert('Failed to update components');
    }
  };

  const handleSyncComponents = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      
      const response = await fetch('/api/admin/components/sync', {
        method: 'POST',
        credentials: 'include', // Include cookies for session authentication
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        // Refresh the component list
        fetchComponents(currentPage);
      } else {
        // Show specific error message from server
        const errorMsg = data.error || data.message || 'Unknown error';
        alert(`❌ Sync failed: ${errorMsg}`);
        
        // If it's an auth error, suggest logging in
        if (response.status === 401) {
          console.log('Authentication failed. Please log in to continue.');
        }
      }
    } catch (error) {
      console.error('Error syncing components:', error);
      alert('❌ Sync failed: Network error');
    } finally {
      setIsSyncing(false);
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'custom': return <Code className="w-4 h-4" />;
      case 'npm': return <Package className="w-4 h-4" />;
      case 'remote': return <Globe className="w-4 h-4" />;
      case 'builtin': return <Settings className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      deprecated: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  if (loading && components.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading components...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Component Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and test your dynamic components</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleSyncComponents}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Components'}
          </button>
          
          <button
            onClick={() => router.push('/admin/components/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Component
          </button>
          
          <button
            onClick={() => router.push('/admin/components/playground')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Playground
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <select
          value={sourceTypeFilter}
          onChange={(e) => setSourceTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Sources</option>
          <option value="custom">Custom</option>
          <option value="npm">NPM</option>
          <option value="remote">Remote</option>
          <option value="builtin">Built-in</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="deprecated">Deprecated</option>
        </select>

        <input
          type="text"
          placeholder="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComponents.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedComponents.length} component(s) selected
          </span>
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkStatusUpdate('published')}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('draft')}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('deprecated')}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Deprecate
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchComponents(currentPage)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Components Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              selected={selectedComponents.includes(component.id)}
              onSelect={(selected) => {
                setSelectedComponents(prev =>
                  selected 
                    ? [...prev, component.id]
                    : prev.filter(id => id !== component.id)
                );
              }}
              onEdit={() => router.push(`/admin/components/${component.id}/edit`)}
              onView={() => router.push(`/admin/components/${component.id}`)}
              onDelete={() => handleDelete(component.id)}
              getSourceTypeIcon={getSourceTypeIcon}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ComponentTable
            components={components}
            selectedComponents={selectedComponents}
            onSelectAll={(selected) => {
              setSelectedComponents(selected ? components.map(c => c.id) : []);
            }}
            onSelect={(componentId, selected) => {
              setSelectedComponents(prev =>
                selected 
                  ? [...prev, componentId]
                  : prev.filter(id => id !== componentId)
              );
            }}
            onEdit={(id) => router.push(`/admin/components/${id}/edit`)}
            onView={(id) => router.push(`/admin/components/${id}`)}
            onDelete={handleDelete}
            getSourceTypeIcon={getSourceTypeIcon}
            getStatusBadge={getStatusBadge}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && components.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No components found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter || sourceTypeFilter || statusFilter
              ? 'Try adjusting your filters or search term.'
              : 'Get started by creating your first component.'
            }
          </p>
          <button
            onClick={() => router.push('/admin/components/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Component
          </button>
        </div>
      )}
    </div>
  );
}

// Component Card for Grid View
function ComponentCard({ 
  component, 
  selected, 
  onSelect, 
  onEdit, 
  onView, 
  onDelete,
  getSourceTypeIcon,
  getStatusBadge
}: {
  component: ComponentItem;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  getSourceTypeIcon: (sourceType: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
      selected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="mt-1"
        />
        <div className="flex items-center gap-1">
          {getSourceTypeIcon(component.sourceType)}
          <span className="text-xs text-gray-500">{component.sourceType}</span>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="mb-3">
        {component.thumbnailUrl ? (
          <img
            src={component.thumbnailUrl}
            alt={component.displayName}
            className="w-full h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
          />
        ) : (
          <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Code className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
          {component.displayName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {component.description || 'No description provided'}
        </p>
        
        <div className="flex items-center justify-between">
          {getStatusBadge(component.status)}
          <span className="text-xs text-gray-500">v{component.version}</span>
        </div>

        <div className="text-xs text-gray-500">
          Used {component.usageCount} times
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Edit className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Component Table for List View
function ComponentTable({ 
  components,
  selectedComponents,
  onSelectAll,
  onSelect,
  onEdit,
  onView,
  onDelete,
  getSourceTypeIcon,
  getStatusBadge
}: {
  components: ComponentItem[];
  selectedComponents: string[];
  onSelectAll: (selected: boolean) => void;
  onSelect: (componentId: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  getSourceTypeIcon: (sourceType: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  const allSelected = components.length > 0 && selectedComponents.length === components.length;
  const someSelected = selectedComponents.length > 0 && selectedComponents.length < components.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left p-4">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="text-left p-4">Component</th>
            <th className="text-left p-4">Source</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Version</th>
            <th className="text-left p-4">Usage</th>
            <th className="text-left p-4">Updated</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr 
              key={component.id}
              className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedComponents.includes(component.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(component.id)}
                  onChange={(e) => onSelect(component.id, e.target.checked)}
                />
              </td>
              <td className="p-4">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {component.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {component.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {component.description}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {getSourceTypeIcon(component.sourceType)}
                  <span className="capitalize">{component.sourceType}</span>
                </div>
              </td>
              <td className="p-4">
                {getStatusBadge(component.status)}
              </td>
              <td className="p-4">
                <code className="text-sm">{component.version}</code>
              </td>
              <td className="p-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {component.usageCount} times
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(component.updatedAt).toLocaleDateString()}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onView(component.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(component.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(component.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}