"use client";

import React, { useEffect, useState, ReactNode } from 'react';
import { Eye, Lightbulb, ListOrdered, RotateCcw, Pencil } from 'lucide-react';

// Sub-components for better modularity and styling control
export function Task({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
          <Pencil className="w-4 h-4" />
        </div>
        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-5 mb-6">
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
Task.displayName = 'Task';

export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  );
}
Hint.displayName = 'Hint';

export function Step({ children }: { children: ReactNode }) {
  return (
    <div
      className="prose dark:prose-invert max-w-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:pl-1"
    >
      {children}
    </div>
  );
}
Step.displayName = 'Step';

export function Solution({ children }: { children: ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  );
}
Solution.displayName = 'Solution';

interface ExerciseProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  children?: ReactNode;
  className?: string;
  compact?: boolean; // hide header and use borderless action buttons
}

export default function Exercise({
  title = "Aufgabe",
  difficulty = 'medium',
  children,
  className = "",
  compact = false,
}: ExerciseProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Extract sub-components from children
  const taskComponents: ReactNode[] = [];
  const hintComponents: ReactNode[] = [];
  const stepComponents: ReactNode[] = [];
  const solutionComponents: ReactNode[] = [];

  // Parse children by checking component types directly (handles fragments/arrays)
  const isNamed = (node: React.ReactElement, names: string[]) => {
    const t = node?.type as { displayName?: string; name?: string };
    const name = t?.displayName || t?.name;
    return !!name && names.includes(name);
  };

  const getMdxTypeName = (node: React.ReactElement | null): string | null => {
    if (!node || !('props' in node)) return null;
    const p = node.props as Record<string, unknown>;
    // MDX v2/v3 may attach one of these
    if (typeof p.mdxType === 'string') return p.mdxType;
    const m2 = (p as Record<string, unknown>)['_mdxType'];
    if (typeof m2 === 'string') return m2;
    if ('originalType' in p) {
      const ot = (p as Record<string, unknown>).originalType as unknown;
      if (typeof ot === 'string') return ot;
      const n = (ot as { displayName?: string; name?: string } | undefined)?.displayName || (ot as { name?: string } | undefined)?.name;
      if (n) return n;
    }
    return null;
  };

  const collect = (node: ReactNode) => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (!React.isValidElement(node)) return;
    const t = node.type as unknown;
    const mdxName = getMdxTypeName(node);
    // Prefer explicit marker prop injected by MDX component mapping
    const kind = (node.props as Record<string, unknown>)?.['data-ex-kind'] as string | undefined;
    if (kind === 'Task' || t === Task || isNamed(node, ['Task']) || mdxName === 'Task') {
      taskComponents.push(node);
    } else if (kind === 'Hint' || t === Hint || isNamed(node, ['Hint']) || mdxName === 'Hint') {
      hintComponents.push(node);
    } else if (kind === 'Step' || t === Step || isNamed(node, ['Step']) || mdxName === 'Step') {
      stepComponents.push(node);
    } else if (kind === 'Solution' || t === Solution || isNamed(node, ['Solution']) || mdxName === 'Solution') {
      solutionComponents.push(node);
    } else if (t === React.Fragment) {
      collect((node.props as Record<string, unknown>).children as ReactNode);
    }
  };
  collect(children);

  // Reset visibility when content changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      try {
        const names: string[] = [];
        React.Children.forEach(children as React.ReactNode, (node) => {
          if (!React.isValidElement(node)) return;
          const t = node.type as { displayName?: string; name?: string } | string;
          const typeName = typeof t === 'string' ? t : (t?.displayName || t?.name);
          const n = typeName || getMdxTypeName(node) || 'unknown';
          names.push(String(n));
        });
        // Dev-only: log collected child node names
        if (names.length && typeof window !== 'undefined') {
          // Intentionally silent for lint cleanliness
        }
      } catch {}
    }
    setShowSolution(false);
    setVisibleHints(0);
    setVisibleSteps(0);
  }, [children]);

  const difficultyColors = {
    easy: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800'
    },
    medium: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800'
    },
    hard: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800'
    }
  };

  const colors = difficultyColors[difficulty];

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  const showNextHint = () => {
    if (visibleHints < hintComponents.length) {
      setVisibleHints(visibleHints + 1);
    }
  };

  const showNextStep = () => {
    if (visibleSteps < stepComponents.length) {
      setVisibleSteps(visibleSteps + 1);
    }
  };

  const reset = () => {
    setShowSolution(false);
    setVisibleHints(0);
    setVisibleSteps(0);
  };

  const getDifficultyLabel = () => {
    const labels = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' };
    return labels[difficulty];
  };

  // Compact: slightly more top padding for even spacing
  const containerPadding = compact ? 'pt-4 pr-3 pb-3 pl-3' : 'p-6';
  const containerMargin = compact ? 'my-2' : 'my-6';
  const containerClasses = `group relative not-prose border border-gray-200 dark:border-gray-700 rounded-lg ${containerPadding} ${containerMargin} bg-white dark:bg-gray-800 ${className}`;

  // Button styles
  const btnBase = "flex items-center gap-2 text-sm font-medium transition-colors";
  const btnDisabled = "disabled:opacity-50 disabled:cursor-not-allowed";
  // Use compact (link-style) buttons in both variants
  const btnSolution = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${btnDisabled}`;
  const btnHint = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 ${btnDisabled}`;
  const btnStep = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${btnDisabled}`;
  const btnReset = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100`;

  return (
    <div className={containerClasses}>
      {/* Header with title and difficulty pill */}
      {!compact && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          {/* Difficulty pill in top right */}
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {getDifficultyLabel()}
          </span>
        </div>
      )}

      {/* Task - always visible */}
      {taskComponents.length > 0 && (
        <div className={compact ? 'mb-3' : 'mb-6'}>
          {taskComponents.map((node, i) => (
            React.isValidElement(node)
              ? React.cloneElement(node, { key: i, ...(compact ? { variant: 'compact' } : {}) })
              : <React.Fragment key={i}>{node}</React.Fragment>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex flex-wrap gap-3 justify-end ${compact ? 'mt-2' : ''}`}>
        {solutionComponents.length > 0 && (
          <button
            onClick={toggleSolution}
            className={btnSolution}
          >
            <Eye className="w-4 h-4" />
            {showSolution ? 'Lösung verbergen' : 'Lösung zeigen'}
          </button>
        )}
        
        {hintComponents.length > 0 && (
          <button
            onClick={showNextHint}
            disabled={visibleHints >= hintComponents.length}
            className={btnHint}
          >
            <Lightbulb className="w-4 h-4" />
            Tipps ({visibleHints}/{hintComponents.length})
          </button>
        )}
        
        {stepComponents.length > 0 && (
          <button
            onClick={showNextStep}
            disabled={visibleSteps >= stepComponents.length}
            className={btnStep}
          >
            <ListOrdered className="w-4 h-4" />
            Schritte ({visibleSteps}/{stepComponents.length})
          </button>
        )}

        {/* Reset button - always show if there are interactive elements */}
        {(solutionComponents.length > 0 || hintComponents.length > 0 || stepComponents.length > 0) && (
          <button
            onClick={reset}
            className={btnReset}
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Hints Section (render hints directly) */}
      {visibleHints > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Tipps:
          </h4>
          <div className="space-y-3">
            {hintComponents.slice(0, visibleHints).map((hint, index) => (
              <div key={index}>{hint}</div>
            ))}
          </div>
        </div>
      )}

      {/* Steps Section (render steps with numbers) */}
      {visibleSteps > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-green-600 dark:text-green-400" />
            Rechenweg:
          </h4>
          <div className="space-y-5">
            {stepComponents.slice(0, visibleSteps).map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Section (render directly without extra container) */}
      {showSolution && solutionComponents.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Lösung:
          </h4>
          <div>
            {solutionComponents.map((node, i) => (
              React.isValidElement(node)
                ? React.cloneElement(node, { key: i })
                : <React.Fragment key={i}>{node}</React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
