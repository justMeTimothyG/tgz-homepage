import type { MDXComponents } from 'mdx/types';
import { ExternalLink } from 'lucide-react';

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
  Exercise,
  Task as ImportedTask,
  Hint as ImportedHint,
  Step as ImportedStep,
  Solution as ImportedSolution,
  GcdCalculator,
  LcmCalculator
} from '@/components/markdown/CustomComponents';

// This function is used to provide components to MDX content
export function useMDXComponents(components: MDXComponents): MDXComponents {
  // Wrap custom components so they don't get affected by parent prose typography
  const withNotProse = (Comp: any) => (props: any) => (
    <div className="not-prose">
      <Comp {...props} />
    </div>
  );

  // Provide marker-wrapped variants so parent Exercise can reliably detect subcomponents
  const Task = (props: any) => <ImportedTask {...props} data-ex-kind="Task" />;
  Task.displayName = 'Task';
  const Hint = (props: any) => <ImportedHint {...props} data-ex-kind="Hint" />;
  Hint.displayName = 'Hint';
  const Step = (props: any) => <ImportedStep {...props} data-ex-kind="Step" />;
  Step.displayName = 'Step';
  const Solution = (props: any) => <ImportedSolution {...props} data-ex-kind="Solution" />;
  Solution.displayName = 'Solution';

  return {
    // Custom educational components
    Exercise: withNotProse(Exercise),
    // Subcomponents are marker-wrapped so Exercise can detect them via props across RSC boundaries
    Task,
    Hint,
    Step,
    Solution,
    
    // Calculator components  
    GcdCalculator: withNotProse(GcdCalculator),
    LcmCalculator: withNotProse(LcmCalculator),
    
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
    // Keep links inline; do not wrap with not-prose to avoid block divs in paragraphs
    ExternalLinkComponent,
    
    // Enhanced standard HTML elements
    a: ({ href, children, ...props }: any) => {
      // Auto-detect external links
      if (href?.startsWith('http')) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            {...props}
          >
            {children}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    },

    // Enhanced headings with gradient colors (emojis keep original color)
    h1: ({ children, ...props }: any) => {
      // Function to handle emoji preservation
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          // Split by emoji regex and wrap non-emoji parts with gradient
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              // This is an emoji, render without gradient
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              // This is text, apply gradient
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part; // whitespace or empty
          });
        }
        // For non-string content (React elements), apply gradient to the whole thing
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h1 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400")}
        </h1>
      );
    },

    h2: ({ children, ...props }: any) => {
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part;
          });
        }
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h2 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500")}
        </h2>
      );
    },

    h3: ({ children, ...props }: any) => {
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part;
          });
        }
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h3 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400")}
        </h3>
      );
    },

    h4: ({ children, ...props }: any) => {
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part;
          });
        }
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h4 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400")}
        </h4>
      );
    },

    h5: ({ children, ...props }: any) => {
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part;
          });
        }
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h5 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500 dark:from-fuchsia-400 dark:to-pink-400")}
        </h5>
      );
    },

    h6: ({ children, ...props }: any) => {
      const renderWithEmojiPreservation = (content: any, gradientClass: string) => {
        if (typeof content === 'string') {
          const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
          const parts = content.split(emojiRegex);
          return parts.map((part, index) => {
            if (emojiRegex.test(part)) {
              return <span key={index} style={{ color: 'initial' }}>{part}</span>;
            } else if (part.trim()) {
              return <span key={index} className={gradientClass}>{part}</span>;
            }
            return part;
          });
        }
        return <span className={gradientClass}>{content}</span>;
      };

      return (
        <h6 {...props}>
          {renderWithEmojiPreservation(children, "text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-emerald-300 dark:from-green-300 dark:to-emerald-400")}
        </h6>
      );
    },

    // Enhanced code blocks with copy functionality
    pre: ({ children, ...props }: any) => {
      // Check if this is a code block
      const child = Array.isArray(children) ? children[0] : children;
      if (child && typeof child === 'object' && child.props?.className?.includes('language-')) {
        const language = child.props.className.replace('language-', '');
        const code = child.props.children;
        return (
          <CodeBlock language={language} {...props}>
            {code}
          </CodeBlock>
        );
      }
      return <pre {...props}>{children}</pre>;
    },
    
    // Allow any additional components passed from parent
    ...components,
  };
}
