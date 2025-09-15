"use client";

import Link from "next/link";
import clsx from "clsx";

type NavLink = {
  href: string;
  title: string;
};

export default function PostPager({
  prev,
  next,
  className,
}: {
  prev?: NavLink;
  next?: NavLink;
  className?: string;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Blog post pagination"
      className={clsx("not-prose mt-10", className)}
    >
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {prev && (
          <PagerCard
            href={prev.href}
            title={prev.title}
            label="Previous"
            align="left"
          />
        )}
        {next && (
          <PagerCard
            href={next.href}
            title={next.title}
            label="Next"
            align="right"
          />
        )}
      </div>
    </nav>
  );
}

function PagerCard({
  href,
  title,
  label,
  align,
}: NavLink & { label: string; align: "left" | "right" }) {
  const isRight = align === "right";
  return (
    <Link
      href={href}
      className={clsx(
        "group relative flex items-center gap-4 rounded-lg border border-border p-4 transition-colors",
        // Subtle brand-tinted hover instead of generic accent fill
        "hover:bg-primary/5 focus:bg-primary/5 hover:border-primary/30 focus:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isRight ? "justify-end" : "justify-start"
      )}
    >
      {!isRight && (
        <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
      )}

      <div className={clsx("min-w-0", isRight ? "text-right" : "text-left")}
      >
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground group-hover:text-primary">
          {label}
        </div>
        <div className="truncate text-base font-medium text-foreground">
          {title}
        </div>
      </div>

      {isRight && (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
      )}
    </Link>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
