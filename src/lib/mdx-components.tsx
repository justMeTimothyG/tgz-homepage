import type { MDXComponents } from 'mdx/types';
import { ExternalLink } from 'lucide-react';
import Image, { ImageProps } from 'next/image';
import React from 'react';
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode };

// Import all custom components
import {
  Callout,
  CodeBlock,
  FeatureGrid,
  FeatureCard,
  Timeline,
  TimelineItem,
  Tabs,
  TabPanel,
  Stats,
  Stat,
  ExternalLinkComponent,
  NumberedList,
  GcdCalculator,
  LcmCalculator,
  GaussianElimination,
  PascalsTriangle,
  VennSets,
  Download,
  Table,
} from '@/components/markdown/CustomComponents';
import Exercise, { Hint as ExerciseHint, Solution as ExerciseSolution, Step as ExerciseStep, Task as ExerciseTask } from '@/components/markdown/Exercise';
import QuadraticSolver from '@/components/markdown/QuadraticSolver';
import PostPager from '@/components/PostPager';

// Non-hook version for server-side usage
export function getSiteMDXComponents(components: MDXComponents): MDXComponents {
  // Wrap custom components so they don't get affected by parent prose typography
  const withNotProse = <P extends object>(Comp: React.ComponentType<P>) => (props: P) => (
    <div className="not-prose">
      {React.createElement<P>(Comp, props)}
    </div>
  );

  const MdxImage: React.FC<ImageProps> = ({ className, alt = '', ...props }) => (
    <Image
      {...props}
      alt={alt}
      className={['rounded-lg border border-slate-200 shadow-sm dark:border-slate-700', className]
        .filter(Boolean)
        .join(' ')}
    />
  );

  return {
    // Custom educational components
    Exercise: withNotProse(Exercise),
    // Subcomponents are marker-wrapped so Exercise can detect them via props across RSC boundaries
    Task: ExerciseTask,
    Hint: ExerciseHint,
    Step: ExerciseStep,
    Solution: ExerciseSolution,

    // Calculator components
    GcdCalculator: withNotProse(GcdCalculator),
    LcmCalculator: withNotProse(LcmCalculator),
    GaussianElimination: withNotProse(GaussianElimination),
    PascalsTriangle: withNotProse(PascalsTriangle),
    VennSets: withNotProse(VennSets),
    Download: withNotProse(Download),
    QuadraticSolver: withNotProse(QuadraticSolver),
    Table: withNotProse(Table),

    Image: withNotProse(MdxImage),
    img: ({ className, alt, ...imgProps }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      // eslint-disable-next-line @next/next/no-img-element -- Raw img keeps MDX authoring flexibility when Next/Image constraints are unsuitable.
      <img
        {...imgProps}
        alt={alt ?? ''}
        className={['rounded-lg border border-slate-200 shadow-sm dark:border-slate-700', className]
          .filter(Boolean)
          .join(' ')}
      />
    ),

    // Blog navigation
    PostPager: withNotProse(PostPager),

    // Layout & UI components
    Callout: withNotProse(Callout),
    CodeBlock: withNotProse(CodeBlock),
    FeatureGrid: withNotProse(FeatureGrid),
    FeatureCard: withNotProse(FeatureCard),
    Timeline: withNotProse(Timeline),
    TimelineItem: withNotProse(TimelineItem),
    Tabs: withNotProse(Tabs),
    TabPanel: withNotProse(TabPanel),
    Stats: withNotProse(Stats),
    Stat: withNotProse(Stat),
    NumberedList,
    // Keep links inline; do not wrap with not-prose to avoid block divs in paragraphs
    ExternalLinkComponent,

    // Enhanced standard HTML elements
    a: ({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
      // Base link style (used for both internal and external links)
      const baseClass = "inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline";
      const cls = className ? `${baseClass} ${className}` : baseClass;

      // External links: open in new tab and show icon
      if (href?.startsWith('http')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
            {...props}
          >
            {children}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        );
      }

      // Internal links: same style, no icon/new tab
      return (
        <a href={href} className={cls} {...props}>
          {children}
        </a>
      );
    },

    // Do not render H1 inside MDX content to avoid duplicate page titles
    h1: () => null,

    h2: ({ children, ...props }: HeadingProps) => {
      const renderWithPreservation = (content: unknown) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">{part}</span>;
            }
            return part;
          });
        }
        if (React.isValidElement(content)) {
          const className = (content.props as Record<string, unknown>)?.['className'];
          if (typeof className === 'string' && className.includes('katex')) return content;
        }
        return <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">{content as React.ReactNode}</span>;
      };

      return (
        <h2 {...props}>
          {React.Children.map(children, (child) => renderWithPreservation(child))}
        </h2>
      );
    },

    h3: ({ children, ...props }: HeadingProps) => {
      const renderWithPreservation = (content: unknown) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400">{part}</span>;
            }
            return part;
          });
        }
        if (React.isValidElement(content)) {
          const className = (content.props as Record<string, unknown>)?.['className'];
          if (typeof className === 'string' && className.includes('katex')) return content;
        }
        return <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400">{content as React.ReactNode}</span>;
      };

      return (
        <h3 {...props}>
          {React.Children.map(children, (child) => renderWithPreservation(child))}
        </h3>
      );
    },

    h4: ({ children, ...props }: HeadingProps) => {
      const renderWithPreservation = (content: unknown) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400">{part}</span>;
            }
            return part;
          });
        }
        if (React.isValidElement(content)) {
          const className = (content.props as Record<string, unknown>)?.['className'];
          if (typeof className === 'string' && className.includes('katex')) return content;
        }
        return <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400">{content as React.ReactNode}</span>;
      };

      return (
        <h4 {...props}>
          {React.Children.map(children, (child) => renderWithPreservation(child))}
        </h4>
      );
    },

    h5: ({ children, ...props }: HeadingProps) => {
      const renderWithPreservation = (content: unknown) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-fuchsia-400 dark:to-pink-400">{part}</span>;
            }
            return part;
          });
        }
        if (React.isValidElement(content)) {
          const className = (content.props as Record<string, unknown>)?.['className'];
          if (typeof className === 'string' && className.includes('katex')) return content;
        }
        return <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-fuchsia-400 dark:to-pink-400">{content as React.ReactNode}</span>;
      };

      return (
        <h5 {...props}>
          {React.Children.map(children, (child) => renderWithPreservation(child))}
        </h5>
      );
    },

    h6: ({ children, ...props }: HeadingProps) => {
      const renderWithPreservation = (content: unknown) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-300 dark:to-emerald-400">{part}</span>;
            }
            return part;
          });
        }
        if (React.isValidElement(content)) {
          const className = (content.props as Record<string, unknown>)?.['className'];
          if (typeof className === 'string' && className.includes('katex')) return content;
        }
        return <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-300 dark:to-emerald-400">{content as React.ReactNode}</span>;
      };

      return (
        <h6 {...props}>
          {React.Children.map(children, (child) => renderWithPreservation(child))}
        </h6>
      );
    },

    // Enhanced code blocks with copy functionality
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => {
      // Check if this is a code block
      const childNode = Array.isArray(children) ? children[0] : children;
      if (React.isValidElement(childNode)) {
        const className = (childNode.props as Record<string, unknown>)?.['className'];
        if (typeof className === 'string' && className.includes('language-')) {
          const language = className.replace('language-', '');
          const code = (childNode.props as Record<string, unknown>)?.['children'] as React.ReactNode;
          return (
            <CodeBlock language={language} {...props}>
              {code}
            </CodeBlock>
          );
        }
      }
      return <pre {...props}>{children}</pre>;
    },

    // Allow any additional components passed from parent
    ...components,
  };
}
