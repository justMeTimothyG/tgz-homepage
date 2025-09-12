# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development

- **Development server**: `npm run dev` (Turbopack-powered with HMR)
- **Production build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

### Content Management

- **Tailwind safelist generation**: `npm run tailwind:safelist` - Generates safelist for dynamic Tailwind classes

## Architecture Overview

This is a **static Next.js 15 personal website** for Timothy Lüdtke, featuring file-based content management for educational blog posts and interactive components. The site is primarily in German and designed as a content-rich platform for technical education.

### Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript with strict mode and ES modules
- **Content**: MDX files with frontmatter for blog posts
- **Styling**: Tailwind CSS 4 with Typography plugin
- **Markdown**: ReactMarkdown with math support (KaTeX) and GitHub-flavored markdown
- **Build Tool**: Turbopack (default for dev and build)

## Content Architecture

### Blog System

The blog system is file-based using MDX files stored in the `/content/blog/` directory:

- **MDX Files**: Blog posts written in MDX format with frontmatter metadata
- **Frontmatter**: Contains title, date, excerpt, tags, and published status
- **Static Generation**: Posts are read from filesystem during build time
- **Math Support**: KaTeX rendering for mathematical expressions
- **GitHub-flavored Markdown**: Enhanced markdown with tables, code blocks, etc.

### Content Structure

```
/content/blog/
├── post-slug.mdx
├── another-post.mdx
└── ...
```

Each MDX file contains:
```yaml
---
title: "Post Title"
date: "2025-01-12"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
published: true
---
```

### Data Flow

- **Build-time Generation**: Blog utilities read MDX files during static generation
- **Server-side Processing**: Posts processed on server using gray-matter for frontmatter parsing
- **Client-side Hydration**: Interactive components hydrated after initial page load
- **No API Routes**: All content served statically, no database queries

## Component Architecture & UI System

### Component Structure & Patterns

- **Navigation**: Client-side with `usePathname` for active states, responsive hamburger menu
- **Theme System**: Class-based dark mode with localStorage persistence and flash prevention
- **Markdown Processing**: Custom component with KaTeX math rendering, GFM support, and auto-generated TOCs
- **Loading States**: Pixel-perfect skeletons that match exact component dimensions to prevent layout shifts

### Key Components

- **`LatestPostsClient`**: Client-side data fetching with error states and loading skeletons
- **`LatestPostsSkeleton`**: Height-matched loading placeholders for seamless transitions
- **`Markdown`**: Full-featured MDX renderer with math expressions and heading anchors
- **`TableOfContents`**: Auto-generated from markdown headings with active section tracking
- **`ThemeToggle`**: System/light/dark mode cycling with proper SSR compatibility

### Styling System

- **Tailwind CSS 4** with custom shadow removal and scroll margin utilities
- **Typography plugin** for prose content with responsive text sizing
- **Dark mode**: Class-based system (`@custom-variant dark (&:where(.dark, .dark *))`)
- **Mobile-first responsive design** with consistent breakpoint usage
- **Geist fonts** integrated via CSS custom properties for optimal performance

## Content Management & Publishing

### Blog System

- **MDX content** with frontmatter parsing and GitHub-flavored markdown
- **Mathematical expressions** rendered with KaTeX for educational content
- **File-based version control** using Git for content history tracking
- **Publishing workflow**: Published status controlled via frontmatter `published: true/false`
- **SEO optimization** with auto-generated meta tags and Open Graph support

### Content Creation

- **Direct file editing** in IDE with TypeScript support and IntelliSense
- **Frontmatter validation** ensures consistent metadata structure
- **Image handling** with Next.js Image optimization for static assets
- **No admin interface** - content managed directly through filesystem

## Path Aliases & Configuration

- **`@/*`** maps to `./src/*` for clean imports
- **Absolute imports** preferred throughout codebase for maintainability
- **TypeScript strict mode** with comprehensive type coverage
- **ESLint**: Next.js + TypeScript rules with flat configuration format

## Development Guidelines

### Code Conventions

- **TypeScript**: Strict mode enabled, use proper typing
- **Components**: shadcn/ui patterns, no files >500 lines
- **Imports**: Use `@/` alias for src/ imports (`tsconfig.json` configured)
- **Validation**: Zod schemas for all form data
- **Testing**: Component tests in `tests/`, schema tests with descriptive names
- **Errors**: When handling errors, follow `/docs/rules/sentry.md`.

### Package Management

**⚠️ CRITICAL: Before installing ANY new package:**

1. **Search existing dependencies** - Many features are covered by current packages
2. **Verify compatibility** - Ensure React 19 + Next.js 15 support

**Common pre-installed alternatives:**

- Icons → `lucide-react` (534+ icons available)
- Forms → `react-hook-form` + `zod` validation
- UI Components → Radix UI primitives (shadcn/ui foundation)
- Animations → `motion` (Framer Motion alternative)
- HTTP → `node-fetch` + `@tanstack/react-query`
- Styling → `tailwindcss` + utility packages


## Important Context Awareness

### Do Not Assumed that tested is tested

- Test changes instead of assuming they work
- Verify outputs match expectations
- Handle errors properly
- Follow the complete checklist

#### Core Philosophy

- "Should work" != "does work" - Pattern matching isn't enough
- I'm not paid to write code, I'm paid to solve problems
- Untested code is just a guess, not a solution

#### The 30-Second Reality Check - Must anser YES to ALL:

- Did I run/build the code?
- Did I trigger the exact feature I changed?
- Did I see the expected result with my own oversation (including GUI)?
- Did I check for error messages?
- Would I bet 100$ this works?

### Phrase to avoid:

- "This should work"
- "I've fixed the issue" (especially 2nd+ time)
- "Try it now" (without trying myself)
- "The logic is correct so..."

### GDPR Compliance

- Contact form includes explicit consent checkboxes
- Data minimization principles applied
- EU data storage requirements (current/planned with Hetzner)
- No external trackers except planned self-hosted Plausible

### Performance Targets

- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Build times: <5 minutes consistently
- Prefer Linting checks and TSC Checking instead of complete building after smaller changes. do builds only when making comprehensive changes to multiple interacting elements of the web app.
