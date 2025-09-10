"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Code, 
  Package, 
  Globe, 
  Settings,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface ComponentFormData {
  name: string;
  displayName: string;
  description: string;
  category: string;
  sourceType: 'custom' | 'npm' | 'remote' | 'builtin';
  sourceCode: string;
  npmPackage: string;
  npmVersion: string;
  remoteUrl: string;
  version: string;
  status: 'draft' | 'published';
  props: string;
  config: string;
  exampleCode: string;
  thumbnailUrl: string;
  isInteractive: boolean;
  requiresSandbox: boolean;
  dependencies: string;
}

export default function NewComponentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [testingCompilation, setTestingCompilation] = useState(false);
  const [compilationResult, setCompilationResult] = useState<{
    valid: boolean;
    error?: string;
    bundleSize?: number;
  } | null>(null);
  
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    displayName: '',
    description: '',
    category: '',
    sourceType: 'custom',
    sourceCode: '',
    npmPackage: '',
    npmVersion: '',
    remoteUrl: '',
    version: '1.0.0',
    status: 'draft',
    props: '{}',
    config: '{}',
    exampleCode: '',
    thumbnailUrl: '',
    isInteractive: true,
    requiresSandbox: false,
    dependencies: '',
  });

  const [errors, setErrors] = useState<Partial<ComponentFormData>>({});

  const handleInputChange = (field: keyof ComponentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ComponentFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Component name is required';
    else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(formData.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    if (!formData.version.trim()) newErrors.version = 'Version is required';

    // Source type specific validation
    if (formData.sourceType === 'custom' && !formData.sourceCode.trim()) {
      newErrors.sourceCode = 'Source code is required for custom components';
    }
    if (formData.sourceType === 'npm' && !formData.npmPackage.trim()) {
      newErrors.npmPackage = 'NPM package name is required';
    }
    if (formData.sourceType === 'remote' && !formData.remoteUrl.trim()) {
      newErrors.remoteUrl = 'Remote URL is required';
    }

    // Validate JSON fields
    try {
      JSON.parse(formData.props);
    } catch {
      newErrors.props = 'Invalid JSON format for props';
    }

    try {
      JSON.parse(formData.config);
    } catch {
      newErrors.config = 'Invalid JSON format for config';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testCompilation = async () => {
    if (formData.sourceType !== 'custom' || !formData.sourceCode.trim()) {
      return;
    }

    setTestingCompilation(true);
    try {
      const response = await fetch(`/api/admin/components/test?action=test-compile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: formData.sourceCode }),
      });

      const data = await response.json();
      setCompilationResult(data.result);
    } catch (error) {
      console.error('Compilation test failed:', error);
      setCompilationResult({
        valid: false,
        error: 'Failed to test compilation',
      });
    } finally {
      setTestingCompilation(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        props: JSON.parse(formData.props),
        config: JSON.parse(formData.config),
        dependencies: formData.dependencies 
          ? formData.dependencies.split(',').map(dep => dep.trim()).filter(Boolean)
          : [],
      };

      const response = await fetch('/api/admin/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/components/${data.component.id}`);
      } else {
        alert(data.error || 'Failed to create component');
      }
    } catch (error) {
      console.error('Error creating component:', error);
      alert('Failed to create component');
    } finally {
      setSaving(false);
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

  const getExampleCode = () => {
    switch (formData.sourceType) {
      case 'custom':
        return `import React from 'react';

interface ${formData.name || 'Component'}Props {
  title?: string;
  children?: React.ReactNode;
}

export default function ${formData.name || 'Component'}({ title, children }: ${formData.name || 'Component'}Props) {
  return (
    <div className="p-4 border rounded-lg">
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
}`;
      case 'npm':
        return `// Example usage of ${formData.npmPackage}
import ${formData.name} from '${formData.npmPackage}';

export default function Example() {
  return (
    <${formData.name} 
      // Add props here
    />
  );
}`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Component</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new dynamic component</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Component'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Component Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="MyComponent"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.displayName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="My Awesome Component"
                />
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of what this component does..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="ui, charts, forms..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Version *</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.version ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="1.0.0"
                  />
                  {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isInteractive}
                    onChange={(e) => handleInputChange('isInteractive', e.target.checked)}
                    className="mr-2"
                  />
                  Interactive
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requiresSandbox}
                    onChange={(e) => handleInputChange('requiresSandbox', e.target.checked)}
                    className="mr-2"
                  />
                  Requires Sandbox
                </label>
              </div>
            </div>
          </div>

          {/* Source Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Source Configuration</h3>
            
            {/* Source Type Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Source Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'custom', label: 'Custom Code', icon: <Code className="w-4 h-4" /> },
                  { value: 'npm', label: 'NPM Package', icon: <Package className="w-4 h-4" /> },
                  { value: 'remote', label: 'Remote URL', icon: <Globe className="w-4 h-4" /> },
                  { value: 'builtin', label: 'Built-in', icon: <Settings className="w-4 h-4" /> },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('sourceType', type.value)}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      formData.sourceType === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type.icon}
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Source-specific fields */}
            {formData.sourceType === 'custom' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Source Code *</label>
                    <button
                      onClick={testCompilation}
                      disabled={testingCompilation || !formData.sourceCode.trim()}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {testingCompilation ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Test Compile
                    </button>
                  </div>
                  <textarea
                    value={formData.sourceCode}
                    onChange={(e) => handleInputChange('sourceCode', e.target.value)}
                    rows={12}
                    className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${
                      errors.sourceCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={getExampleCode()}
                  />
                  {errors.sourceCode && <p className="text-red-500 text-sm mt-1">{errors.sourceCode}</p>}
                  
                  {/* Compilation Result */}
                  {compilationResult && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      compilationResult.valid 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        {compilationResult.valid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          compilationResult.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {compilationResult.valid ? 'Compilation successful' : 'Compilation failed'}
                        </span>
                      </div>
                      {compilationResult.error && (
                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                          {compilationResult.error}
                        </p>
                      )}
                      {compilationResult.bundleSize && (
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                          Estimated bundle size: {Math.round(compilationResult.bundleSize / 1024)}KB
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dependencies</label>
                  <input
                    type="text"
                    value={formData.dependencies}
                    onChange={(e) => handleInputChange('dependencies', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="react-icons, lodash, moment"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of required packages</p>
                </div>
              </div>
            )}

            {formData.sourceType === 'npm' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">NPM Package *</label>
                    <input
                      type="text"
                      value={formData.npmPackage}
                      onChange={(e) => handleInputChange('npmPackage', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.npmPackage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="react-icons"
                    />
                    {errors.npmPackage && <p className="text-red-500 text-sm mt-1">{errors.npmPackage}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">NPM Version</label>
                    <input
                      type="text"
                      value={formData.npmVersion}
                      onChange={(e) => handleInputChange('npmVersion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="latest"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.sourceType === 'remote' && (
              <div>
                <label className="block text-sm font-medium mb-2">Remote URL *</label>
                <input
                  type="url"
                  value={formData.remoteUrl}
                  onChange={(e) => handleInputChange('remoteUrl', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.remoteUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder="https://esm.sh/react@18"
                />
                {errors.remoteUrl && <p className="text-red-500 text-sm mt-1">{errors.remoteUrl}</p>}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Props Schema (JSON)</label>
                <textarea
                  value={formData.props}
                  onChange={(e) => handleInputChange('props', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${
                    errors.props ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder='{"title": {"type": "string", "default": "Hello"}, "count": {"type": "number", "default": 0}}'
                />
                {errors.props && <p className="text-red-500 text-sm mt-1">{errors.props}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Component Config (JSON)</label>
                <textarea
                  value={formData.config}
                  onChange={(e) => handleInputChange('config', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm ${
                    errors.config ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  placeholder='{"theme": "default", "responsive": true}'
                />
                {errors.config && <p className="text-red-500 text-sm mt-1">{errors.config}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Example Usage</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Example Code</label>
              <textarea
                value={formData.exampleCode}
                onChange={(e) => handleInputChange('exampleCode', e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={`<${formData.name || 'Component'} title="Example" />`}
              />
            </div>
          </div>

          {/* Preview placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                {getSourceTypeIcon(formData.sourceType)}
                <p className="mt-2">Preview will be available after saving</p>
                <p className="text-sm">Component: {formData.displayName || 'Untitled'}</p>
                <p className="text-sm">Type: {formData.sourceType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}