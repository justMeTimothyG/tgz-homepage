"use client";

import React, { useMemo, useState } from 'react';
import { Calculator, ChevronDown, ChevronRight, RotateCcw, Plus, Minus } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Fraction utilities for exact arithmetic
class Fraction {
  n: number;
  d: number;
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('Division by zero');
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = Fraction.gcd(Math.trunc(n), Math.trunc(d));
    this.n = Math.trunc(n / g);
    this.d = Math.trunc(d / g);
  }
  static gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }
  static zero() { return new Fraction(0, 1); }
  static one() { return new Fraction(1, 1); }
  static fromNumber(x: number) {
    if (!Number.isFinite(x)) return new Fraction(0, 1);
    // convert decimal to fraction
    const s = String(x);
    if (!s.includes('.')) return new Fraction(x, 1);
    const parts = s.split('.');
    const scale = 10 ** parts[1].length;
    const num = Math.trunc(Number(parts[0]) * scale + Number(parts[1]));
    return new Fraction(num, scale);
  }
  static fromString(s: string) {
    const t = s.trim();
    if (t === '') return Fraction.zero();
    if (t.includes('/')) {
      const [a, b] = t.split('/').map((x) => Number(x.replace(',', '.')));
      if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) return new Fraction(a, b);
      return Fraction.zero();
    }
    const v = Number(t.replace(',', '.'));
    if (Number.isFinite(v)) return Fraction.fromNumber(v);
    return Fraction.zero();
  }
  isZero() { return this.n === 0; }
  equals(other: Fraction) { return this.n === other.n && this.d === other.d; }
  absCmp(other: Fraction) { return Math.abs(this.n * other.d) - Math.abs(other.n * this.d); }
  add(o: Fraction) { return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: Fraction) { return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Fraction) { return new Fraction(this.n * o.n, this.d * o.d); }
  div(o: Fraction) { return new Fraction(this.n * o.d, this.d * o.n); }
  neg() { return new Fraction(-this.n, this.d); }
  inv() { return new Fraction(this.d, this.n); }
  toLatex(): string {
    if (this.d === 1) return String(this.n);
    if (this.n === 0) return '0';
    return `\\frac{${this.n}}{${this.d}}`;
  }
  toString(): string {
    if (this.d === 1) return String(this.n);
    if (this.n === 0) return '0';
    return `${this.n}/${this.d}`;
  }
}

type Matrix = Fraction[][]; // m x n (last col is result/augmented)

type RowOp =
  | { kind: 'swap'; i: number; j: number; description: string }
  | { kind: 'scale'; i: number; factor: Fraction; description: string }
  | { kind: 'add'; target: number; source: number; factor: Fraction; description: string };

interface Step {
  step: number;
  op: RowOp;
  matrix: Matrix; // snapshot after operation
  pivot?: { row: number; col: number };
  phase: 'forward' | 'backward';
}

interface GaussianResult {
  steps: Step[];
  rref: Matrix;
  solutionType: 'unique' | 'infinite' | 'none';
  solution?: Fraction[];
  pivotColumns: number[];
}

interface GaussianEliminationProps {
  title?: string;
  description?: string;
  defaultExpanded?: boolean;
  initialRows?: number;
  initialCols?: number; // includes augmented/result column
  initialMatrix?: number[][]; // accepts numeric seed; editor stores strings
  parameterDomain?: 'R' | 'N' | 'Z'; // domain for free parameters in infinite solutions
}

function cloneMatrix(A: Matrix): Matrix {
  return A.map((row) => row.map((x) => new Fraction(x.n, x.d)));
}

function gaussianElimination(Ain: Matrix): GaussianResult {
  const A = cloneMatrix(Ain);
  const m = A.length;
  const n = A[0]?.length ?? 0;
  const steps: Step[] = [];
  const pivotCols: number[] = [];
  let row = 0;
  let stepNum = 1;

  // Phase 1: Vorwärtselfimination (Nullen unter der Hauptdiagonale)
  for (let col = 0; col < n - 1 && row < m; col++) {
    // find first nonzero pivot from current row down
    let pivot = -1;
    for (let r = row; r < m; r++) if (!A[r][col].isZero()) { pivot = r; break; }
    if (pivot === -1) continue;

    if (pivot !== row) {
      [A[pivot], A[row]] = [A[row], A[pivot]];
      steps.push({
        step: stepNum++,
        op: { kind: 'swap', i: row, j: pivot, description: `Z${row + 1} ↔ Z${pivot + 1}` },
        matrix: cloneMatrix(A),
        pivot: { row, col },
        phase: 'forward',
      });
    }

    // Normalize pivot to 1
    const pivotVal = A[row][col];
    if (!(pivotVal.d === 1 && pivotVal.n === 1)) {
      const factor = pivotVal.inv();
      for (let c = col; c < n; c++) A[row][c] = A[row][c].mul(factor);
      steps.push({
        step: stepNum++,
        op: { kind: 'scale', i: row, factor, description: `Z${row + 1} · ${factor.toString()}` },
        matrix: cloneMatrix(A),
        pivot: { row, col },
        phase: 'forward',
      });
    }

    // Eliminate below only
    for (let r = row + 1; r < m; r++) {
      const factor = A[r][col];
      if (!factor.isZero()) {
        for (let c = col; c < n; c++) A[r][c] = A[r][c].sub(factor.mul(A[row][c]));
        steps.push({
          step: stepNum++,
          op: { kind: 'add', target: r, source: row, factor: factor.neg(), description: `Z${r + 1} + (${factor.neg().toString()}) · Z${row + 1}` },
          matrix: cloneMatrix(A),
          pivot: { row, col },
          phase: 'forward',
        });
      }
    }

    pivotCols.push(col);
    row++;
  }

  // Phase 2: Rückwärtselfimination (Nullen über der Hauptdiagonale)
  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const col = pivotCols[i];
    const prow = i; // after forward phase, pivot row aligns with index
    // ensure pivot is 1 (safety)
    const pv = A[prow][col];
    if (!(pv.n === 1 && pv.d === 1) && !pv.isZero()) {
      const factor = pv.inv();
      for (let c = col; c < n; c++) A[prow][c] = A[prow][c].mul(factor);
      steps.push({
        step: stepNum++,
        op: { kind: 'scale', i: prow, factor, description: `Z${prow + 1} · ${factor.toString()}` },
        matrix: cloneMatrix(A),
        pivot: { row: prow, col },
        phase: 'backward',
      });
    }
    // eliminate above
    for (let r = 0; r < prow; r++) {
      const factor = A[r][col];
      if (!factor.isZero()) {
        for (let c = col; c < n; c++) A[r][c] = A[r][c].sub(factor.mul(A[prow][c]));
        steps.push({
          step: stepNum++,
          op: { kind: 'add', target: r, source: prow, factor: factor.neg(), description: `Z${r + 1} + (${factor.neg().toString()}) · Z${prow + 1}` },
          matrix: cloneMatrix(A),
          pivot: { row: prow, col },
          phase: 'backward',
        });
      }
    }
  }

  const rref = A;
  // inconsistency: 0 ... 0 | b, b != 0
  for (let r = 0; r < m; r++) {
    let allZero = true;
    for (let c = 0; c < n - 1; c++) if (!rref[r][c].isZero()) { allZero = false; break; }
    if (allZero && !rref[r][n - 1].isZero()) {
      return { steps, rref, solutionType: 'none', pivotColumns: pivotCols };
    }
  }

  if (pivotCols.length === n - 1) {
    const sol: Fraction[] = new Array(n - 1).fill(0).map(() => Fraction.zero());
    for (let r = 0; r < m; r++) {
      const pc = rref[r].findIndex((v, i) => i < n - 1 && v.n === 1 && v.d === 1);
      if (pc >= 0) sol[pc] = rref[r][n - 1];
    }
    return { steps, rref, solutionType: 'unique', solution: sol, pivotColumns: pivotCols };
  }

  return { steps, rref, solutionType: 'infinite', pivotColumns: pivotCols };
}

function MatrixView({ matrix, pivot, highlightRow }: { matrix: Matrix; pivot?: { row: number; col: number }; highlightRow?: number }) {
  const cols = matrix[0]?.length ?? 0;
  const varCount = Math.max(0, cols - 1);
  return (
    <div className="inline-block">
      <table className="border-separate" style={{ borderSpacing: '0.25rem 0.15rem' }}>
        <thead>
          <tr>
            <th className="pr-2 text-xs text-gray-400 dark:text-gray-500 font-normal" />
            {Array.from({ length: varCount }, (_, i) => (
              <th key={i} className={`text-xs font-medium text-gray-500 dark:text-gray-400 px-2 ${i === varCount - 1 ? 'border-r-2 border-gray-400 dark:border-gray-500' : ''}`}>x{i + 1}</th>
            ))}
            <th className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">b</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={r} className={highlightRow === r ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''}>
              <td className="pr-2 text-xs text-gray-400 dark:text-gray-500 select-none">Z{r + 1}</td>
              {row.map((val, c) => (
                <td key={c} className={`text-sm font-mono text-gray-900 dark:text-gray-100 px-2 py-0.5 ${c === varCount - 1 ? 'border-r-2 border-gray-400 dark:border-gray-500' : ''}`}>
                  <span className={`${pivot && pivot.row === r && pivot.col === c ? 'bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded' : ''}`}>{val.toString()}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GaussianElimination({
  title = 'Gaußsches Eliminationsverfahren (Zeilenumformungen)',
  description = 'Löse lineare Gleichungssysteme per Zeilenoperationen an der erweiterten Koeffizientenmatrix. Die letzte Spalte ist die rechte Seite.',
  defaultExpanded = false,
  initialRows = 3,
  initialCols = 4,
  initialMatrix,
  parameterDomain = 'R',
}: GaussianEliminationProps) {
  const initialStr = useMemo<string[][]>(() => {
    const rows = Math.max(1, initialRows);
    const cols = Math.max(2, initialCols);
    if (initialMatrix && initialMatrix.length > 0) {
      return initialMatrix.map((row) => row.map((v) => String(v)));
    }
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
  }, [initialMatrix, initialRows, initialCols]);

  // editor holds strings to allow empty cells, fractions, etc.
  const [matrixStr, setMatrixStr] = useState<string[][]>(initialStr);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showSteps, setShowSteps] = useState(false);
  // no hover state needed for simplified highlighting
  const [result, setResult] = useState<GaussianResult | null>(null);
  

  const rows = matrixStr.length;
  const cols = matrixStr[0]?.length ?? 0;

  const updateCell = (r: number, c: number, value: string) => {
    setMatrixStr((prev) => {
      const copy = prev.map((row) => row.slice());
      copy[r][c] = value;
      return copy;
    });
  };

  const addRow = () => setMatrixStr((prev) => [...prev, Array.from({ length: cols }, () => '')]);
  const removeRow = () => setMatrixStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const addCol = () => setMatrixStr((prev) => prev.map((row) => [...row, '']));
  const removeCol = () => setMatrixStr((prev) => (prev[0].length > 2 ? prev.map((row) => row.slice(0, -1)) : prev));

  const reset = () => {
    setMatrixStr(initialStr);
    setResult(null);
    setShowSteps(false);
  };

  const calculate = () => {
    if (rows === 0 || cols < 2) return;
    const matFrac: Matrix = matrixStr.map((row) => row.map((s) => Fraction.fromString(s)));
    const res = gaussianElimination(matFrac);
    setResult(res);
    setShowSteps(true);
    setIsExpanded(true);
  };

  const renderSolution = () => {
    if (!result) return null;
    const { solutionType, solution, rref, pivotColumns } = result;
    if (solutionType === 'none') {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-700 dark:text-red-300 font-medium">Keine Lösung</div>
          <div className="text-sm text-red-800/80 dark:text-red-200/80">Das System ist widersprüchlich (eine Zeile 0 … 0 | b mit b ≠ 0).</div>
        </div>
      );
    }
    if (solutionType === 'unique' && solution) {
      const latex = `\\begin{aligned} ${solution
        .map((f, i) => `x_{${i + 1}} &= ${f.toLatex()}`)
        .join(' \\\\ ')} \\end{aligned}`;
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-green-800 dark:text-green-200 font-medium mb-2">Eindeutige Lösung</div>
          <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { displayMode: true, throwOnError: false }) }} />
        </div>
      );
    }

    // Infinite solutions: show parametric form and an example
    const freeCols = Array.from({ length: cols - 1 }, (_, i) => i).filter((c) => !pivotColumns.includes(c));
    const varCount = cols - 1;
    // particular solution x0 (free vars = 0)
    const x0: Fraction[] = Array.from({ length: varCount }, () => Fraction.zero());
    for (let i = 0; i < pivotColumns.length; i++) {
      const pc = pivotColumns[i];
      x0[pc] = rref[i][varCount];
    }
    // basis vectors for each free variable
    const basis: Fraction[][] = freeCols.map((f) => {
      const v = Array.from({ length: varCount }, () => Fraction.zero());
      v[f] = Fraction.one();
      for (let i = 0; i < pivotColumns.length; i++) {
        const pc = pivotColumns[i];
        v[pc] = rref[i][f].neg(); // move to RHS: x_pivot = ... - (coeff)*t
      }
      return v;
    });
    // helper kept for consistency; currently not used for final display
    const _vecToLatex = (vec: Fraction[]) => `\\begin{pmatrix} ${vec.map((f) => f.toLatex()).join(' \\ ')} \\end{pmatrix}`;
    const domainSymbol = parameterDomain === 'N' ? '\\mathbb{N}' : parameterDomain === 'Z' ? '\\mathbb{Z}' : '\\mathbb{R}';
    // Build component-wise expression: x = x0 + sum_j lambda_j * v_j, written as one column vector
    const components: string[] = Array.from({ length: varCount }, (_, i) => {
      const parts: string[] = [];
      const xi = x0[i];
      const pushSigned = (latex: string, negative: boolean) => {
        if (parts.length === 0) parts.push(negative ? `- ${latex}` : latex);
        else parts.push(negative ? `- ${latex}` : `+ ${latex}`);
      };
      if (!xi.isZero()) {
        const neg = xi.n < 0;
        const abs = new Fraction(Math.abs(xi.n), xi.d).toLatex();
        pushSigned(abs, neg);
      }
      basis.forEach((v, j) => {
        const coeff = v[i];
        if (!coeff.isZero()) {
          const neg = coeff.n < 0;
          const abs = new Fraction(Math.abs(coeff.n), coeff.d).toLatex();
          pushSigned(`${abs} \\lambda_{${j + 1}}`, neg);
        }
      });
      return parts.length ? parts.join(' ') : '0';
    });
    const vectorExprLatex = `\\begin{pmatrix} ${components.join(' \\ ')} \\end{pmatrix}`;
    const lambdasDomain = basis.map((_, i) => `\\lambda_{${i + 1}} \\in ${domainSymbol}`).join(', ');
    const solutionSetLatex = `\\mathbb{L} = \\left\\{ ${vectorExprLatex} \\; \\Big|\\; ${lambdasDomain || ' '} \\right\\}`;
    // example: set first free parameter = 1 (others 0) if available
    let exampleLatex = '';
    if (basis.length > 0) {
      const freeIndex = freeCols[0];
      const v = basis[0];
      const ex = x0.map((xi, idx) => xi.add(v[idx]));
      const aligned = ex.map((f, i) => `x_{${i + 1}} &= ${f.toLatex()}`).join(' \\\\ ');
      exampleLatex = `Beispiel (x_{${freeIndex + 1}} = 1): \\; \\begin{aligned} ${aligned} \\end{aligned}`;
    }
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="text-yellow-900 dark:text-yellow-100 font-medium mb-2">Unendlich viele Lösungen</div>
        <div className="text-sm text-yellow-900/90 dark:text-yellow-100/80">Freie Variablen: {freeCols.map((c) => `x${c + 1}`).join(', ') || '—'}</div>
        <div className="mt-2 text-xs text-yellow-900/80 dark:text-yellow-100/70">Parametrische Darstellung und Beispiel unten.</div>
        <div className="mt-3"><MatrixView matrix={rref} /></div>
        <div className="mt-4 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: katex.renderToString(solutionSetLatex, { displayMode: true, throwOnError: false }) }} />
        {exampleLatex && (
          <div className="mt-2 prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: katex.renderToString(exampleLatex, { displayMode: false, throwOnError: false }) }} />
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {description}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded((v) => !v)}
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
          {/* Matrix editor - simple naked table */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={addRow}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                title="Zeile hinzufügen"
              >
                <Plus className="w-4 h-4" /> Zeile
              </button>
              <button
                onClick={removeRow}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Letzte Zeile entfernen"
              >
                <Minus className="w-4 h-4" /> Zeile
              </button>
              <span className="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600" />
              <button
                onClick={addCol}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                title="Spalte hinzufügen (inkl. Ergebnisspalte)"
              >
                <Plus className="w-4 h-4" /> Spalte
              </button>
              <button
                onClick={removeCol}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Letzte Spalte entfernen"
              >
                <Minus className="w-4 h-4" /> Spalte
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">Letzte Spalte = rechte Seite</div>
            </div>

            <div className="inline-block">
              <table className="border-separate" style={{ borderSpacing: '0.25rem 0.15rem' }}>
                <thead>
                  <tr>
                    <th className="pr-2 text-xs text-gray-400 dark:text-gray-500 font-normal" />
                    {Array.from({ length: Math.max(0, cols - 1) }, (_, i) => (
                      <th key={i} className={`text-xs font-medium text-gray-500 dark:text-gray-400 px-2 ${i === cols - 2 ? 'border-r-2 border-gray-400 dark:border-gray-500' : ''}`}>
                        x{i + 1}
                      </th>
                    ))}
                    <th className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">b</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixStr.map((rowArr, r) => (
                    <tr key={r}>
                      <td className="pr-2 text-xs text-gray-400 dark:text-gray-500 select-none">Z{r + 1}</td>
                      {rowArr.map((val, c) => (
                        <td key={c} className={`px-1 py-0.5 ${c === cols - 2 ? 'border-r-2 border-gray-400 dark:border-gray-500' : ''}`}>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={val}
                            onChange={(e) => updateCell(r, c, e.target.value)}
                            className="w-20 px-2 py-1 text-sm font-mono rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 border-0 outline-none"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={calculate}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              Berechnen
            </button>
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

          {/* Result summary */}
          {result && (
            <div className="space-y-4 mb-4">
              {renderSolution()}
            </div>
          )}

          {/* Steps (two-panel: left LaTeX + explanation, right matrix with labels) */}
          {result && result.steps.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                         hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
              >
                {showSteps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Schritt-für-Schritt Zeilenumformungen anzeigen ({result.steps.length})
              </button>

              {showSteps && (
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-sm">
                    <strong>Idee:</strong> In jeder Pivotspalte den Wert 1 erzeugen und die übrigen Einträge zu 0 machen. Erlaubte Operationen: Zeilen tauschen, skalieren, Vielfaches addieren. Brüche werden exakt dargestellt.
                  </div>
                  {(() => {
                    const isUpperTriOnes = (A: Matrix) => {
                      const m = A.length;
                      const n = A[0]?.length ?? 0;
                      const k = Math.min(m, Math.max(0, n - 1));
                      for (let i = 0; i < k; i++) {
                        if (!(A[i][i].n === 1 && A[i][i].d === 1)) return false;
                        for (let r = i + 1; r < m; r++) if (!(A[r][i].n === 0)) return false;
                      }
                      return true;
                    };
                    const opToLatex = (op: RowOp) => {
                      if (op.kind === 'swap') return `Z_{${op.i + 1}} \\leftrightarrow Z_{${op.j + 1}}`;
                      if (op.kind === 'scale') return `Z_{${op.i + 1}} = ${op.factor.toLatex()} \\cdot Z_{${op.i + 1}}`;
                      return `Z_{${op.target + 1}} = Z_{${op.target + 1}} + (${op.factor.toLatex()}) \\cdot Z_{${op.source + 1}}`;
                    };
                    const opExplanation = (op: RowOp, pivot?: { row: number; col: number }) => {
                      if (op.kind === 'swap') return `Zeilen tauschen, um ein besseres Pivot in Spalte ${pivot ? pivot.col + 1 : ''} nach oben zu holen.`;
                      if (op.kind === 'scale') return `Pivotzeile skalieren, damit das Pivot 1 wird.`;
                      return `Eintrag in Spalte ${pivot ? pivot.col + 1 : ''} eliminieren, indem ein Vielfaches der Pivotzeile addiert wird.`;
                    };
                    const changedRows = (op: RowOp) => {
                      if (op.kind === 'swap') return [op.i, op.j];
                      if (op.kind === 'scale') return [op.i];
                      return [op.target];
                    };
                    const upperTriIndex = result.steps.findIndex((s) => isUpperTriOnes(s.matrix));
                    return (
                      <div className="flex flex-col gap-3">
                        {result.steps.map((s, idx) => {
                          const isMilestone = idx === upperTriIndex && upperTriIndex !== -1;
                          const rowsToHi = changedRows(s.op);
                          const panelCls = isMilestone
                            ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
                          return (
                            <div key={s.step} className={`grid grid-cols-1 md:grid-cols-2 gap-4 rounded border p-3 ${panelCls}`}>
                              <div>
                                {isMilestone && (
                                  <div className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">Obere Dreiecksmatrix</div>
                                )}
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Schritt {s.step}</div>
                                <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: katex.renderToString(opToLatex(s.op), { displayMode: false, throwOnError: false }) }} />
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{opExplanation(s.op, s.pivot)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Operation: {s.op.description}</div>
                                <MatrixView
                                  matrix={s.matrix}
                                  pivot={s.pivot}
                                  highlightRow={rowsToHi.length === 1 ? rowsToHi[0] : undefined}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="text-xs text-gray-600 dark:text-gray-400">Hinweis: Gelb markiert = Pivot-Element. Die linke Spalte zeigt Zeilenbezeichner Z1, Z2, …</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Gaußsches Eliminationsverfahren • RREF • Ergebnis Spalte ist rechte Seite
          </div>
        </>
      )}
    </div>
  );
}
