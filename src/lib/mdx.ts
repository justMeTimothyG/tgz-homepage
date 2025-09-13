import { compile, run } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import * as runtime from 'react/jsx-runtime';
import { useMDXComponents as useSiteMDXComponents } from '@/lib/mdx-components';
import { pathToFileURL } from 'node:url';

export interface MDXCompileOptions {
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  development?: boolean;
}

// Plugin to remove import statements from MDX
function remarkRemoveImports() {
  return function (tree: any) {
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1);
        // No need to traverse into removed node
        return index;
      }
    });
  };
}

export async function compileMDX(source: string, options: MDXCompileOptions = {}) {
  const {
    remarkPlugins = [remarkRemoveImports, remarkGfm, remarkMath],
    rehypePlugins = [
      rehypeSlug,
      [rehypeKatex, {
        output: 'html',
        strict: false,
        throwOnError: false
      }]
    ],
    development = process.env.NODE_ENV === 'development'
  } = options;

  try {
    const compiled = await compile(source, {
      // Use function-body so evaluation doesn't rely on ESM imports
      outputFormat: 'function-body',
      development,
      remarkPlugins,
      rehypePlugins,
      jsxImportSource: 'react',
      format: 'mdx',
    });

    const compiledSource = String(compiled);
    console.log('MDX compiled source preview:', compiledSource.slice(0, 300) + '...');

    return {
      compiledSource,
      error: null,
    };
  } catch (error) {
    console.error('MDX compilation error:', error);
    return {
      compiledSource: null,
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    };
  }
}

// Server-side: compile and evaluate MDX to a React component
// Note: We intentionally strip `import` statements during compilation (see remarkRemoveImports)
// and provide components via the MDX components mapping. Importing TS/TSX directly from MDX
// at runtime is unreliable in a Node environment.
export async function renderMDX(
  source: string,
  opts: MDXCompileOptions & { basePath?: string } = {}
) {
  const { basePath, ...compileOpts } = opts;
  const { compiledSource, error } = await compileMDX(source, compileOpts);
  if (!compiledSource) {
    throw new Error(error || 'MDX compilation failed');
  }

  // Evaluate to a component using the runtime
  const siteComponents = useSiteMDXComponents({});
  const evaluated = await run(compiledSource, {
    ...runtime,
    // Provide MDX component resolution without importing '@mdx-js/react'
    useMDXComponents: (components?: any) => ({
      ...siteComponents,
      ...(components || {}),
    }),
    // Base URL is used for resolving relative URLs if any (we do not expect imports)
    baseUrl: basePath ? pathToFileURL(basePath) : new URL('file://' + process.cwd() + '/'),
  } as any);

  // evaluated.default is the MDXContent component
  return evaluated.default as (props: Record<string, unknown>) => any;
}
