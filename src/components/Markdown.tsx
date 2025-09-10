"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
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
  ExternalLinkComponent
} from "@/components/markdown/CustomComponents";
import "katex/dist/katex.min.css";

type Props = {
  children: string;
  className?: string;
};

// Custom component mapping for ReactMarkdown
const components = {
  // Custom components via HTML tags
  callout: Callout,
  codeblock: CodeBlock,
  featuregrid: FeatureGrid,
  featurecard: FeatureCard,
  timeline: Timeline,
  timelineitem: TimelineItem,
  tabs: Tabs,
  tabpanel: TabPanel,
  stats: Stats,
  stat: Stat,
  externallink: ExternalLinkComponent,
  
  // Enhanced standard HTML elements
  a: ({ href, children, ...props }: any) => {
    // Auto-detect external links
    if (href?.startsWith('http')) {
      return <ExternalLinkComponent href={href} {...props}>{children}</ExternalLinkComponent>;
    }
    return <a href={href} {...props}>{children}</a>;
  },
  
  // Enhanced code blocks
  pre: ({ children, ...props }: any) => {
    const child = React.Children.only(children);
    if (React.isValidElement(child) && (child.props as any).className) {
      const language = (child.props as any).className?.replace('language-', '');
      return (
        <CodeBlock language={language} {...props}>
          {(child.props as any).children}
        </CodeBlock>
      );
    }
    return <pre {...props}>{children}</pre>;
  }
};

export default function Markdown({ children, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeSlug, 
          [rehypeKatex, { 
            output: 'html', 
            strict: false, 
            throwOnError: false 
          }]
        ]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
