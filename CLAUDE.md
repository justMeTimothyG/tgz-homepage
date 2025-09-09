# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development

- **Development server**: `npm run dev` (Turbopack-powered with HMR)
- **Resilient development**: `npm run dev:resilient` (nodemon-based auto-restart)
- **Production build**: `npm run build`
- **Production server**: `npm start`
- **Production with watch**: `npm start:watch` (nodemon-based)
- **Linting**: `npm run lint`

### Database Management

- **Start PostgreSQL**: `npm run db:up` (Docker Compose)
- **Stop database**: `npm run db:down`
- **Check database status**: `npm run db:status`
- **Generate migrations**: `npm run drizzle:generate`
- **Run migrations**: `npm run drizzle:migrate`
- **Database GUI**: `npm run drizzle:studio` (opens on port 4983)

## Architecture Overview

This is a **full-stack Next.js 15 personal website** for Timothy Lüdtke, featuring sophisticated content management for educational content, AI-powered blog generation, and interactive components. The site is primarily in German and designed as a content-rich platform for technical education.

### Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript with strict mode and ES modules
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Styling**: Tailwind CSS 4 with Typography plugin
- **Content**: Markdown with math support (KaTeX) and GitHub-flavored markdown
- **Build Tool**: Turbopack (default for dev and build)

## Database Architecture

### Schema Design

The database is designed for a **comprehensive educational content platform** with the following key entities:

- **Blog Posts** with versioning, status workflow (draft/published/archived), and MDX content support
- **Series & Podcasts** for organizing AI-generated educational audio content with transcripts
- **Hierarchical Tags** using materialized path pattern for nested categorization
- **Skills & Progress Tracking** with proficiency levels for learning documentation
- **Comments & Reactions** system with guest-friendly moderation
- **Component Catalog** for documenting interactive educational elements

### Connection & ORM

- **PostgreSQL 16** via Docker Compose (port 5433)
- **Drizzle ORM** with type-safe queries and migrations
- **Connection pooling** with singleton client pattern
- **Environment-based configuration** (`.env.local` for local overrides)

## API Architecture & Data Flow

### API Patterns

- **RESTful routes** following Next.js App Router conventions
- **Type-safe requests/responses** with comprehensive TypeScript interfaces
- **Admin authentication** via Bearer token, x-admin-token header, or query parameter
- **Graceful error handling** with fallback empty responses for client resilience

### Key API Routes

- **`/api/posts`**: GET (latest posts with limit), POST (upsert with tag management)
- **Tag auto-creation**: Automatic tag creation and association via slug matching
- **Status management**: Draft → Published → Archived workflow with date-based publishing

### Data Flow Patterns

- **Client-side fetching**: `LatestPostsClient` with loading states and error handling
- **Server-side rendering**: Blog pages with `force-dynamic` for fresh content
- **Static generation**: Homepage with `force-static` and client-side hydration
- **Skeleton loading**: Pixel-perfect loading states to prevent UI shifts

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

### Blog System Architecture

- **MDX content** with frontmatter parsing and GitHub-flavored markdown
- **Mathematical expressions** rendered with KaTeX for educational content
- **Version control** with complete history tracking in database
- **Publishing workflow**: Draft → Published → Archived with scheduled publishing
- **SEO optimization** with auto-generated meta tags and Open Graph support

### Admin Interface

- **Live preview editor** at `/admin` route with real-time markdown rendering
- **Tag management** with comma-separated input and auto-creation
- **Image handling** with Next.js Image optimization
- **Authentication**: Admin token-based access for content management

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