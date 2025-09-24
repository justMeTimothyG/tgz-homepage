"use client";

import type { MDXComponents } from 'mdx/types';
import { ExternalLink } from 'lucide-react';
import React, { ReactNode, useMemo } from 'react';

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
} from '@/components/markdown/CustomComponents';
import ExerciseClient, { ExerciseContentProps, TaskItem } from '@/components/markdown/ExerciseClient';
import PostPager from '@/components/PostPager';
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode };

interface TaskProps {
  children: ReactNode;
  variant?: 'default' | 'compact';
}

interface SimpleSlotProps {
  children: ReactNode;
}

interface ExerciseProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

type SlotComponent<P> = React.FC<P> & { slotKind: 'Task' | 'Hint' | 'Step' | 'Solution' };

const Task: SlotComponent<TaskProps> = () => null;
Task.displayName = 'Task';
Task.slotKind = 'Task';
const Hint: SlotComponent<SimpleSlotProps> = () => null;
Hint.displayName = 'Hint';
Hint.slotKind = 'Hint';
const Step: SlotComponent<SimpleSlotProps> = () => null;
Step.displayName = 'Step';
Step.slotKind = 'Step';
const Solution: SlotComponent<SimpleSlotProps> = () => null;
Solution.displayName = 'Solution';
Solution.slotKind = 'Solution';

function getSlotKind(node: React.ReactElement): 'Task' | 'Hint' | 'Step' | 'Solution' | null {
  const props = node.props as { ['data-ex-kind']?: string };
  const kindFromProp = typeof props['data-ex-kind'] === 'string' ? props['data-ex-kind'] : null;
  if (kindFromProp) return kindFromProp as 'Task' | 'Hint' | 'Step' | 'Solution';
  const type = node.type as { slotKind?: string } | undefined;
  if (type && typeof type.slotKind === 'string') {
    return type.slotKind as 'Task' | 'Hint' | 'Step' | 'Solution';
  }
  return null;
}

function collectExerciseContent(children: ReactNode, forceCompact: boolean) {
  const tasks: TaskItem[] = [];
  const hints: ReactNode[] = [];
  const steps: ReactNode[] = [];
  const solutions: ReactNode[] = [];

  const collect = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }

    if (!React.isValidElement(node)) {
      return;
    }

    const slotKind = getSlotKind(node);

    if (slotKind === 'Task') {
      const props = node.props as TaskProps;
      tasks.push({
        content: props.children,
        variant: forceCompact ? 'compact' : props.variant ?? 'default',
      });
      return;
    }

    if (slotKind === 'Hint') {
      const props = node.props as SimpleSlotProps;
      hints.push(props.children);
      return;
    }

    if (slotKind === 'Step') {
      const props = node.props as SimpleSlotProps;
      steps.push(props.children);
      return;
    }

    if (slotKind === 'Solution') {
      const props = node.props as SimpleSlotProps;
      solutions.push(props.children);
      return;
    }

    if (node.type === React.Fragment) {
      collect((node.props as { children?: ReactNode }).children ?? null);
    }
  };

  collect(children);

  return { tasks, hints, steps, solutions };
}

function ExercisePreview({
  title = 'Aufgabe',
  difficulty = 'medium',
  children,
  className = '',
  compact = false,
}: ExerciseProps) {
  const content = useMemo(() => collectExerciseContent(children, compact), [children, compact]);

  const clientProps: ExerciseContentProps = {
    title,
    difficulty,
    className,
    compact,
    tasks: content.tasks,
    hints: content.hints,
    steps: content.steps,
    solutions: content.solutions,
  };

  return <ExerciseClient {...clientProps} />;
}

// Client-side hook version for interactive MDX previews
export function useMDXComponents(components: MDXComponents): MDXComponents {
  const withNotProse = <P extends object>(Comp: React.ComponentType<P>) => (props: P) => (
    <div className="not-prose">
      {React.createElement<P>(Comp, props)}
    </div>
  );

  return {
    Exercise: withNotProse(ExercisePreview),
    Task,
    Hint,
    Step,
    Solution,

    GcdCalculator: withNotProse(GcdCalculator),
    LcmCalculator: withNotProse(LcmCalculator),
    GaussianElimination: withNotProse(GaussianElimination),
    PascalsTriangle: withNotProse(PascalsTriangle),
    VennSets: withNotProse(VennSets),
    Download: withNotProse(Download),

    PostPager: withNotProse(PostPager),

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
    ExternalLinkComponent,
    NumberedList,

    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
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

    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => {
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

    ...components,
  };
}
