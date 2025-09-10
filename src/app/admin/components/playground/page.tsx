"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Play, 
  RefreshCw, 
  Settings, 
  Code, 
  Eye, 
  Copy, 
  Save,
  AlertCircle,
  CheckCircle,
  Package,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import DynamicMarkdown from '@/components/DynamicMarkdown';
import { ComponentDefinition } from '@/services/componentRegistry';

interface PlaygroundComponent extends ComponentDefinition {
  displayName: string;
  description?: string;
  exampleCode?: string;
  props?: Record<string, any>;
  config?: Record<string, any>;
}

export default function ComponentPlaygroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialComponentId = searchParams.get('component');
  
  const [availableComponents, setAvailableComponents] = useState<PlaygroundComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PlaygroundComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Playground state
  const [testProps, setTestProps] = useState('{}');
  const [propsError, setPropsError] = useState<string | null>(null);
  const [testContent, setTestContent] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [darkMode, setDarkMode] = useState(false);
  
  // Render state
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Fetch available components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/components?status=published&limit=100');
        const data = await response.json();

        if (data.success) {
          const components = data.components.map((comp: any) => ({
            id: comp.id,
            name: comp.name,
            displayName: comp.displayName,
            description: comp.description,
            version: comp.version,
            sourceType: comp.sourceType,
            sourceCode: comp.sourceCode,
            npmPackage: comp.npmPackage,
            npmVersion: comp.npmVersion,
            remoteUrl: comp.remoteUrl,
            dependencies: comp.dependencies,
            props: comp.props || {},
            config: comp.config || {},
            exampleCode: comp.exampleCode,
            requiresSandbox: comp.requiresSandbox,
          }));

          setAvailableComponents(components);

          // Auto-select component if specified in URL
          if (initialComponentId) {
            const component = components.find((c: any) => c.id === initialComponentId);
            if (component) {
              selectComponent(component);
            }
          }
        } else {
          setError('Failed to fetch components');
        }
      } catch (err) {
        console.error('Error fetching components:', err);
        setError('Failed to load components');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [initialComponentId]);

  // Select component and initialize test content
  const selectComponent = useCallback((component: PlaygroundComponent) => {
    setSelectedComponent(component);
    setTestProps(JSON.stringify(component.props || {}, null, 2));
    setPropsError(null);
    setRenderError(null);
    
    // Create test content with component
    const componentTag = `<${component.name} ${
      Object.keys(component.props || {})
        .map(prop => `${prop}="${(component.props as any)?.[prop] || ''}"`)
        .join(' ')
    } />`;
    
    setTestContent(
      component.exampleCode || 
      `# Testing ${component.displayName}\n\nHere's the component in action:\n\n${componentTag}\n\n## Description\n\n${component.description || 'No description available.'}`
    );
  }, []);

  // Validate and update props
  const updateTestProps = useCallback((propsJson: string) => {
    setTestProps(propsJson);
    
    try {
      JSON.parse(propsJson);
      setPropsError(null);
    } catch (error) {
      setPropsError('Invalid JSON format');
    }
  }, []);

  // Generate component from current settings
  const generateComponent = useCallback((): PlaygroundComponent | null => {
    if (!selectedComponent) return null;

    try {
      const parsedProps = JSON.parse(testProps);
      return {
        ...selectedComponent,
        props: parsedProps,
      };
    } catch (error) {
      return selectedComponent;
    }
  }, [selectedComponent, testProps]);

  // Copy playground setup to clipboard
  const copyPlaygroundSetup = () => {
    if (!selectedComponent) return;

    const setup = {
      component: selectedComponent.name,
      props: testProps,
      content: testContent,
    };

    navigator.clipboard.writeText(JSON.stringify(setup, null, 2));
    alert('Playground setup copied to clipboard!');
  };

  // Save component configuration
  const saveComponentConfig = async () => {
    if (!selectedComponent) return;

    try {
      const parsedProps = JSON.parse(testProps);
      const response = await fetch(`/api/admin/components/${selectedComponent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          props: parsedProps,
          exampleCode: testContent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Component configuration saved!');
      } else {
        alert(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving component:', error);
      alert('Failed to save configuration');
    }
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'tablet': return 'max-w-2xl mx-auto';
      case 'desktop': return 'w-full';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading playground...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Component Playground
          </h1>
          
          {/* Component Selector */}
          <select
            value={selectedComponent?.id || ''}
            onChange={(e) => {
              const component = availableComponents.find(c => c.id === e.target.value);
              if (component) selectComponent(component);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a component...</option>
            {availableComponents.map((component) => (
              <option key={component.id} value={component.id}>
                {component.displayName} ({component.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Viewport Controls */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
            {[
              { mode: 'desktop', icon: <Monitor className="w-4 h-4" /> },
              { mode: 'tablet', icon: <Tablet className="w-4 h-4" /> },
              { mode: 'mobile', icon: <Smartphone className="w-4 h-4" /> },
            ].map(({ mode, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-2 flex items-center gap-1 ${
                  viewMode === mode 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {icon}
                <span className="text-xs capitalize">{mode}</span>
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              darkMode
                ? 'bg-gray-900 text-white border-gray-600'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>

          <button
            onClick={copyPlaygroundSetup}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
            Copy Setup
          </button>

          {selectedComponent && (
            <button
              onClick={saveComponentConfig}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save Config
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!selectedComponent ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a Component to Test
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a component from the dropdown to start experimenting
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Component Info */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedComponent.displayName}
                </h3>
                {selectedComponent.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {selectedComponent.description}
                  </p>
                )}
                <div className="text-xs text-gray-500">
                  Version: {selectedComponent.version} • Type: {selectedComponent.sourceType}
                </div>
              </div>

              {/* Props Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">Props (JSON)</label>
                <textarea
                  value={testProps}
                  onChange={(e) => updateTestProps(e.target.value)}
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                    propsError 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder='{"prop": "value"}'
                />
                {propsError && (
                  <p className="text-red-500 text-xs mt-1">{propsError}</p>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">Test Content</label>
                <textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Write markdown content with your component..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use markdown with your component tag: &lt;{selectedComponent.name} /&gt;
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const exampleContent = `# ${selectedComponent.displayName} Demo\n\n<${selectedComponent.name} ${
                      Object.entries(JSON.parse(testProps) || {})
                        .map(([key, value]) => `${key}="${value}"`)
                        .join(' ')
                    } />\n\n## With Different Props\n\n<${selectedComponent.name} title="Custom Title" />`;
                    setTestContent(exampleContent);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Generate Example Content
                </button>

                <button
                  onClick={() => {
                    setTestProps(JSON.stringify(selectedComponent.props || {}, null, 2));
                    setPropsError(null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Reset Props
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-y-auto">
            <div className={`${darkMode ? 'dark' : ''} min-h-full`}>
              <div className="bg-white dark:bg-gray-900 min-h-full">
                <div className="p-8">
                  <div className={getViewportClass()}>
                    {renderError ? (
                      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="text-red-800 dark:text-red-200 font-medium">
                              Render Error
                            </h4>
                            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                              {renderError}
                            </p>
                            <button
                              onClick={() => {
                                setRenderError(null);
                                setIsRendering(false);
                              }}
                              className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Clear Error
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <DynamicMarkdown 
                          components={[generateComponent()].filter(Boolean) as ComponentDefinition[]}
                          className="min-h-32"
                        >
                          {testContent}
                        </DynamicMarkdown>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debug Panel */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 mb-2">
                      Debug Information
                    </summary>
                    <div className="space-y-2 pl-4">
                      <div>
                        <strong>Component:</strong> {selectedComponent.name} v{selectedComponent.version}
                      </div>
                      <div>
                        <strong>Source Type:</strong> {selectedComponent.sourceType}
                      </div>
                      <div>
                        <strong>Requires Sandbox:</strong> {selectedComponent.requiresSandbox ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <strong>Props:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                          {testProps}
                        </pre>
                      </div>
                      {selectedComponent.dependencies && selectedComponent.dependencies.length > 0 && (
                        <div>
                          <strong>Dependencies:</strong> {selectedComponent.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}