"use client";

import React, { ComponentType, lazy, Suspense } from 'react';

export interface ComponentDefinition {
  id: string;
  name: string;
  displayName: string;
  version: string;
  sourceType: 'custom' | 'npm' | 'remote' | 'builtin';
  sourceCode?: string;
  npmPackage?: string;
  npmVersion?: string;
  remoteUrl?: string;
  dependencies?: string[];
  props?: Record<string, any>;
  requiresSandbox?: boolean;
}

interface ComponentCache {
  [key: string]: {
    component: ComponentType<any>;
    timestamp: number;
    version: string;
  };
}

class ComponentRegistry {
  private cache: ComponentCache = {};
  private loading = new Set<string>();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  constructor() {
    // Bind methods to maintain context
    this.loadComponent = this.loadComponent.bind(this);
    this.getComponent = this.getComponent.bind(this);
  }

  /**
   * Load a component dynamically based on its definition
   */
  async loadComponent(definition: ComponentDefinition): Promise<ComponentType<any>> {
    const cacheKey = `${definition.name}@${definition.version}`;
    
    // Return cached component if valid
    if (this.isCached(cacheKey)) {
      return this.cache[cacheKey].component;
    }

    // Prevent duplicate loading
    if (this.loading.has(cacheKey)) {
      return this.waitForLoad(cacheKey);
    }

    this.loading.add(cacheKey);

    try {
      let component: ComponentType<any>;

      switch (definition.sourceType) {
        case 'builtin':
          component = await this.loadBuiltinComponent(definition);
          break;
        case 'custom':
        case 'npm':
        case 'remote':
          throw new Error(`${definition.sourceType} component loading temporarily disabled due to Turbopack issues`);
        default:
          throw new Error(`Unknown source type: ${definition.sourceType}`);
      }

      // Cache the loaded component
      this.cache[cacheKey] = {
        component,
        timestamp: Date.now(),
        version: definition.version,
      };

      return component;
    } catch (error) {
      console.error(`Failed to load component ${definition.name}:`, error);
      // Return error boundary component
      return this.createErrorComponent(definition.name, error as Error);
    } finally {
      this.loading.delete(cacheKey);
    }
  }

  /**
   * Get a React component wrapped with necessary providers
   */
  getComponent(definition: ComponentDefinition): ComponentType<any> {
    const LazyComponent = lazy(async () => {
      const Component = await this.loadComponent(definition);
      return { default: Component };
    });

    // Return component wrapped with Suspense
    return (props: any) => (
      <Suspense fallback={this.createLoadingComponent(definition.name)}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  /**
   * Load built-in components from the registry
   */
  private async loadBuiltinComponent(definition: ComponentDefinition): Promise<ComponentType<any>> {
    console.log(`🏗️ Loading builtin component: ${definition.name}`);
    try {
      // Handle sub-components that are exported from parent components
      const subComponentMap: Record<string, string> = {
        'Task': 'Exercise',
        'Hint': 'Exercise', 
        'Step': 'Exercise',
        'Solution': 'Exercise'
      };

      const moduleToImport = subComponentMap[definition.name] || definition.name;
      
      // Try to import from the built-in registry
      console.log(`📦 Importing from: @/components/registry/${moduleToImport}`);
      const module = await import(`@/components/registry/${moduleToImport}`);
      console.log(`📦 Module loaded:`, !!module, !!module.default);
      
      // If it's a sub-component, look for named export, otherwise use default
      const component = subComponentMap[definition.name] 
        ? module[definition.name] 
        : (module.default || module[definition.name]);
        
      if (!component) {
        throw new Error(`No ${subComponentMap[definition.name] ? 'named' : 'default'} export found for ${definition.name}`);
      }
      console.log(`✅ Successfully loaded builtin component: ${definition.name}`);
      return component;
    } catch (error) {
      console.warn(`❌ Component ${definition.name} not found in registry:`, error);
      
      // Fallback to markdown components
      try {
        console.log(`🔄 Trying fallback for ${definition.name}...`);
        const module = await import(`@/components/markdown/CustomComponents`);
        if ((module as any)[definition.name]) {
          console.log(`✅ Found ${definition.name} in markdown components`);
          return (module as any)[definition.name];
        }
      } catch (fallbackError) {
        console.warn(`❌ Component ${definition.name} not found in markdown components:`, fallbackError);
      }
      
      // Final fallback - create a placeholder component that shows the error
      throw new Error(`Built-in component ${definition.name} not found in any location`);
    }
  }

  /**
   * Check if component is cached and valid
   */
  private isCached(cacheKey: string): boolean {
    const cached = this.cache[cacheKey];
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  /**
   * Wait for component to finish loading
   */
  private async waitForLoad(cacheKey: string): Promise<ComponentType<any>> {
    return new Promise((resolve) => {
      const checkLoading = () => {
        if (!this.loading.has(cacheKey)) {
          resolve(this.cache[cacheKey].component);
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    });
  }

  /**
   * Create error component for failed loads
   */
  private createErrorComponent(name: string, error: Error): ComponentType<any> {
    return () => (
      <div className="border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg my-4">
        <div className="flex items-start">
          <div className="text-red-600 dark:text-red-400 mr-3">⚠️</div>
          <div>
            <h4 className="text-red-900 dark:text-red-100 font-semibold">
              Component Load Error
            </h4>
            <p className="text-red-800 dark:text-red-200 text-sm mt-1">
              Failed to load component "{name}": {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Create loading component
   */
  private createLoadingComponent(name: string): React.ReactElement {
    return (
      <div className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-4 animate-pulse">
        <div className="flex items-center">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Loading component "{name}"...
          </div>
        </div>
      </div>
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: Object.keys(this.cache).length,
      loading: this.loading.size,
      entries: Object.keys(this.cache),
    };
  }
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg my-4">
          <div className="flex items-start">
            <div className="text-red-600 dark:text-red-400 mr-3">💥</div>
            <div>
              <h4 className="text-red-900 dark:text-red-100 font-semibold">
                Component Error
              </h4>
              <p className="text-red-800 dark:text-red-200 text-sm mt-1">
                Component "{this.props.componentName}" crashed: {this.state.error?.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Sandbox Wrapper Component (simplified)
function SandboxWrapper({ 
  children, 
  definition 
}: { 
  children: React.ReactNode; 
  definition: ComponentDefinition;
}) {
  // In production, this would render in an iframe or use other sandboxing techniques
  return (
    <div className="component-sandbox" data-component={definition.name}>
      {children}
    </div>
  );
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();
export default componentRegistry;