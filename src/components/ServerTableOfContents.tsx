"use client";
import React from "react";
import Link from "next/link";
import { ChevronLeft, List, ListTree } from "lucide-react";
import type { TocHeading, TocSection } from "@/lib/toc";

type Props = {
  headings: TocHeading[];
  sections: TocSection[];
  containerSelector: string;
};

export default function ServerTableOfContents({
  headings,
  sections,
  containerSelector,
}: Props) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (headings.length === 0) return;

    // Active section tracking via scroll position
    const onScroll = () => {
      const offset = 120; // header height + padding
      let current = headings[0]?.id || "";
      
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) current = h.id;
        else break;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  const activeH2Id = React.useMemo(() => {
    if (!activeId) return sections[0]?.id || "";
    // If activeId is itself an h2, return it; otherwise find its owning h2
    const idx = headings.findIndex((h) => h.id === activeId);
    if (idx >= 0) {
      if (headings[idx].level === 2) return headings[idx].id;
      for (let i = idx; i >= 0; i--) {
        if (headings[i].level === 2) return headings[i].id;
      }
    }
    return sections[0]?.id || "";
  }, [activeId, headings, sections]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <Link href="/blog" className="inline-flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>back to blog</span>
        </Link>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={showAll ? 'Show only H2' : 'Show H2–H4'}
        >
          <span className="sr-only">{showAll ? 'Collapse TOC' : 'Expand TOC'}</span>
          {showAll ? (
            <ListTree className="h-4 w-4" aria-hidden="true" />
          ) : (
            <List className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Items */}
      <ul className="space-y-1">
        {sections.map((sec) => (
          <li key={sec.id}>
            <a
              href={`#${sec.id}`}
              className={
                "block break-words hover:text-blue-600 dark:hover:text-blue-400 " +
                (activeH2Id === sec.id ? "text-blue-600 dark:text-blue-400" : "opacity-80")
              }
            >
              {sec.text}
            </a>
            {showAll && sec.children.length > 0 && (
              <ul className="mt-1">
                {sec.children.map((h) => (
                  <li key={h.id} className={indentClass(h.level, 2)}>
                    <a
                      href={`#${h.id}`}
                      className={
                        "block break-words hover:text-blue-600 dark:hover:text-blue-400 " +
                        (activeId === h.id ? "text-blue-600 dark:text-blue-400" : "opacity-80")
                      }
                    >
                      {h.text}
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

function indentClass(level: number, base: number) {
  const depth = Math.max(0, level - base);
  switch (depth) {
    case 0:
      return "ml-0";
    case 1:
      return "ml-4";
    case 2:
      return "ml-8";
    default:
      return "ml-10";
  }
}