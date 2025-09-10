"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calculator, RotateCcw } from 'lucide-react';

interface LcmStep {
  step: number;
  description: string;
  calculation: string;
  explanation: string;
}

interface LcmCalculatorProps {
  title?: string;
  description?: string;
  initialA?: number;
  initialB?: number;
}

function calculateGcd(a: number, b: number): { gcd: number; steps: string[] } {
  const steps: string[] = [];
  let currentA = Math.abs(a);
  let currentB = Math.abs(b);
  
  if (currentA < currentB) {
    [currentA, currentB] = [currentB, currentA];
  }

  while (currentB !== 0) {
    const remainder = currentA % currentB;
    const quotient = Math.floor(currentA / currentB);
    
    steps.push(`${currentA} = ${quotient} × ${currentB} + ${remainder}`);
    
    currentA = currentB;
    currentB = remainder;
  }

  return { gcd: currentA, steps };
}

export default function LcmCalculator({
  title = "kgV-Rechner (Kleinstes gemeinsames Vielfaches)",
  description = "Berechnet das kgV zweier Zahlen mit der Formel: kgV(a,b) = (a × b) / ggT(a,b)",
  initialA = 12,
  initialB = 8
}: LcmCalculatorProps) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [showSteps, setShowSteps] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { lcm, gcd, steps } = useMemo(() => {
    if (a <= 0 || b <= 0) {
      return { lcm: 0, gcd: 0, steps: [] };
    }

    const { gcd: calculatedGcd } = calculateGcd(a, b);
    const calculatedLcm = Math.abs(a * b) / calculatedGcd;

    const lcmSteps: LcmStep[] = [
      {
        step: 1,
        description: "Schritt 1: ggT berechnen",
        calculation: `ggT(${a}, ${b}) = ${calculatedGcd}`,
        explanation: `Zuerst berechnen wir den größten gemeinsamen Teiler mit dem euklidischen Algorithmus.`
      },
      {
        step: 2,
        description: "Schritt 2: kgV-Formel anwenden",
        calculation: `kgV(${a}, ${b}) = (${a} × ${b}) / ggT(${a}, ${b})`,
        explanation: `Das kgV wird mit der Formel: kgV(a,b) = (a × b) / ggT(a,b) berechnet.`
      },
      {
        step: 3,
        description: "Schritt 3: Einsetzen und berechnen",
        calculation: `kgV(${a}, ${b}) = ${a * b} / ${calculatedGcd} = ${calculatedLcm}`,
        explanation: `Wir setzen die Werte ein und erhalten das kleinste gemeinsame Vielfache.`
      }
    ];

    return { 
      lcm: calculatedLcm, 
      gcd: calculatedGcd, 
      steps: lcmSteps
    };
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

  // Find common multiples for visualization
  const commonMultiples = useMemo(() => {
    if (!isValid || lcm === 0) return [];
    
    const limit = Math.min(lcm * 5, 1000); // Show up to 5 times LCM or max 1000
    const commons = [];
    
    for (let i = lcm; i <= limit; i += lcm) {
      commons.push(i);
    }
    
    return commons.slice(0, 5); // Show first 5 common multiples
  }, [lcm, isValid]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                onClick={() => setExample(12, 8)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                12, 8
              </button>
              <button
                onClick={() => setExample(15, 25)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                15, 25
              </button>
              <button
                onClick={() => setExample(6, 9)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                6, 9
              </button>
              <button
                onClick={() => setExample(7, 11)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                7, 11 (Primzahlen)
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
                     focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                     focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>


      {/* Results */}
      {isValid && (
        <div className="space-y-4 mb-6">
          {/* Main Result */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                kgV({a}, {b})
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {lcm}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Benötigter ggT
                </div>
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {gcd}
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Kontrolle: a × b / ggT
                </div>
                <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  {a * b} / {gcd} = {lcm}
                </div>
              </div>
            </div>
          </div>

          {/* Common Multiples Preview */}
          {commonMultiples.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Erste gemeinsame Vielfache:
              </div>
              <div className="flex flex-wrap gap-2">
                {commonMultiples.map((multiple, index) => (
                  <span key={index} 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          index === 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                    {multiple}
                  </span>
                ))}
              </div>
            </div>
          )}
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
            Schritt-für-Schritt Berechnung anzeigen
          </button>

          {showSteps && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm">
                <strong>kgV-Formel:</strong> Das kleinste gemeinsame Vielfache wird mit der Formel 
                kgV(a,b) = (a × b) / ggT(a,b) berechnet.
              </div>
              
              {steps.map((step) => (
                <div key={step.step} 
                     className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 
                                  rounded-full flex items-center justify-center text-green-600 dark:text-green-400 
                                  text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {step.description}
                      </h4>
                      <div className="font-mono text-sm bg-white dark:bg-gray-800 
                                    border border-gray-200 dark:border-gray-700 rounded px-3 py-2 mb-2">
                        {step.calculation}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show GCD calculation steps if available */}
              {(() => {
                const gcdCalculation = calculateGcd(a, b);
                return gcdCalculation.steps.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                      ggT({a}, {b}) Berechnung (Euklidischer Algorithmus):
                    </h4>
                    <div className="space-y-2">
                      {gcdCalculation.steps.map((step, index) => (
                        <div key={index} className="font-mono text-sm bg-white dark:bg-gray-800 
                                                  border border-blue-200 dark:border-blue-700 rounded px-3 py-1">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
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
        kgV-Rechner • Formel: kgV(a,b) = (a × b) / ggT(a,b) • Für Bruch-Rechnungen
      </div>
        </>
      )}
    </div>
  );
}