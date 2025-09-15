"use client";

import React, { useMemo, useState } from "react";
import katex from "katex";
import { Triangle, Plus, Minus, RotateCcw } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  initialLevel?: number; // n for (a+b)^n
  minLevel?: number;
  maxLevel?: number;
};

function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // Use multiplicative formula to avoid big factorials
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - (k - i))) / i;
  }
  return Math.round(res);
}

function pascalRow(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, k) => binomialCoefficient(n, k));
}

// formatTerm (nur Terme ohne konkrete Zahlen) wurde entfernt, da aktuell ungenutzt

function formatTermWithValues(coeff: number, aPow: number, bPow: number, a: number, b: number): string {
  const parts: string[] = [];
  parts.push(String(coeff));
  if (aPow > 0) parts.push(`${a}${aPow > 1 ? `^${aPow}` : ""}`);
  if (bPow > 0) parts.push(`${b}${bPow > 1 ? `^${bPow}` : ""}`);
  return parts.join("·");
}

export default function PascalsTriangle({
  title = "Pascal’sches Dreieck & Binomische Formel",
  description = "Erkunde (a + b)^n mit dem Pascal’schen Dreieck. Wähle n, sieh die Terme und setze Werte für a und b ein.",
  initialLevel = 5,
  minLevel = 0,
  maxLevel = 12,
}: Props) {
  const [level, setLevel] = useState<number>(Math.min(Math.max(initialLevel, minLevel), maxLevel));
  const [aInput, setAInput] = useState<string>("");
  const [bInput, setBInput] = useState<string>("");

  const coeffs = useMemo(() => pascalRow(level), [level]);

  // (Kein direkter Bedarf an der reinen Variablen-Expansion aktuell)

  // Compact pastel palette; dark mode uses softer tints for readability
  const colorPalette = useMemo(
    () => (
      [
        { katex: 'blue',   classes: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-400/20 dark:text-blue-50 dark:border-blue-400/30' },
        { katex: 'green',  classes: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-400/20 dark:text-green-50 dark:border-green-400/30' },
        { katex: 'orange', classes: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-400/20 dark:text-orange-50 dark:border-orange-400/30' },
        { katex: 'purple', classes: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-400/20 dark:text-purple-50 dark:border-purple-400/30' },
        { katex: 'cyan',   classes: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-400/20 dark:text-cyan-50 dark:border-cyan-400/30' },
      ]
    ),
    []
  );

  // Map each unique coefficient in the current row to a palette color (same numbers share color)
  const valueColorIndex = useMemo(() => {
    const map = new Map<number, number>();
    let next = 0;
    coeffs.forEach((c) => {
      if (!map.has(c)) {
        map.set(c, next % colorPalette.length);
        next++;
      }
    });
    return map;
  }, [coeffs, colorPalette]);

  // Build term descriptors for mixed inline rendering (colored square + KaTeX part)
  const termDescriptors = useMemo(() => {
    return coeffs.map((c, k) => {
      const aPow = level - k;
      const bPow = k;
      const paletteIndex = valueColorIndex.get(c) ?? 0;
      return { c, aPow, bPow, paletteIndex };
    });
  }, [coeffs, level, valueColorIndex]);

  const numbersProvided = aInput.trim() !== "" && bInput.trim() !== "" && !isNaN(Number(aInput)) && !isNaN(Number(bInput));

  const numericExpansion = useMemo(() => {
    if (!numbersProvided) return null;
    const aNum = Number(aInput);
    const bNum = Number(bInput);
    const terms = coeffs.map((c, k) => {
      const aPow = level - k;
      const bPow = k;
      const termVal = c * Math.pow(aNum, aPow) * Math.pow(bNum, bPow);
      return {
        display: formatTermWithValues(c, aPow, bPow, aNum, bNum),
        value: termVal,
      };
    });
    const sum = terms.reduce((acc, t) => acc + t.value, 0);
    return {
      display: terms.map((t) => t.display).join(" + "),
      sum,
    };
  }, [numbersProvided, coeffs, level, aInput, bInput]);

  const inc = () => setLevel((n) => Math.min(n + 1, maxLevel));
  const dec = () => setLevel((n) => Math.max(n - 1, minLevel));
  const clearInputs = () => {
    setAInput("");
    setBInput("");
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Triangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      {/* Inputs for a and b with Clear */}
      <div className="mb-6 flex items-end gap-3">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">a</span>
            </div>
            <input
              type="number"
              value={aInput}
              onChange={(e) => setAInput(e.target.value)}
              className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="z. B. 2"
              aria-label="a"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">b</span>
            </div>
            <input
              type="number"
              value={bInput}
              onChange={(e) => setBInput(e.target.value)}
              className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="z. B. 3"
              aria-label="b"
            />
          </div>
        </div>
        <button
          onClick={clearInputs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Eingaben löschen"
        >
          <RotateCcw className="w-4 h-4" />
          Leeren
        </button>
      </div>

      {/* Formula display */}
      <div className="space-y-3 mb-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">Allgemein</div>
          <div className="flex flex-wrap items-center gap-2 text-amber-900 dark:text-amber-100">
            <span
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(`(a + b)^{${level}} =`, { throwOnError: false, displayMode: false }),
              }}
            />
            {termDescriptors.map((t, i) => {
              const palette = colorPalette[t.paletteIndex % colorPalette.length];
              const rhs = [
                t.aPow > 0 ? (t.aPow > 1 ? `a^{${t.aPow}}` : 'a') : '',
                t.aPow > 0 && t.bPow > 0 ? '\\,\\cdot\\,' : '',
                t.bPow > 0 ? (t.bPow > 1 ? `b^{${t.bPow}}` : 'b') : '',
              ].join('');
              return (
                <React.Fragment key={i}>
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md border font-semibold text-xs ${palette.classes}`}
                      title={`Koeffizient: ${t.c}`}
                    >
                      {t.c}
                    </span>
                    {rhs && (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString(rhs, { throwOnError: false }),
                        }}
                      />
                    )}
                  </span>
                  {i < termDescriptors.length - 1 && (
                    <span
                      dangerouslySetInnerHTML={{ __html: katex.renderToString('+', { throwOnError: false }) }}
                      className="opacity-80"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {numbersProvided && numericExpansion && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Mit Werten</div>
            <div className="font-mono text-sm text-blue-900 dark:text-blue-100 break-words">
              ( {aInput} + {bInput} )^{level} = {numericExpansion.display}
            </div>
            <div className="mt-2 text-blue-900 dark:text-blue-100 font-semibold">Ergebnis: {numericExpansion.sum}</div>
          </div>
        )}
      </div>

      {/* Controls for level */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={dec}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            aria-label="Weniger Stufen"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
            Stufe n = <span className="font-semibold">{level}</span>
          </div>
          <button
            onClick={inc}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
            aria-label="Mehr Stufen"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Passe n an, um weitere Reihen zu sehen</div>
      </div>

      {/* Pascal's triangle */}
      <div className="space-y-2">
        {Array.from({ length: level + 1 }, (_, r) => (
          <div key={r} className="flex justify-center gap-2">
            {Array.from({ length: r + 1 }, (_, k) => {
              const value = binomialCoefficient(r, k);
              const isCurrentRow = r === level;
              const idx = valueColorIndex.get(value) ?? 0;
              const colorClasses = isCurrentRow
                ? colorPalette[idx % colorPalette.length].classes
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
              return (
                <div
                  key={k}
                  className={`min-w-8 text-center px-2 py-1 rounded-md border font-mono text-sm shadow-sm ${colorClasses}`}
                  title={`C(${r}, ${k}) = ${value}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
