"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calculator, RotateCcw } from 'lucide-react';

interface GcdStep {
  step: number;
  a: number;
  b: number;
  remainder: number;
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
        calculation: `${currentA} = ${quotient} × ${currentB} + ${remainder}`,
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

  const setExample = (exampleA: number, exampleB: number) => {
    setA(exampleA);
    setB(exampleB);
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
          {/* Examples - now shown only when expanded */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Beispiele:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setExample(48, 18)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                48, 18
              </button>
              <button
                onClick={() => setExample(60, 24)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                60, 24
              </button>
              <button
                onClick={() => setExample(84, 36)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                84, 36
              </button>
              <button
                onClick={() => setExample(17, 19)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                17, 19 (Primzahlen)
              </button>
            </div>
          </div>
      {/* Moved all content inside expanded section */}

      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Erste Zahl (a)
          </label>
          <input
            type="number"
            min="1"
            max="9999"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zweite Zahl (b)
          </label>
          <input
            type="number"
            min="1"
            max="9999"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
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
              
              {steps.map((step) => (
                <div key={step.step} 
                     className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 
                                  rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 
                                  text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="font-mono text-sm bg-white dark:bg-gray-800 
                                    border border-gray-200 dark:border-gray-700 rounded px-3 py-2 mb-2">
                        {step.calculation}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 
                   text-gray-700 dark:text-gray-300 rounded-lg 
                   hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Zurücksetzen
        </button>
      </div>

      {/* Component Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        ggT-Rechner • Euklidischer Algorithmus • Für Bruch-Rechnungen
      </div>
        </>
      )}
    </div>
  );
}