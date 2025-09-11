"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calculator, RotateCcw, Dices } from 'lucide-react';

interface GcdStep {
  step: number;
  a: number;
  b: number;
  remainder: number;
  quotient: number;
  calculation: string;
  description: string;
}

interface GcdCalculatorProps {
  title?: string;
  description?: string;
  initialA?: number;
  initialB?: number;
}

export default function GcdCalculator({
  title = "ggT-Rechner (Größter gemeinsamer Teiler)",
  description = "Berechnet den ggT zweier Zahlen mit dem euklidischen Algorithmus.",
  initialA = 48,
  initialB = 18
}: GcdCalculatorProps) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [showSteps, setShowSteps] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const { gcd, steps } = useMemo(() => {
    if (a <= 0 || b <= 0) {
      return { gcd: 0, steps: [] };
    }

    const calculationSteps: GcdStep[] = [];
    let currentA = Math.abs(a);
    let currentB = Math.abs(b);
    let stepNumber = 1;

    // Ensure a >= b for cleaner presentation
    if (currentA < currentB) {
      [currentA, currentB] = [currentB, currentA];
    }

    while (currentB !== 0) {
      const remainder = currentA % currentB;
      const quotient = Math.floor(currentA / currentB);
      
      calculationSteps.push({
        step: stepNumber,
        a: currentA,
        b: currentB,
        remainder,
        quotient,
        calculation: `${currentA} / ${currentB} = ${quotient} + (Rest: ${remainder})`,
        description: remainder === 0 
          ? `${currentA} ist durch ${currentB} teilbar. Der ggT ist ${currentB}.`
          : `${currentA} geteilt durch ${currentB} ergibt ${quotient} Rest ${remainder}.`
      });

      currentA = currentB;
      currentB = remainder;
      stepNumber++;
    }

    return { gcd: currentA, steps: calculationSteps };
  }, [a, b]);

  const reset = () => {
    setA(initialA);
    setB(initialB);
    setShowSteps(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowSteps(false);
    }
  };

  const generateRandom = () => {
    setA(Math.floor(Math.random() * 100) + 1);
    setB(Math.floor(Math.random() * 100) + 1);
  };

  const isValid = a > 0 && b > 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {description}
          </p>
        </div>
        
        {/* Chevron button - always on the right */}
        <button
          onClick={toggleExpanded}
          className="group flex items-center justify-center w-8 h-8 rounded-full ml-4 flex-shrink-0
                   bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                   hover:scale-110 transition-all duration-300"
        >
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : 'animate-[intermittent-float_16s_ease-in-out_infinite] group-hover:animate-none'
          }`} />
        </button>
      </div>

      {isExpanded && (
        <>

      {/* Input Controls */}
      <div className="mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Erste Zahl
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">a</span>
              </div>
              <input
                type="number"
                min="1"
                max="9999"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zweite Zahl
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">b</span>
              </div>
              <input
                type="number"
                min="1"
                max="9999"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Action Buttons - inline with inputs */}
          <div className="flex gap-2">
            <div className="relative group">
              <button
                onClick={generateRandom}
                className="flex items-center justify-center w-10 h-10 rounded-lg
                         bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400
                         hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <Dices className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
                            bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Zufallszahlen generieren
              </div>
            </div>
            
            <div className="relative group">
              <button
                onClick={reset}
                className="flex items-center justify-center w-10 h-10 rounded-lg
                         bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
                            bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Zurücksetzen
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Result */}
      {isValid && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              ggT({a}, {b})
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {gcd}
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="text-center text-red-600 dark:text-red-400">
            Bitte geben Sie positive Zahlen größer als 0 ein.
          </div>
        </div>
      )}

      {/* Step-by-step explanation */}
      {isValid && steps.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                     hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            {showSteps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Schritt-für-Schritt Berechnung anzeigen ({steps.length} Schritte)
          </button>

          {showSteps && (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm">
                <strong>Euklidischer Algorithmus:</strong> Wiederhole die Division mit Rest, 
                bis der Rest 0 ist. Der letzte nicht-null Rest ist der ggT.
              </div>
              
              {steps.map((step, index) => {
                const getHighlightColor = (value: number, _type: 'a' | 'b' | 'remainder') => {
                  if (hoveredStep === null) return '';
                  
                  const colors = {
                    blue: 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100',
                    green: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100', 
                    orange: 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100'
                  };
                  
                  const hoveredStepData = steps[hoveredStep];
                  
                  // Blue: All occurrences of hovered step's dividend
                  if (value === hoveredStepData.a) return colors.blue;
                  
                  // Green: All occurrences of hovered step's divisor
                  if (value === hoveredStepData.b) return colors.green;
                  
                  // Orange: All occurrences of hovered step's remainder  
                  if (value === hoveredStepData.remainder) return colors.orange;
                  
                  return '';
                };
                
                return (
                  <div key={step.step} 
                       className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 transition-colors"
                       onMouseEnter={() => setHoveredStep(index)}
                       onMouseLeave={() => setHoveredStep(null)}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 
                                    rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 
                                    text-sm font-semibold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="font-mono text-sm bg-white dark:bg-gray-800 
                                      border border-gray-200 dark:border-gray-700 rounded px-3 py-2 mb-2">
                          <span className={`px-1 rounded transition-colors ${getHighlightColor(step.a, 'a')}`}>
                            {step.a}
                          </span>
                          <span> / </span>
                          <span className={`px-1 rounded transition-colors ${getHighlightColor(step.b, 'b')}`}>
                            {step.b}
                          </span>
                          <span> = {step.quotient} + (Rest: </span>
                          <span className={`px-1 rounded transition-colors ${getHighlightColor(step.remainder, 'remainder')}`}>
                            {step.remainder}
                          </span>
                          <span>)</span>
                          <span className="opacity-40">/{step.b}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}


      {/* Component Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        ggT-Rechner • Euklidischer Algorithmus • Für Bruch-Rechnungen
      </div>
        </>
      )}
    </div>
  );
}