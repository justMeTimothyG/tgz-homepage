"use client";

import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import { useMDXComponents } from '@/lib/mdx-components-client';
import 'katex/dist/katex.min.css';

interface MDXRendererProps {
  compiledSource: string;
  className?: string;
}

export default function MDXRenderer({ compiledSource, className }: MDXRendererProps) {
  const components = useMDXComponents({});

  if (!compiledSource) {
    return (
      <div className={className}>
        <p className="text-red-500">Error: MDX content could not be compiled</p>
      </div>
    );
  }

  try {
    // Create the MDX component from compiled source (function-body format)
    const scope = {
      React,
      ...components,
      _jsx: React.createElement,
      _jsxs: React.createElement,
      _Fragment: React.Fragment
    };

    // The compiled source is a function body, so we need to wrap it
    const fn = new Function(...Object.keys(scope), `
      const _createMdxContent = function(props = {}) {
        const _components = { ...arguments[0], ...props.components };
        ${compiledSource}
      };
      return _createMdxContent;
    `);

    const MDXContent = fn(...Object.values(scope));

    return (
      <div className={className}>
        <MDXProvider components={components}>
          <MDXContent components={components} />
        </MDXProvider>
      </div>
    );
  } catch (error) {
    return (
      <div className={className}>
        <p className="text-red-500">Error rendering MDX content</p>
        <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}
