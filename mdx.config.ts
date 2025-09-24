import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';

// Editor-time MDX config to mirror build-time plugins (see src/lib/mdx.ts)
// Used by the VS Code MDX extension for parsing, diagnostics and IntelliSense.
const config = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    rehypeSlug,
    [rehypeKatex, { output: 'html', strict: false, throwOnError: false }],
  ],
};

export default config;

