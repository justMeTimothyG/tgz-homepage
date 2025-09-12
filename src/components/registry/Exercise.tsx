"use client";

import React, { useState, ReactNode } from 'react';
import { BookOpen, Eye, Lightbulb, ListOrdered, RotateCcw } from 'lucide-react';

// Sub-components for better modularity and styling control
export function Task({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  );
}

export function Solution({ children }: { children: ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      {children}
    </div>
  );
}

interface ExerciseProps {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  children?: ReactNode;
  className?: string;
}

export default function Exercise({
  title = "Aufgabe",
  difficulty = 'medium',
  children,
  className = ""
}: ExerciseProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [visibleHints, setVisibleHints] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);

  // Extract sub-components from children
  const taskComponents: ReactNode[] = [];
  const hintComponents: ReactNode[] = [];
  const stepComponents: ReactNode[] = [];
  const solutionComponents: ReactNode[] = [];

  // Since MDX compilation loses component type information, we need to parse differently
  // We'll use content analysis to determine component types based on expected MDX structure
  const extractContent = (element: any): string => {
    if (!React.isValidElement(element)) return '';
    
    // Extract text content recursively
    const getText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (React.isValidElement(node)) {
        const props = node.props as any;
        if (props?.children) {
          if (Array.isArray(props.children)) {
            return props.children.map(getText).join('');
          }
          return getText(props.children);
        }
      }
      return '';
    };
    
    return getText(element);
  };

  // Parse based on the original MDX structure
  // We know from the MDX content: Task, Hint(s), Step(s), Solution
  // In production, components are minified and the wrapper structure is different
  // All valid React element children should be the actual sub-components
  const wrappedChildren = React.Children.toArray(children).filter(child => {
    if (!React.isValidElement(child)) return false;
    
    // In production, just accept all React elements with content
    // Since debug shows all children have nested <p> elements, they are real components
    const props = child.props as any;
    return props?.children && React.Children.count(props.children) > 0;
  });

  console.log(`Found ${wrappedChildren.length} wrapped components to parse`);

  // We need to determine component types based on content patterns or order
  // Since we can't rely on component names, let's use a content-based approach
  wrappedChildren.forEach((child, index) => {
    if (!React.isValidElement(child)) return;
    
    const content = extractContent(child);
    console.log(`Wrapped component ${index} content preview:`, content.substring(0, 50));
    
    // Extract the content directly since these are the actual components
    const innerContent = child;
    
    // Improved content-based pattern matching
    const lowerContent = content.toLowerCase();
    
    if (index === 0) {
      // First component is usually Task
      taskComponents.push(innerContent);
      console.log('✅ Assigned to Task (first component)');
    } else if (lowerContent.includes('tipp') || lowerContent.includes('hint') || 
               lowerContent.includes('finde') || lowerContent.includes('bestimme')) {
      // Hints typically contain guidance words
      hintComponents.push(innerContent);
      console.log('✅ Assigned to Hint (content pattern)');
    } else if (lowerContent.includes('schritt') || lowerContent.includes('step') ||
               (lowerContent.includes('=') && (lowerContent.includes('bestimme') || lowerContent.includes('ggT') || lowerContent.includes('kürze')))) {
      // Steps are procedural instructions, often with calculations
      stepComponents.push(innerContent);
      console.log('✅ Assigned to Step (content pattern)');  
    } else if (lowerContent.includes('lösung') || lowerContent.includes('solution') || 
               lowerContent.includes('vollständig') || lowerContent.includes('probe') ||
               (content.includes('**') && (lowerContent.includes('ist') || content.includes('✅')))) {
      // Solutions contain final answers, often formatted with bold text and check marks
      solutionComponents.push(innerContent);
      console.log('✅ Assigned to Solution (content pattern)');
    } else {
      // Default assignment based on order and context
      if (taskComponents.length === 0) {
        taskComponents.push(innerContent);
        console.log('✅ Assigned to Task (default first)');
      } else {
        // Look at relative position and surrounding context to make better guesses
        const remainingCount = wrappedChildren.length - index;
        
        if (index <= 2 && !lowerContent.includes('=')) {
          // Early components without calculations are likely hints
          hintComponents.push(innerContent);
          console.log('✅ Assigned to Hint (position + no calculations)');
        } else if (remainingCount > 1 && lowerContent.includes('=')) {
          // Components with calculations that aren't the last are likely steps
          stepComponents.push(innerContent);
          console.log('✅ Assigned to Step (position + has calculations)');
        } else {
          // Default to solution for remaining components
          solutionComponents.push(innerContent);
          console.log('✅ Assigned to Solution (default remaining)');
        }
      }
    }
  });
  
  console.log('Exercise component counts:', {
    tasks: taskComponents.length,
    hints: hintComponents.length, 
    steps: stepComponents.length,
    solutions: solutionComponents.length
  });

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

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800 ${className}`}>
      {/* Header with title and difficulty pill */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        {/* Difficulty pill in top right */}
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
          {getDifficultyLabel()}
        </span>
      </div>

      {/* Task - always visible */}
      {taskComponents.length > 0 && (
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <div className="prose dark:prose-invert max-w-none">
              {taskComponents}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - always visible */}
      <div className="flex flex-wrap gap-2 mb-6">
        {solutionComponents.length > 0 && (
          <button
            onClick={toggleSolution}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600
                     hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-200 
                     hover:border-blue-200 dark:hover:border-blue-800
                     active:bg-blue-200 dark:active:bg-blue-900/50"
          >
            <Eye className="w-4 h-4" />
            {showSolution ? 'Lösung verbergen' : 'Lösung zeigen'}
          </button>
        )}
        
        {hintComponents.length > 0 && (
          <button
            onClick={showNextHint}
            disabled={visibleHints >= hintComponents.length}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600
                     hover:enabled:bg-amber-100 dark:hover:enabled:bg-amber-900/30 hover:enabled:text-amber-800 dark:hover:enabled:text-amber-200 
                     hover:enabled:border-amber-200 dark:hover:enabled:border-amber-800
                     active:enabled:bg-amber-200 dark:active:enabled:bg-amber-900/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-4 h-4" />
            Tipps ({visibleHints}/{hintComponents.length})
          </button>
        )}
        
        {stepComponents.length > 0 && (
          <button
            onClick={showNextStep}
            disabled={visibleSteps >= stepComponents.length}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600
                     hover:enabled:bg-green-100 dark:hover:enabled:bg-green-900/30 hover:enabled:text-green-800 dark:hover:enabled:text-green-200 
                     hover:enabled:border-green-200 dark:hover:enabled:border-green-800
                     active:enabled:bg-green-200 dark:active:enabled:bg-green-900/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ListOrdered className="w-4 h-4" />
            Schritte ({visibleSteps}/{stepComponents.length})
          </button>
        )}

        {/* Reset button - always show if there are interactive elements */}
        {(solutionComponents.length > 0 || hintComponents.length > 0 || stepComponents.length > 0) && (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600
                     hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200
                     active:bg-gray-300 dark:active:bg-gray-500"
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Hints Section */}
      {visibleHints > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Tipps:
          </h4>
          <div className="space-y-3">
            {hintComponents.slice(0, visibleHints).map((hint, index) => (
              <div key={index} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/30 
                                rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 
                                text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps Section */}
      {visibleSteps > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-green-600 dark:text-green-400" />
            Rechenweg:
          </h4>
          <div className="space-y-3">
            {stepComponents.slice(0, visibleSteps).map((step, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 
                                rounded-full flex items-center justify-center text-green-600 dark:text-green-400 
                                text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {step}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Section */}
      {showSolution && solutionComponents.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Lösung:
          </h4>
          <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
            {solutionComponents}
          </div>
        </div>
      )}
    </div>
  );
}