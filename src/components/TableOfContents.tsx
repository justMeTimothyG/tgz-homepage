"use client";
import React from "react";
import Link from "next/link";
import { ChevronLeft, List, ListTree } from "lucide-react";

type Heading = {
  id: string;
  text: string;
  level: number; // 2..6
};

type Section = {
  id: string;
  text: string;
  children: Heading[]; // h3+ in order; may include deeper levels
};

type Props = {
  containerSelector: string; // CSS selector for the article container
  minLevel?: number; // default 2
  maxLevel?: number; // default 4
};

export default function TableOfContents({
  containerSelector,
  minLevel = 2,
  maxLevel = 4,
}: Props) {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState<boolean>(false);

  const handleScrollTo = React.useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (!element) return;

    const headerOffset = 120; // Account for fixed header + padding
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Update URL without triggering navigation
    const url = new URL(window.location.href);
    url.hash = targetId;
    window.history.replaceState(null, '', url.toString());
  }, []);

  // Remove a single leading emoji sequence plus following space(s)
  function stripLeadingEmoji(s: string): string {
    try {
      return s.replace(
        /^(?:\p{Extended_Pictographic}(?:[\uFE0F\uFE0E])?(?:\u200D\p{Extended_Pictographic}(?:[\uFE0F\uFE0E])?)*)\s*/u,
        ""
      );
    } catch {
      // Fallback for environments without Unicode property escapes
      return s.replace(/^[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\uFE0F\uFE0E]?\s*/u, "");
    }
  }

  React.useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement | null;
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLHeadingElement>(
        Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => `h${i + minLevel}`).join(",")
      )
    );

    const hs: Heading[] = nodes
      .filter((el) => !!el.id)
      .map((el) => ({ id: el.id, text: stripLeadingEmoji(el.textContent || ""), level: Number(el.tagName.substring(1)) }))
      .filter((h) => h.level >= minLevel && h.level <= maxLevel);

    setHeadings(hs);

    // Build sections grouped by nearest preceding h2
    const secs: Section[] = [];
    let current: Section | null = null;
    for (const h of hs) {
      if (h.level === 2) {
        current = { id: h.id, text: h.text, children: [] };
        secs.push(current);
      } else if (current) {
        current.children.push(h);
      }
    }
    setSections(secs);

    // Active section via scroll position
    const onScroll = () => {
      const offset = 120; // header height + padding
      let current = hs[0]?.id || "";
      for (const h of hs) {
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
  }, [containerSelector, minLevel, maxLevel]);

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
            <button
              onClick={() => handleScrollTo(sec.id)}
              className={
                "block w-full text-left break-words hover:text-blue-600 dark:hover:text-blue-400 " +
                (activeH2Id === sec.id ? "text-blue-600 dark:text-blue-400" : "opacity-80")
              }
            >
              {sec.text}
            </button>
            {showAll && sec.children.length > 0 && (
              <ul className="mt-1">
                {sec.children.map((h) => (
                  <li key={h.id} className={indentClass(h.level, 2)}>
                    <button
                      onClick={() => handleScrollTo(h.id)}
                      className={
                        "block w-full text-left break-words hover:text-blue-600 dark:hover:text-blue-400 " +
                        (activeId === h.id ? "text-blue-600 dark:text-blue-400" : "opacity-80")
                      }
                    >
                      {h.text}
                    </button>
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
