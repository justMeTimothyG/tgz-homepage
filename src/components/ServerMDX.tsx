import 'server-only';
import { renderMDX } from '@/lib/mdx';
import { useMDXComponents as useSiteMDXComponents } from '@/lib/mdx-components';

interface ServerMDXProps {
  source: string;
  className?: string;
  basePath?: string; // for resolving relative URLs (not imports)
}

export default async function ServerMDX({ source, className, basePath }: ServerMDXProps) {
  if (!source) {
    return (
      <div className={className}>
        <p className="text-red-500">Error: No MDX content provided</p>
      </div>
    );
  }

  const MDXContent = await renderMDX(source, { basePath });
  const components = useSiteMDXComponents({});
  return (
    <div className={className}>
      <MDXContent components={components} />
    </div>
  );
}
