"use client";

import React, { useEffect, useState } from "react";
import { evaluate, compile } from "@mdx-js/mdx";
import * as runtime from 'react/jsx-runtime';
import * as runtimeDev from 'react/jsx-dev-runtime';
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

export default function DynamicMarkdown({ 
  children, 
  className = "prose dark:prose-invert max-w-none",
  components = [],
  postId
}: DynamicMarkdownProps) {
  const [renderState, setRenderState] = useState<'loading' | 'mdx' | 'fallback'>('loading');
  const [MDXComponent, setMDXComponent] = useState<React.ComponentType | null>(null);
  const [componentScope, setComponentScope] = useState<Record<string, React.ComponentType<any>>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupMDXRendering = async () => {
      try {
        // Validate content before MDX evaluation to prevent feedback loops
        if (!children || typeof children !== 'string') {
          throw new Error('Invalid content provided');
        }
        
        // Skip MDX compilation if content appears to be error messages
        if (children.includes('MDX setup failed:') || children.includes('Unexpected character')) {
          throw new Error('Content appears to be error messages, falling back to ReactMarkdown');
        }

        // Load component scope first
        const scope = await loadComponentScope(components);
        
        if (!isMounted) return;
        setComponentScope(scope);

        // Evaluate MDX with the component scope
        const compiledMDX = await evaluate(children, {
          ...runtime,
          ...(process.env.NODE_ENV === 'development' ? runtimeDev : {}),
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            rehypeSlug, 
            [rehypeKatex, { 
              output: 'html', 
              strict: false, 
              throwOnError: false 
            }]
          ],
          development: process.env.NODE_ENV === 'development',
          // Create a components function that returns the loaded components
          useMDXComponents: () => scope
        });

        if (!isMounted) return;

        // Set the compiled MDX component directly (components are already available as globals)
        setMDXComponent(() => compiledMDX.default);
        setRenderState('mdx');

      } catch (err) {
        console.error('MDX setup failed:', err);
        console.error('Content length:', children.length);
        console.error('Content starts with:', children.substring(0, 200));
        console.error('Components expected:', components.map(c => c.name));
        console.error('Component scope keys:', Object.keys(componentScope));
        if (isMounted) {
          setError(`MDX compilation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setRenderState('fallback');
        }
      }
    };

    setupMDXRendering();

    return () => {
      isMounted = false;
    };
  }, [children, components]);

  // Loading state
  if (renderState === 'loading') {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Loading content...</span>
        </div>
      </div>
    );
  }

  // MDX success - render with components
  if (renderState === 'mdx' && MDXComponent) {
    return (
      <div className={className}>
        <ErrorBoundary fallback={<FallbackContent content={children} error="Component render error" />}>
          <MDXComponent />
        </ErrorBoundary>
      </div>
    );
  }

  // Fallback - render markdown with component placeholders
  return (
    <div className={className}>
      <FallbackContent content={children} error={error} />
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MDX Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback content renderer
function FallbackContent({ content, error }: { content: string; error?: string | null }) {
  return (
    <>
      {error && (
        <div className="border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4">
          <h4 className="text-amber-800 dark:text-amber-200 font-semibold mb-1 text-sm">
            ⚠️ Interactive Components Unavailable
          </h4>
          <p className="text-amber-700 dark:text-amber-300 text-xs mb-2">
            Content shown with component placeholders instead.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary className="text-amber-600 dark:text-amber-400 text-xs cursor-pointer">
                Error details
              </summary>
              <pre className="text-xs bg-amber-100 dark:bg-amber-900/30 p-2 rounded mt-1 overflow-auto">
                {error}
              </pre>
            </details>
          )}
        </div>
      )}
      <FallbackMarkdownRenderer content={content} />
    </>
  );
}

// Load component scope with error handling
async function loadComponentScope(components: ComponentDefinition[]): Promise<Record<string, React.ComponentType<any>>> {
  const baseComponents = createBaseComponents();
  
  if (!components || components.length === 0) {
    return baseComponents;
  }

  console.log(`🔍 Loading ${components.length} components:`, components.map(c => c.name));

  const scope: Record<string, React.ComponentType<any>> = { ...baseComponents };

  // Load each component individually with error handling
  for (const definition of components) {
    try {
      console.log(`🔧 Loading component: ${definition.name} (${definition.sourceType})`);
      const Component = await componentRegistry.getComponent(definition);
      if (Component) {
        // Wrap dynamic components to escape parent `.prose` styles
        // and avoid typography plugin overriding internal Tailwind classes.
        const Wrapped = (props: any) => (
          <div className="not-prose">
            <Component {...props} />
          </div>
        );
        scope[definition.name] = Wrapped;
        console.log(`✅ Successfully loaded: ${definition.name}`);
      } else {
        throw new Error('Component returned null/undefined');
      }
    } catch (error) {
      console.error(`❌ Failed to load component ${definition.name}:`, error);
      
      // Create error placeholder component
      scope[definition.name] = (props: any) => (
        <div className="border border-orange-200 bg-orange-50 dark:bg-orange-900/20 p-2 rounded my-2">
          <div className="flex items-center text-orange-800 dark:text-orange-200 text-sm">
            <span className="mr-2">⚠️</span>
            <span>Component "{definition.name}" failed to load</span>
          </div>
          {process.env.NODE_ENV === 'development' && Object.keys(props).length > 0 && (
            <details className="mt-1">
              <summary className="text-xs cursor-pointer">Props</summary>
              <pre className="text-xs bg-orange-100 dark:bg-orange-900/30 p-1 rounded mt-1">
                {JSON.stringify(props, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
    }
  }

  return scope;
}

// Create base components that are always available
function createBaseComponents() {
  return {
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
      return <EnhancedCodeBlock {...props}>{children}</EnhancedCodeBlock>;
    },

    // Math block wrapper - use span to avoid div-in-p issues
    math: ({ children, ...props }: any) => (
      <span className="katex-display" {...props}>
        {children}
      </span>
    ),

    // Inline math wrapper
    inlineMath: ({ children, ...props }: any) => (
      <span className="katex-inline mx-1" {...props}>
        {children}
      </span>
    )
  };
}

// Enhanced code block with copy functionality
function EnhancedCodeBlock({ 
  children, 
  className,
  title,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';
  
  const copyToClipboard = async () => {
    // Extract text content from children
    const getTextContent = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (React.isValidElement(node)) {
        return React.Children.toArray((node.props as any).children).map(getTextContent).join('');
      }
      if (Array.isArray(node)) {
        return node.map(getTextContent).join('');
      }
      return '';
    };

    const text = getTextContent(children);
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
          {children}
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

// Fallback markdown renderer with component placeholders
function FallbackMarkdownRenderer({ content }: { content: string }) {
  // Replace component syntax with placeholders
  // More precise regex: only match self-closing tags or properly paired tags
  // Exclude common HTML tags by checking for known HTML elements
  const htmlTags = new Set(['A', 'B', 'I', 'U', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SPAN', 'IMG', 'BR', 'HR']);
  
  const contentWithPlaceholders = content.replace(
    /<([A-Z][a-zA-Z0-9]*)\s*([^>]*?)\s*\/?>/g,
    (match, componentName, props) => {
      // Skip if it's a known HTML tag
      if (htmlTags.has(componentName.toUpperCase())) {
        return match; // Keep original content
      }
      
      // Only replace if it looks like a React component (starts with capital letter, not HTML)
      return `\n\n---\n**📦 Component: ${componentName}**\n\n*Interactive component would render here${props ? ` with props: ${props.trim()}` : ''}.*\n\n---\n\n`;
    }
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeSlug, 
        [rehypeKatex, { 
          output: 'html', 
          strict: false, 
          throwOnError: false 
        }]
      ]}
      components={createBaseComponents()}
    >
      {contentWithPlaceholders}
    </ReactMarkdown>
  );
}

// Utility functions
export async function extractComponentsFromMarkdown(content: string): Promise<string[]> {
  try {
    // Use MDX compiler to get proper AST-based component detection
    const compiledCode = await compile(content, {
      remarkPlugins: [],
      rehypePlugins: [],
      development: false
    });
    
    // Extract components from the compiled code by looking for both createElement and _jsx calls
    const codeString = String(compiledCode);
    const createElementMatches = codeString.match(/createElement\(["']?([A-Z][a-zA-Z0-9]*)["']?/g) || [];
    const jsxMatches = codeString.match(/_jsx\(([A-Z][a-zA-Z0-9]*),/g) || [];
    
    const allMatches = [
      // Extract from createElement calls
      ...createElementMatches.map(match => {
        const nameMatch = match.match(/createElement\(["']?([A-Z][a-zA-Z0-9]*)["']?/);
        return nameMatch ? nameMatch[1] : null;
      }),
      // Extract from _jsx calls (modern JSX runtime)
      ...jsxMatches.map(match => {
        const nameMatch = match.match(/_jsx\(([A-Z][a-zA-Z0-9]*),/);
        return nameMatch ? nameMatch[1] : null;
      })
    ];
    
    const components = [...new Set(
      allMatches
        .filter(Boolean)
        .filter(name => {
          // Filter out known React built-ins and MDX wrappers
          const builtins = new Set(['Fragment', 'Suspense', 'StrictMode', 'Profiler', 'MDXLayout']);
          return !builtins.has(name!);
        })
    )] as string[];
    
    return components;
  } catch (error) {
    // Fallback to regex-based detection if MDX compilation fails
    console.warn('MDX compilation failed for component detection, falling back to regex:', error);
    const htmlTags = new Set(['A', 'B', 'I', 'U', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SPAN', 'IMG', 'BR', 'HR']);
    const componentMatches = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
    
    return [...new Set(
      componentMatches
        .map(match => match.slice(1))
        .filter(name => !htmlTags.has(name.toUpperCase()))
    )];
  }
}

export async function validateComponentUsage(content: string, availableComponents: ComponentDefinition[]): Promise<{
  valid: boolean;
  missingComponents: string[];
  usedComponents: string[];
}> {
  const usedComponents = await extractComponentsFromMarkdown(content);
  const availableNames = availableComponents.map(c => c.name);
  const missingComponents = usedComponents.filter(name => !availableNames.includes(name));
  
  return {
    valid: missingComponents.length === 0,
    missingComponents,
    usedComponents
  };
}
