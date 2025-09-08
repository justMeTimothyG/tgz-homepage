# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build` (uses Turbopack for faster builds)
- **Start production**: `npm start`
- **Linting**: `npm run lint` (ESLint with Next.js configuration)

## Architecture Overview

This is a Next.js 15 personal portfolio website for Timothy Lüdtke, a software engineer focused on interactive education and AI-powered content creation. The site is primarily in German.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build Tool**: Turbopack (enabled by default)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Navigation and fonts
│   ├── page.tsx           # Home page (About section)
│   ├── projects/page.tsx  # Projects showcase
│   ├── skills/page.tsx    # Skills overview
│   ├── learning/page.tsx  # Learning/blog content
│   └── contact/page.tsx   # Contact information
├── components/
│   ├── Navigation.tsx     # Main navigation component
│   └── interactive/       # Directory for interactive educational components
├── lib/                   # Utility functions and shared logic
└── types/                 # TypeScript type definitions
```

### Key Components

**Navigation Component** (`src/components/Navigation.tsx`):

- Client-side component using `usePathname` for active state
- Responsive design with mobile hamburger menu
- German navigation labels: "Über mich", "Projekte", "Fähigkeiten", "Lernen", "Kontakt"

**Layout Structure**:

- Root layout includes global Navigation component
- Uses CSS variables for Geist fonts
- German language (`lang="de"`)
- Tailwind classes for consistent styling

### Content Focus Areas

Based on the existing content, the site focuses on:

1. **Interactive Education**: Mathematical visualizations and algorithmic demonstrations
2. **AI Content Pipeline**: Automated systems for transforming research into educational content
3. **Technical Tutorials**: Comprehensive programming concept breakdowns
4. **Professional Development**: Documented learning journey in software engineering

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Styling Conventions

- Uses Tailwind CSS with utility classes
- Consistent color scheme: indigo primary, gray text/backgrounds
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Cards use `bg-white shadow-sm rounded-lg` pattern
- Color-coded sections with left borders (indigo, green, purple, orange)

### Development Notes

- ESLint configured with Next.js and TypeScript rules
- Turbopack enabled for faster development and builds
- Empty directories (lib/, types/, components/interactive/) suggest planned expansion
- Mobile-first responsive design approach
