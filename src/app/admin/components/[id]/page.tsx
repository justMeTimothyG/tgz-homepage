"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Edit, 
  Play, 
  Copy, 
  Download, 
  Trash2,
  Code, 
  Package, 
  Globe, 
  Settings,
  Clock,
  BarChart3,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface ComponentData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  sourceType: 'custom' | 'npm' | 'remote' | 'builtin';
  sourceCode?: string;
  npmPackage?: string;
  npmVersion?: string;
  remoteUrl?: string;
  version: string;
  status: 'draft' | 'published' | 'deprecated';
  props?: Record<string, any>;
  config?: Record<string, any>;
  exampleCode?: string;
  thumbnailUrl?: string;
  isInteractive: boolean;
  requiresSandbox: boolean;
  dependencies?: string[];
  bundleSize?: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  versions: ComponentVersion[];
  usage: {
    postCount: number;
    usedInPosts: PostUsage[];
  };
}

interface ComponentVersion {
  id: string;
  version: string;
  sourceCode?: string;
  props?: Record<string, any>;
  config?: Record<string, any>;
  changeNotes?: string;
  createdAt: string;
}

interface PostUsage {
  blogPostId: string;
  componentVersion: string;
  usageCount: number;
  props?: Record<string, any>;
}

export default function ComponentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const componentId = params.id as string;
  
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'usage' | 'versions'>('overview');
  const [_testProps, _setTestProps] = useState('{}');
  const [compilationStatus, setCompilationStatus] = useState<{
    testing: boolean;
    result?: { valid: boolean; error?: string; bundleSize?: number };
  }>({ testing: false });

  // Fetch component data
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/components/${componentId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch component');
        }

        setComponent(data.component);
        _setTestProps(JSON.stringify(data.component.props || {}, null, 2));
      } catch (err) {
        console.error('Error fetching component:', err);
        setError(err instanceof Error ? err.message : 'Failed to load component');
      } finally {
        setLoading(false);
      }
    };

    if (componentId) {
      fetchComponent();
    }
  }, [componentId]);

  // Test compilation
  const testCompilation = async () => {
    if (!component || component.sourceType !== 'custom' || !component.sourceCode) return;

    setCompilationStatus({ testing: true });
    try {
      const response = await fetch(`/api/admin/components/${componentId}?action=test-compile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: component.sourceCode }),
      });

      const data = await response.json();
      setCompilationStatus({ testing: false, result: data.result });
    } catch (error) {
      console.error('Compilation test failed:', error);
      setCompilationStatus({ 
        testing: false, 
        result: { valid: false, error: 'Failed to test compilation' }
      });
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const response = await fetch(`/api/admin/components/${componentId}?action=cache-clear`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.success) {
        alert('Cache cleared successfully');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    }
  };

  // Delete component
  const deleteComponent = async () => {
    if (!confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/components/${componentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/admin/components');
      } else {
        alert(data.error || 'Failed to delete component');
      }
    } catch (error) {
      console.error('Failed to delete component:', error);
      alert('Failed to delete component');
    }
  };

  // Copy usage example
  const copyUsageExample = () => {
    if (!component) return;
    
    const example = component.exampleCode || `<${component.name} ${
      Object.keys(component.props || {}).map(prop => `${prop}=""`).join(' ')
    } />`;
    
    navigator.clipboard.writeText(example);
    alert('Usage example copied to clipboard!');
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'custom': return <Code className="w-5 h-5" />;
      case 'npm': return <Package className="w-5 h-5" />;
      case 'remote': return <Globe className="w-5 h-5" />;
      case 'builtin': return <Settings className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      deprecated: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading component...</span>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Component Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'The component you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.push('/admin/components')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Components
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {getSourceTypeIcon(component.sourceType)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {component.displayName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {component.name}
              </code>
              {getStatusBadge(component.status)}
              <span className="text-sm text-gray-500">v{component.version}</span>
            </div>
            {component.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {component.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={copyUsageExample}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            Copy Usage
          </button>
          
          <button
            onClick={() => router.push(`/admin/components/${componentId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => router.push(`/admin/components/playground?component=${componentId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Play className="w-4 h-4" />
            Test
          </button>

          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Settings className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={clearCache}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Clear Cache
              </button>
              <button
                onClick={deleteComponent}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete Component
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usage Count</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {component.usage.postCount}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Versions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {component.versions.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bundle Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {component.bundleSize ? `${Math.round(component.bundleSize / 1024)}KB` : 'N/A'}
              </p>
            </div>
            <Download className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Used</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {component.lastUsedAt 
                  ? new Date(component.lastUsedAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
            { key: 'code', label: 'Source Code', icon: <Code className="w-4 h-4" /> },
            { key: 'usage', label: 'Usage', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'versions', label: 'Versions', icon: <Package className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Component Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {component.category || 'Uncategorized'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Source Type</dt>
                    <dd className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      {getSourceTypeIcon(component.sourceType)}
                      <span className="capitalize">{component.sourceType}</span>
                    </dd>
                  </div>
                  {component.npmPackage && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">NPM Package</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {component.npmPackage}
                        {component.npmVersion && ` @ ${component.npmVersion}`}
                      </dd>
                    </div>
                  )}
                  {component.remoteUrl && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Remote URL</dt>
                      <dd className="text-sm text-gray-900 dark:text-white break-all">
                        <a 
                          href={component.remoteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {component.remoteUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Interactive</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {component.isInteractive ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Requires Sandbox</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {component.requiresSandbox ? 'Yes' : 'No'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Dependencies</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {component.dependencies && component.dependencies.length > 0 
                        ? component.dependencies.join(', ')
                        : 'None'
                      }
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Props Schema */}
              {component.props && Object.keys(component.props).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Props Schema</h3>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(component.props, null, 2)}</code>
                  </pre>
                </div>
              )}

              {/* Configuration */}
              {component.config && Object.keys(component.config).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(component.config, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Live Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-32">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p>Live preview coming soon</p>
                    <p className="text-sm mt-1">Use the playground to test this component</p>
                  </div>
                </div>
              </div>

              {/* Usage Example */}
              {component.exampleCode && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Usage Example</h3>
                    <button
                      onClick={copyUsageExample}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code>{component.exampleCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Source Code</h3>
                {component.sourceType === 'custom' && (
                  <div className="flex gap-2">
                    <button
                      onClick={testCompilation}
                      disabled={compilationStatus.testing}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {compilationStatus.testing ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Test Compilation
                    </button>
                  </div>
                )}
              </div>

              {/* Compilation Result */}
              {compilationStatus.result && (
                <div className={`mb-4 p-3 rounded-lg ${
                  compilationStatus.result.valid 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {compilationStatus.result.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      compilationStatus.result.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {compilationStatus.result.valid ? 'Compilation successful' : 'Compilation failed'}
                    </span>
                  </div>
                  {compilationStatus.result.error && (
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      {compilationStatus.result.error}
                    </p>
                  )}
                  {compilationStatus.result.bundleSize && (
                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                      Estimated bundle size: {Math.round(compilationStatus.result.bundleSize / 1024)}KB
                    </p>
                  )}
                </div>
              )}

              {component.sourceCode ? (
                <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                  <code>{component.sourceCode}</code>
                </pre>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <Code className="w-8 h-8 mx-auto mb-2" />
                  <p>No source code available</p>
                  <p className="text-sm mt-1">This component uses {component.sourceType} source</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
              
              {component.usage.usedInPosts.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This component is used in {component.usage.postCount} blog post(s):
                  </p>
                  <div className="space-y-2">
                    {component.usage.usedInPosts.map((usage, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <code className="text-sm">{usage.blogPostId}</code>
                          <p className="text-xs text-gray-500 mt-1">
                            Version: {usage.componentVersion} • Used {usage.usageCount} time(s)
                          </p>
                        </div>
                        {usage.props && (
                          <button
                            onClick={() => alert(`Props: ${JSON.stringify(usage.props, null, 2)}`)}
                            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            View Props
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p>This component hasn&apos;t been used in any posts yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Version History</h3>
              
              {component.versions.length > 0 ? (
                <div className="space-y-4">
                  {component.versions.map((version) => (
                    <div key={version.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-semibold">v{version.version}</code>
                            {version.version === component.version && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {new Date(version.createdAt).toLocaleDateString()}
                          </p>
                          {version.changeNotes && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {version.changeNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => alert(`Props: ${JSON.stringify(version.props, null, 2)}`)}
                            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            View Props
                          </button>
                          {version.sourceCode && (
                            <button
                              onClick={() => alert(`Source Code:\n${version.sourceCode}`)}
                              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              View Code
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p>No version history available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}