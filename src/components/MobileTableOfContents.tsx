import type { TocSection } from '@/lib/toc';

export default function MobileTableOfContents({ sections }: { sections: TocSection[] }) {
  if (!sections.length) return null;

  return (
    <nav
      aria-label="Inhaltsverzeichnis"
      className="lg:hidden mb-8 rounded-2xl border border-gray-200/80 bg-white/70 p-4 text-sm shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
        Inhalte
      </h2>
      <ul className="mt-3 space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="block font-medium text-gray-900 transition hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
              href={`#${section.id}`}
            >
              {section.text}
            </a>
            {section.children.length > 0 && (
              <ul className="mt-2 space-y-2 border-l border-gray-200/70 pl-4 dark:border-gray-700/60">
                {section.children
                  .filter((heading) => heading.level === 3)
                  .map((heading) => (
                    <li key={heading.id}>
                      <a
                        className="block text-gray-700 transition hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        href={`#${heading.id}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
