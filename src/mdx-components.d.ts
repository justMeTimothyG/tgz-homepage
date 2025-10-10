import 'mdx/types';
import type React from 'react';

type EmptyProps = Record<string, never>;

declare module 'mdx/types' {
  // Augment the MDX component mapping for IntelliSense in .mdx files
  // Keep props aligned with implementations under src/components/markdown
  interface MDXComponents {
    // Learning components
    Exercise: (props: {
      title?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      className?: string;
      compact?: boolean;
      children?: React.ReactNode;
    }) => React.ReactNode;
    Task: (props: { variant?: 'default' | 'compact'; children?: React.ReactNode }) => React.ReactNode;
    Hint: (props: { children?: React.ReactNode }) => React.ReactNode;
    Step: (props: { children?: React.ReactNode }) => React.ReactNode;
    Solution: (props: { children?: React.ReactNode }) => React.ReactNode;

    // Calculators & interactive widgets
    GcdCalculator: (props: EmptyProps) => React.ReactNode;
    LcmCalculator: (props: EmptyProps) => React.ReactNode;
    GaussianElimination: (props: EmptyProps) => React.ReactNode;
    PascalsTriangle: (props: EmptyProps) => React.ReactNode;
    VennSets: (props: EmptyProps) => React.ReactNode;

    // Download
    Download: (props:
      | ({ href: string; fileType?: string } & {
          title: string;
          description?: string;
          fileName?: string;
          accent?: 'blue' | 'green' | 'purple' | 'gray';
        })
      | ({
          variants: Array<{ variant: string; link: string; filetype?: string; fileName?: string }>;
        } & {
          title: string;
          description?: string;
          accent?: 'blue' | 'green' | 'purple' | 'gray';
        })
    ) => React.ReactNode;

    // Blog navigation
    PostPager: (props: { prev?: unknown; next?: unknown }) => React.ReactNode;

    // UI and layout helpers
    Callout: (props: {
      type?: 'info' | 'warning' | 'error' | 'success';
      title?: string;
      children: React.ReactNode;
    }) => React.ReactNode;
    CodeBlock: (props: { language?: string; title?: string; children: React.ReactNode }) => React.ReactNode;
    FeatureGrid: (props: { children: React.ReactNode }) => React.ReactNode;
    FeatureCard: (props: {
      title: string;
      icon?: string;
      color?: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
      children: React.ReactNode;
    }) => React.ReactNode;
    Timeline: (props: { children: React.ReactNode }) => React.ReactNode;
    TimelineItem: (props: { title: string; date?: string; children: React.ReactNode }) => React.ReactNode;
    Tabs: (props: { children: React.ReactNode; defaultTab?: number }) => React.ReactNode;
    TabPanel: (props: { label: string; children: React.ReactNode }) => React.ReactNode;
    Stats: (props: { children: React.ReactNode }) => React.ReactNode;
    Stat: (props: { label: string; value: string | number; trend?: 'up' | 'down' }) => React.ReactNode;
    NumberedList: (props: {
      variant?: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
      tight?: boolean;
      start?: number;
      className?: string;
      children: React.ReactNode;
    }) => React.ReactNode;
    List: (props: {
      variant?: 'disc' | 'circle' | 'square';
      tight?: boolean;
      className?: string;
      children: React.ReactNode;
    }) => React.ReactNode;
    Lightbox: (props: {
      className?: string;
      caption?: React.ReactNode;
      children: React.ReactNode;
    }) => React.ReactNode;
    ExternalLinkComponent: (props: React.ComponentProps<'a'>) => React.ReactNode;
  }
}
