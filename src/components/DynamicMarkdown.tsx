"use client";

import React, { useMemo, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { componentRegistry, ComponentDefinition } from "@/services/componentRegistry";
import { ExternalLink } from 'lucide-react';
import "katex/dist/katex.min.css";

interface DynamicMarkdownProps {
  children: string;
  className?: string;
  components?: ComponentDefinition[];
  postId?: string;
}

interface ComponentProviderProps {
  components: ComponentDefinition[];
  children: React.ReactNode;
}

// Component provider to inject dynamic components
function ComponentProvider({ components, children }: ComponentProviderProps) {
  const [loadedComponents, setLoadedComponents] = useState<Record<string, React.ComponentType<any>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponents = async () => {
      if (!components?.length) {
        setLoading(false);
        return;
      }

      try {
        const componentMap: Record<string, React.ComponentType<any>> = {};

        // Load all components in parallel
        await Promise.all(
          components.map(async (definition) => {
            try {
              const Component = componentRegistry.getComponent(definition);
              componentMap[definition.name.toLowerCase()] = Component;
            } catch (error) {
              console.error(`Failed to load component ${definition.name}:`, error);
              // Create error component
              componentMap[definition.name.toLowerCase()] = () => (
                <div className="border border-red-300 bg-red-50 p-2 rounded text-red-700 text-sm">
                  Failed to load component: {definition.name}
                </div>
              );
            }
          })
        );

        setLoadedComponents(componentMap);
      } catch (error) {
        console.error('Error loading components:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, [components]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading components...</span>
      </div>
    );
  }

  return (
    <ComponentContext.Provider value={loadedComponents}>
      {children}
    </ComponentContext.Provider>
  );
}

// Context for component access
const ComponentContext = React.createContext<Record<string, React.ComponentType<any>>>({});

export default function DynamicMarkdown({ 
  children, 
  className,
  components = [],
  postId
}: DynamicMarkdownProps) {
  // Memoize markdown components to prevent unnecessary re-renders
  const markdownComponents = useMemo(() => {
    return createMarkdownComponents();
  }, []);

  return (
    <ComponentProvider components={components}>
      <div className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeSlug, rehypeKatex]}
          components={markdownComponents}
        >
          {children}
        </ReactMarkdown>
      </div>
    </ComponentProvider>
  );
}

// Create markdown component mappings
function createMarkdownComponents() {
  return {
    // Dynamic component resolver
    div: ({ node, ...props }: any) => {
      const className = props.className || '';
      
      // Check if this is a component wrapper
      if (className.includes('component-wrapper')) {
        return <DynamicComponentWrapper {...props} />;
      }
      
      return <div {...props} />;
    },

    // Enhanced links with external link detection
    a: ({ href, children, ...props }: any) => {
      if (href?.startsWith('http')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          >
            {children}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    },

    // Enhanced code blocks with copy functionality
    pre: ({ children, ...props }: any) => {
      const child = React.Children.only(children);
      
      if (React.isValidElement(child) && (child.props as any).className) {
        const language = (child.props as any).className?.replace('language-', '');
        return (
          <EnhancedCodeBlock language={language} {...props}>
            {(child.props as any).children}
          </EnhancedCodeBlock>
        );
      }
      
      return <pre {...props}>{children}</pre>;
    },

    // Custom component tags (converted to lowercase for HTML compatibility)
    // These will be dynamically loaded based on the components array
    ...createDynamicComponentMappings(),
  };
}

// Create mappings for dynamic components
function createDynamicComponentMappings() {
  // This will be populated with actual component names when components are loaded
  // For now, return a generic resolver that looks up components from context
  return new Proxy({}, {
    get: (target, prop: string | symbol) => {
      if (typeof prop === 'string') {
        return (props: any) => <DynamicComponentResolver componentName={prop} {...props} />;
      }
      return undefined;
    }
  });
}

// Component resolver that looks up components from context
function DynamicComponentResolver({ componentName, ...props }: { componentName: string; [key: string]: any }) {
  const components = React.useContext(ComponentContext);
  const Component = components[componentName.toLowerCase()];
  
  if (!Component) {
    // Check if it's a standard HTML element
    if (isValidHTMLElement(componentName)) {
      return React.createElement(componentName, props);
    }
    
    // Return unknown component warning
    return (
      <div className="border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg my-2">
        <div className="flex items-center text-amber-800 dark:text-amber-200">
          <span className="mr-2">⚠️</span>
          <span className="text-sm">Unknown component: &lt;{componentName}&gt;</span>
        </div>
      </div>
    );
  }
  
  return <Component {...props} />;
}

// Dynamic component wrapper for custom syntax
function DynamicComponentWrapper({ 'data-component': componentName, ...props }: any) {
  const components = React.useContext(ComponentContext);
  const Component = components[componentName?.toLowerCase()];
  
  if (!Component) {
    return (
      <div className="border border-red-300 bg-red-50 p-2 rounded text-red-700 text-sm">
        Component not found: {componentName}
      </div>
    );
  }
  
  return <Component {...props} />;
}

// Enhanced code block with copy functionality
function EnhancedCodeBlock({ 
  children, 
  language,
  title,
  ...props 
}: { 
  children: React.ReactNode; 
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    if (typeof children === 'string') {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div className="relative my-6 group">
      {title && (
        <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-medium rounded-t-lg border-b border-gray-700">
          {title}
          {language && (
            <span className="text-gray-400 ml-2">({language})</span>
          )}
        </div>
      )}
      <div className="relative">
        <pre 
          className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${
            title ? 'rounded-t-none rounded-b-lg' : 'rounded-lg'
          }`} 
          {...props}
        >
          <code className={language ? `language-${language}` : ''}>
            {children}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// Check if a string is a valid HTML element
function isValidHTMLElement(tagName: string): boolean {
  const htmlElements = [
    'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'form', 'input', 'button', 'label', 'select', 'option', 'textarea',
    'article', 'section', 'nav', 'header', 'footer', 'main', 'aside',
    'figure', 'figcaption', 'blockquote', 'details', 'summary'
  ];
  
  return htmlElements.includes(tagName.toLowerCase());
}

// Hook for accessing loaded components
export function useMarkdownComponents() {
  return React.useContext(ComponentContext);
}

// Utility function to extract component names from markdown content
export function extractComponentsFromMarkdown(content: string): string[] {
  const componentMatches = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
  return [...new Set(componentMatches.map(match => match.slice(1)))];
}

// Utility function to validate component usage in content
export function validateComponentUsage(content: string, availableComponents: ComponentDefinition[]): {
  valid: boolean;
  missingComponents: string[];
  usedComponents: string[];
} {
  const usedComponents = extractComponentsFromMarkdown(content);
  const availableNames = availableComponents.map(c => c.name);
  const missingComponents = usedComponents.filter(name => !availableNames.includes(name));
  
  return {
    valid: missingComponents.length === 0,
    missingComponents,
    usedComponents
  };
}