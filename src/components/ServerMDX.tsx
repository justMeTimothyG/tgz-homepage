import 'server-only';
import { renderMDX } from '@/lib/mdx';
import { getSiteMDXComponents } from '@/lib/mdx-components';

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

  const components = getSiteMDXComponents({});
  const MDXContent = await renderMDX(source, { basePath, components });
  return (
    <div className={className}>
      {/* Pass components so MDX can resolve custom JSX like <Exercise /> */}
      <MDXContent components={components} />
    </div>
  );
}
