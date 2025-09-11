"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Package, 
  Code, 
  Globe, 
  Settings,
  Copy,
  Eye,
  Loader2
} from 'lucide-react';

interface Component {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category?: string;
  sourceType: 'custom' | 'npm' | 'remote' | 'builtin';
  version: string;
  thumbnailUrl?: string;
  isInteractive: boolean;
  dependencies?: string[];
  usageCount: number;
  props?: Record<string, any>;
  config?: Record<string, any>;
  exampleCode?: string;
}

interface ComponentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (componentName: string, exampleCode?: string) => void;
}

export default function ComponentSelector({ 
  isOpen, 
  onClose, 
  onSelectComponent 
}: ComponentSelectorProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  // Fetch published components
  useEffect(() => {
    if (isOpen) {
      fetchComponents();
    }
  }, [isOpen, searchTerm, selectedCategory]);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
      });

      const response = await fetch(`/api/components?${params}`);
      const data = await response.json();

      if (data.success || data.ok) {
        setComponents(data.components);
      } else {
        setError(data.error || 'Failed to load components');
      }
    } catch (err) {
      console.error('Error fetching components:', err);
      setError('Failed to load components');
    } finally {
      setLoading(false);
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

  const handleInsertComponent = (component: Component) => {
    const componentTag = component.exampleCode 
      ? component.exampleCode
      : `<${component.name} />`;
    
    onSelectComponent(component.name, componentTag);
    onClose();
  };

  const handlePreviewComponent = (component: Component) => {
    setSelectedComponent(component);
  };

  const categories = [...new Set(components.map(c => c.category).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Component
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar - Component List */}
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Search and Filters */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Component List */}
              <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-600 dark:text-red-400 text-center py-8">
                    {error}
                  </div>
                ) : components.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No components found
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {components.map((component) => (
                      <div
                        key={component.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedComponent?.id === component.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handlePreviewComponent(component)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getSourceTypeIcon(component.sourceType)}
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {component.displayName}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {component.description || 'No description provided'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                v{component.version}
                              </span>
                              {component.category && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {component.category}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Used {component.usageCount} times
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 flex flex-col">
              {selectedComponent ? (
                <>
                  {/* Component Info */}
                  <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      {getSourceTypeIcon(selectedComponent.sourceType)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedComponent.displayName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedComponent.name} v{selectedComponent.version}
                        </p>
                      </div>
                    </div>
                    
                    {selectedComponent.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {selectedComponent.description}
                      </p>
                    )}

                    {/* Component Properties */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Type:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                          {selectedComponent.sourceType}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Interactive:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {selectedComponent.isInteractive ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedComponent.dependencies && selectedComponent.dependencies.length > 0 && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-900 dark:text-white">Dependencies:</span>
                          <div className="mt-1">
                            {selectedComponent.dependencies.map(dep => (
                              <span 
                                key={dep}
                                className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs mr-2 mb-1"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Props Documentation */}
                  <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 350px)' }}>
                    {/* Props */}
                    {selectedComponent.props && Object.keys(selectedComponent.props).length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Props:</h4>
                        <div className="space-y-3">
                          {Object.entries(selectedComponent.props).map(([propName, propConfig]) => (
                            <div key={propName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                    {propName}
                                  </code>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {propConfig.type || 'unknown'}
                                  </span>
                                  {propConfig.required && (
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                      required
                                    </span>
                                  )}
                                  {!propConfig.required && propConfig.optional !== false && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                      optional
                                    </span>
                                  )}
                                </div>
                              </div>
                              {propConfig.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {propConfig.description}
                                </p>
                              )}
                              {propConfig.default !== undefined && (
                                <div className="text-xs text-gray-500">
                                  <strong>Default:</strong> <code>{JSON.stringify(propConfig.default)}</code>
                                </div>
                              )}
                              {propConfig.enum && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <strong>Options:</strong> {propConfig.enum.map((opt: string) => (
                                    <code key={opt} className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded mr-1">
                                      "{opt}"
                                    </code>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Usage Examples */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Usage Examples:</h4>
                      <div className="space-y-4">
                        {selectedComponent.config?.examples?.length > 0 ? (
                          selectedComponent.config?.examples.map((example: any, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {example.title || `Example ${index + 1}`}
                                </h5>
                                {example.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {example.description}
                                  </p>
                                )}
                              </div>
                              <div className="relative">
                                <pre className="bg-gray-100 dark:bg-gray-900 p-3 text-sm overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                                <button
                                  onClick={() => navigator.clipboard.writeText(example.code)}
                                  className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                Basic Usage
                              </h5>
                            </div>
                            <div className="relative">
                              <pre className="bg-gray-100 dark:bg-gray-900 p-3 text-sm overflow-x-auto">
                                <code>{selectedComponent.exampleCode || `<${selectedComponent.name} />`}</code>
                              </pre>
                              <button
                                onClick={() => navigator.clipboard.writeText(
                                  selectedComponent.exampleCode || `<${selectedComponent.name} />`
                                )}
                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                title="Copy to clipboard"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleInsertComponent(selectedComponent)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Insert Component
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Open component playground
                          console.log('Open playground for:', selectedComponent.name);
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Select a component to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}