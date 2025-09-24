import { getBlogPostBySlugSync } from '@/lib/blog';
import { getLectureBySlugSync } from '@/lib/lectures';

type ResourceSource = 'blog' | 'lecture';

export type CollectionResource = {
  title: string;
  description?: string;
  href?: string;
  variant?: 'note';
};

export type ResourceOptions = {
  slug: string;
  source?: ResourceSource;
  overrideTitle?: string | null;
  overrideDescription?: string | null;
};

export function getCollectionResource(
  slugOrOptions: string | ResourceOptions,
  overrideTitle?: string,
  overrideDescription?: string,
): CollectionResource {
  const options: ResourceOptions =
    typeof slugOrOptions === 'string'
      ? { slug: slugOrOptions, overrideTitle: overrideTitle ?? null, overrideDescription: overrideDescription ?? null }
      : slugOrOptions;

  const source: ResourceSource = options.source ?? 'blog';
  const slug = options.slug;

  const entry =
    source === 'lecture'
      ? getLectureBySlugSync(slug)
      : getBlogPostBySlugSync(slug);

  const title = options.overrideTitle ?? entry?.title ?? slug;
  const description = options.overrideDescription ?? entry?.excerpt;
  const href = entry ? `/${source === 'lecture' ? 'lectures' : 'blog'}/${slug}` : undefined;

  const resource: CollectionResource = { title };

  if (description) {
    resource.description = description;
  }

  if (href) {
    resource.href = href;
  }

  return resource;
}
