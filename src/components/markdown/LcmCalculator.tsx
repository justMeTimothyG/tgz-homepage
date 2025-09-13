"use client";

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calculator, RotateCcw, Dices } from 'lucide-react';

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

interface GcdStep {
  step: number;
  a: number;
  b: number;
  remainder: number;
  quotient: number;
}

function calculateGcd(a: number, b: number): { gcd: number; steps: GcdStep[] } {
  const steps: GcdStep[] = [];
  let currentA = Math.abs(a);
  let currentB = Math.abs(b);
  let stepNumber = 1;
  
  if (currentA < currentB) {
    [currentA, currentB] = [currentB, currentA];
  }

  while (currentB !== 0) {
    const remainder = currentA % currentB;
    const quotient = Math.floor(currentA / currentB);
    steps.push({ step: stepNumber++, a: currentA, b: currentB, remainder, quotient });
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
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const { lcm, gcd, steps, gcdSteps } = useMemo(() => {
    if (a <= 0 || b <= 0) {
      return { lcm: 0, gcd: 0, steps: [], gcdSteps: [] };
    }

    const { gcd: calculatedGcd, steps: gcdCalculationSteps } = calculateGcd(a, b);
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
      // Step 3 is rendered with fraction layout below
    ];

    return { lcm: calculatedLcm, gcd: calculatedGcd, steps: lcmSteps, gcdSteps: gcdCalculationSteps };
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
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
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


      {/* Results */}
      {isValid && (
        <div className="space-y-4 mb-6">
          {/* Control and End Result inline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Kontrolle
                </div>
                <div className="text-lg font-semibold text-purple-900 dark:text-purple-100 font-mono flex items-center justify-center">
                  <span className="inline-flex flex-col text-center">
                    <span className="border-b border-purple-600 dark:border-purple-400 pb-1">a ⋅ b</span>
                    <span className="pt-1">ggT</span>
                  </span>
                  <span className="mx-2">=</span>
                  <span className="inline-flex flex-col text-center">
                    <span className="border-b border-purple-600 dark:border-purple-400 pb-1">{a} ⋅ {b}</span>
                    <span className="pt-1">{gcd}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                  kgV({a}, {b})
                </div>
                <div className="text-2xl font-semibold text-green-900 dark:text-green-100 flex items-center">
                  <span className="text-green-600 dark:text-green-400 opacity-60 mr-2">=</span>
                  <span>{lcm}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ggT and gemeinsame Vielfache inline with 1/4 and 3/4 width */}
          <div className="flex gap-4">
            {/* Benötigter ggT - 1/4 width */}
            <div className="w-1/4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                  Benötigter ggT
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {gcd}
                </div>
              </div>
            </div>

            {/* Erste gemeinsame Vielfache - 3/4 width */}
            {commonMultiples.length > 0 && (
              <div className="w-3/4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 flex items-center">
                <div className="w-full">
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
              </div>
            )}
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
              
              {steps.map((step, stepIndex) => (
                <div key={step.step} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-semibold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{step.description}</h4>
                      {/* Step 1: render GCD steps with hover highlighting */}
                      {stepIndex === 0 && (
                        <div className="space-y-2 mb-2">
                          {gcdSteps.map((gcdStep, gcdIndex) => {
                            const getHighlightColor = (value: number) => {
                              if (hoveredStep === null) return '';
                              const colors = {
                                blue: 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100',
                                green: 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100',
                                orange: 'bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100',
                              } as const;
                              const hovered = gcdSteps[hoveredStep];
                              if (value === hovered.a) return colors.blue;
                              if (value === hovered.b) return colors.green;
                              if (value === hovered.remainder) return colors.orange;
                              return '';
                            };

                            return (
                              <div key={gcdIndex} 
                                   className="font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2"
                                   onMouseEnter={() => setHoveredStep(gcdIndex)}
                                   onMouseLeave={() => setHoveredStep(null)}>
                                <span className={`px-1 rounded transition-colors ${getHighlightColor(gcdStep.a)}`}>{gcdStep.a}</span>
                                <span> / </span>
                                <span className={`px-1 rounded transition-colors ${getHighlightColor(gcdStep.b)}`}>{gcdStep.b}</span>
                                <span> = {gcdStep.quotient} + (Rest: </span>
                                <span className={`px-1 rounded transition-colors ${getHighlightColor(gcdStep.remainder)}`}>{gcdStep.remainder}</span>
                                <span>)</span>
                                <span className="opacity-40">/{gcdStep.b}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Step 2: LaTeX-style fraction layout */}
                      {stepIndex === 1 ? (
                        <div className="font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 mb-2">
                          <div className="flex items-center justify-center">
                            <span>kgV({a}, {b}) = </span>
                            <span className="inline-flex flex-col text-center mx-2">
                              <span className="border-b border-gray-400 dark:border-gray-500 pb-1">{a} ⋅ {b}</span>
                              <span className="pt-1">{gcd}</span>
                            </span>
                            <span> = </span>
                            <span className="inline-flex flex-col text-center mx-2">
                              <span className="border-b border-gray-400 dark:border-gray-500 pb-1">{a * b}</span>
                              <span className="pt-1">{gcd}</span>
                            </span>
                            <span> = {lcm}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 mb-2">
                          {step.calculation.replace(/×/g, '⋅')}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.explanation}</p>
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
