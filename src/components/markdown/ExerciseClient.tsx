"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { Eye, Lightbulb, ListOrdered, RotateCcw, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface TaskItem {
  content: ReactNode;
  variant: 'default' | 'compact';
}

export interface ExerciseContentProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  className?: string;
  compact?: boolean;
  tasks: TaskItem[];
  hints: ReactNode[];
  steps: ReactNode[];
  solutions: ReactNode[];
}

const difficultyColors = {
  easy: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800',
  },
  medium: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800',
  },
  hard: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-800',
  },
} as const;

const btnBase = 'flex items-center gap-2 text-sm font-medium transition-colors';
const btnDisabled = 'disabled:opacity-50 disabled:cursor-not-allowed';
const btnSolution = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${btnDisabled}`;
const btnHint = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 ${btnDisabled}`;
const btnStep = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${btnDisabled}`;
const btnReset = `${btnBase} px-2 py-1 bg-transparent border-0 rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100`;
const inlineBtnHint = `${btnHint} px-3 py-2 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-100 dark:border-amber-800`;
const inlineBtnStep = `${btnStep} px-3 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-100 dark:border-green-800`;
const inlineBtnSolution = `${btnSolution} px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-800`;

function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const labels = { easy: 'Einfach', medium: 'Mittel', hard: 'Schwer' } as const;
  return labels[difficulty];
}

function renderTask(task: TaskItem, index: number, isCompact: boolean): React.ReactElement {
  if (task.variant === 'compact') {
    return (
      <div key={index} className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
          <Pencil className="w-4 h-4" />
        </div>
        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 prose-ol:list-decimal prose-ul:list-disc prose-li:pl-1 prose-li:mr-4">
          {task.content}
        </div>
      </div>
    );
  }

  const spacing = isCompact ? 'p-4 mb-3' : 'p-5 mb-6';

  return (
    <div key={index} className={`bg-gray-50 dark:bg-gray-900/50 rounded-lg ${spacing}`}>
      <div className="prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:pl-1 prose-li:mr-4">
        {task.content}
      </div>
    </div>
  );
}

export default function ExerciseClient({
  title,
  difficulty,
  className = '',
  compact = false,
  tasks,
  hints,
  steps,
  solutions,
}: ExerciseContentProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);

  const revealNextHint = () => setVisibleHints((prev) => Math.min(prev + 1, hints.length));
  const revealNextStep = () => setVisibleSteps((prev) => Math.min(prev + 1, steps.length));

  useEffect(() => {
    setShowSolution(false);
    setVisibleHints(0);
    setVisibleSteps(0);
  }, [tasks, hints, steps, solutions]);

  const colors = difficultyColors[difficulty];
  const containerPadding = compact ? 'pt-4 pr-3 pb-3 pl-3' : 'p-6';
  const containerMargin = compact ? 'my-2' : 'my-6';
  const containerClasses = `group relative not-prose border border-gray-200 dark:border-gray-700 rounded-lg ${containerPadding} ${containerMargin} bg-white dark:bg-gray-800 ${className}`;

  return (
    <div className={containerClasses}>
      {!compact && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      )}

      {tasks.length > 0 && (
        <div className={compact ? 'mb-3' : 'mb-6'}>
          {tasks.map((task, index) => renderTask(task, index, compact))}
        </div>
      )}

      <div className={`flex flex-wrap gap-3 justify-end ${compact ? 'mt-2' : ''}`}>
        {solutions.length > 0 && (
          <button onClick={() => setShowSolution((prev) => !prev)} className={btnSolution}>
            <Eye className="w-4 h-4" />
            {showSolution ? 'Lösung verbergen' : 'Lösung zeigen'}
          </button>
        )}

        {hints.length > 0 && (
          <button onClick={revealNextHint} disabled={visibleHints >= hints.length} className={btnHint}>
            <Lightbulb className="w-4 h-4" />
            Tipps ({visibleHints}/{hints.length})
          </button>
        )}

        {steps.length > 0 && (
          <button onClick={revealNextStep} disabled={visibleSteps >= steps.length} className={btnStep}>
            <ListOrdered className="w-4 h-4" />
            Schritte ({visibleSteps}/{steps.length})
          </button>
        )}

        {(solutions.length > 0 || hints.length > 0 || steps.length > 0) && (
          <button
            onClick={() => {
              setShowSolution(false);
              setVisibleHints(0);
              setVisibleSteps(0);
            }}
            className={btnReset}
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {hints.length > 0 && visibleHints > 0 && (
          <motion.div
            key="hints"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-6"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Tipps:
            </h4>
            <div className="space-y-3">
              {hints.slice(0, visibleHints).map((hint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.05 }}
                  className="overflow-x-auto"
                >
                  <div className="inline-block min-w-full prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:pl-1 prose-li:mr-4">
                    {hint}
                  </div>
                </motion.div>
              ))}
            </div>
            {visibleHints > 0 && visibleHints < hints.length && (
              <button onClick={revealNextHint} className={`${inlineBtnHint} mt-3`}>
                <Lightbulb className="w-4 h-4" />
                Nächsten Tipp anzeigen
              </button>
            )}
            {visibleHints === hints.length && steps.length > 0 && visibleSteps === 0 && (
              <button onClick={revealNextStep} className={`${inlineBtnStep} mt-3`}>
                <ListOrdered className="w-4 h-4" />
                Ersten Schritt anzeigen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {steps.length > 0 && visibleSteps > 0 && (
          <motion.div
            key="steps"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-6"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-green-600 dark:text-green-400" />
              Rechenweg:
            </h4>
            <div className="space-y-5">
              {steps.slice(0, visibleSteps).map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div className="inline-block min-w-full prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:pl-1 prose-li:mr-4">
                      {step}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {visibleSteps > 0 && visibleSteps < steps.length && (
              <button onClick={revealNextStep} className={`${inlineBtnStep} mt-4`}>
                <ListOrdered className="w-4 h-4" />
                Nächsten Schritt anzeigen
              </button>
            )}
            {visibleSteps === steps.length && !showSolution && solutions.length > 0 && (
              <button onClick={() => setShowSolution(true)} className={`${inlineBtnSolution} mt-4`}>
                <Eye className="w-4 h-4" />
                Lösung anzeigen
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showSolution && solutions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Lösung:
          </h4>
          <div className="space-y-4">
            {solutions.map((solution, index) => (
              <div key={index} className="overflow-x-auto">
                <div className="inline-block min-w-full prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:pl-1 prose-li:mr-4">
                  {solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
