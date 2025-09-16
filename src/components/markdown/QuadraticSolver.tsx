"use client";

import React, { useMemo, useState } from "react";
import { Calculator, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Mode = "pq" | "abc";

type Props = {
  title?: string;
  description?: string;
  defaultExpanded?: boolean;
  initialMode?: Mode;
  initialPQ?: { p: number; q: number };
  initialABC?: { a: number; b: number; c: number };
};

type Step = {
  step: number;
  title: string;
  latex?: string;
  explanation?: string;
};

// Minimal fraction utility (exact rational arithmetic)
class Frac {
  n: number; // numerator (signed)
  d: number; // denominator (> 0)
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error("Division by zero");
    if (d < 0) { n = -n; d = -d; }
    const g = Frac.gcd(Math.trunc(n), Math.trunc(d));
    this.n = Math.trunc(n / g);
    this.d = Math.trunc(d / g);
  }
  static gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }
  static of(x: number) { return new Frac(x, 1); }
  static fromNumber(x: number) {
    if (!Number.isFinite(x)) return new Frac(0, 1);
    const s = String(x);
    if (s.includes("e") || s.includes("E")) {
      // Fallback: expand exponent to fixed up to 12 places
      const asFixed = x.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
      return Frac.fromString(asFixed);
    }
    return Frac.fromString(s);
  }
  static fromString(s: string) {
    const t = s.trim();
    if (t === "") return new Frac(0, 1);
    if (t.includes("/")) {
      const [a, b] = t.split("/").map((x) => Number(x));
      if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) return new Frac(a, b);
      return new Frac(0, 1);
    }
    if (t.includes(".")) {
      const [I, F] = t.split(".");
      const scale = 10 ** F.length;
      const num = Math.trunc(Number(I)) * scale + Math.trunc(Number(F));
      return new Frac(num, scale);
    }
    return new Frac(Number(t), 1);
  }
  add(o: Frac) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: Frac) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: Frac | number) {
    if (typeof o === "number") return new Frac(this.n * o, this.d);
    return new Frac(this.n * o.n, this.d * o.d);
  }
  div(o: Frac | number) {
    if (typeof o === "number") return new Frac(this.n, this.d * o);
    return new Frac(this.n * o.d, this.d * o.n);
  }
  sqr() { return new Frac(this.n * this.n, this.d * this.d); }
  isZero() { return this.n === 0; }
  isNegative() { return this.n < 0; }
  toLatex(): string {
    if (this.d === 1) return String(this.n);
    return `\\frac{${this.n}}{${this.d}}`;
  }
  abs(): Frac { return new Frac(Math.abs(this.n), this.d); }
}
function sqrtInt(n: number): number | null { if (n < 0) return null; const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; }
function latexParen(s: string) { return s.startsWith("-") || s.includes(" ") || s.includes("\\frac") ? `\\left(${s}\\right)` : s; }
function latexAbs(f: Frac): string { return f.abs().toLatex(); }
function fmt4(x: number): string { const s = x.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''); return s; }

// (removed unused helpers fmtSigned, fmtCoeff, perfectSquare)

export default function QuadraticSolver({
  title = "Quadratische Gleichungslöser (pq / abc)",
  description = "Löst x^2 + px + q = 0 oder ax^2 + bx + c = 0 mit Schritt-für-Schritt-Lösung.",
  defaultExpanded = false,
  initialMode = "pq",
  initialPQ = { p: 3, q: -4 },
  initialABC = { a: 1, b: 3, c: -4 },
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showSteps, setShowSteps] = useState(false);
  const [showComplex, setShowComplex] = useState(false);

  // Inputs (numbers, live-calculated)
  const [p, setP] = useState<number>(initialPQ.p);
  const [q, setQ] = useState<number>(initialPQ.q);
  const [a, setA] = useState<number>(initialABC.a);
  const [b, setB] = useState<number>(initialABC.b);
  const [c, setC] = useState<number>(initialABC.c);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) setShowSteps(false);
  };

  const reset = () => {
    setP(initialPQ.p);
    setQ(initialPQ.q);
    setA(initialABC.a);
    setB(initialABC.b);
    setC(initialABC.c);
    setShowSteps(false);
  };

  const pqArtifacts = useMemo(() => {
    // Use fraction arithmetic to avoid decimals
    const P = Frac.fromNumber(p);
    const Q = Frac.fromNumber(q);
    const pOver2 = P.div(2);
    const p2Over4 = P.sqr().div(4);
    const fourQ = Q.mul(4);
    const numerator = P.sqr().sub(fourQ); // p^2 - 4q
    const Dfrac = numerator.div(4); // (p^2 - 4q) / 4
    const denSqrt = sqrtInt(Dfrac.d);
    const sqrtNumeratorLatex = `\\sqrt{${numerator.toLatex()}}`;
    const sqrtDenLatex = denSqrt ? String(denSqrt) : `\\sqrt{${Dfrac.d}}`;
    const sqrtD_latex = `\\frac{${sqrtNumeratorLatex}}{${sqrtDenLatex}}`;

    // sign handling for -(-q) => + q symbolically
    const pmSign = Q.n < 0 ? '+' : '-';
    const absQ = Q.n < 0 ? new Frac(-Q.n, Q.d) : Q;

    // Try integer sqrt on numerator for exact rational roots
    const sqrtNumInt = numerator.n >= 0 && numerator.d === 1 ? sqrtInt(Math.abs(numerator.n)) : null;
    const xRational = sqrtNumInt !== null
      ? {
          x1: Frac.of(-1).mul(P).div(2).add(Frac.of(sqrtNumInt).div(2)),
          x2: Frac.of(-1).mul(P).div(2).sub(Frac.of(sqrtNumInt).div(2)),
        }
      : null;

    // Steps
    const steps: Step[] = [
      { step: 1, title: "Einsetzen in pq-Formel", latex: `x_{1,2}= -\\frac{${P.toLatex()}}{2} \\pm \\sqrt{\\left(\\frac{${P.toLatex()}}{2}\\right)^2 - (${Q.toLatex()})}` },
      { step: 2, title: "Quadrat in der Wurzel berechnen", latex: `x_{1,2}= -\\frac{${P.toLatex()}}{2} \\pm \\sqrt{\\frac{${P.sqr().toLatex()}}{4} - (${Q.toLatex()})}` },
      { step: 3, title: "Nenner angleichen", latex: `= -\\frac{${P.toLatex()}}{2} \\pm \\sqrt{\\frac{${P.sqr().toLatex()}}{4} ${pmSign} \\frac{4\\cdot(${absQ.toLatex()})}{4}}` },
      { step: 4, title: "Brüche zusammenfassen", latex: `= -\\frac{${P.toLatex()}}{2} \\pm \\sqrt{\\frac{${numerator.toLatex()}}{4}}` },
      { step: 5, title: "Wurzel auflösen", latex: `= -\\frac{${P.toLatex()}}{2} \\pm \\frac{${(numerator.n >= 0 && sqrtNumInt) ? String(sqrtNumInt) : `\\sqrt{${numerator.toLatex()}}`}}{2}` },
      { step: 6, title: "Ergebnis (Menge)", latex: xRational ? `\\mathbb{L}= \\{ ${xRational.x1.toLatex()} \\quad , \\quad ${xRational.x2.toLatex()} \\}` : `\\mathbb{L}= \\{ -\\frac{${P.toLatex()}}{2} + \\frac{\\sqrt{${numerator.toLatex()}}}{2} \\quad , \\quad -\\frac{${P.toLatex()}}{2} - \\frac{\\sqrt{${numerator.toLatex()}}}{2} \\}` },
    ];

    const isNegativeD = numerator.n < 0; // because denominator 4 > 0
    return { P, Q, pOver2, p2Over4, numerator, Dfrac, sqrtD_latex, isNegativeD, steps, xRational } as const;
  }, [p, q]);

  const abcArtifacts = useMemo(() => {
    const A = Frac.fromNumber(a);
    const B = Frac.fromNumber(b);
    const C = Frac.fromNumber(c);

    const steps: Step[] = [];

    if (A.isZero()) {
      // linear / degenerate
      steps.push({ step: 1, title: "Lineare Gleichung", latex: `${B.toLatex()}\,x + ${C.toLatex()} = 0` });
      if (B.isZero()) {
        // C = 0 → alle, sonst keine
        return { type: C.isZero() ? "all" : "none", steps } as const;
      }
      const minusCoverB = C.mul(-1).div(B);
      steps.push({ step: 2, title: "Lösen", latex: `x = -\\frac{${C.toLatex()}}{${B.toLatex()}} = ${minusCoverB.toLatex()}` });
      return { type: "linear", x: minusCoverB, steps } as const;
    }

    // Quadratic case
    const b2 = B.sqr();
    const fourac = A.mul(C).mul(4); // 4ac
    const Delta = b2.sub(fourac); // b^2 - 4ac
    const denSqrt = sqrtInt(Delta.d);
    const sqrtDeltaLatex = denSqrt ? `\\frac{\\sqrt{${Delta.n}}}{${denSqrt}}` : `\\frac{\\sqrt{${Delta.n}}}{\\sqrt{${Delta.d}}}`;

    // exact sqrt if both numerator and denominator are perfect squares
    const sqrtDeltaExact = Delta.n >= 0 ? (() => { const sn = sqrtInt(Math.abs(Delta.n)); const sd = sqrtInt(Delta.d); return sn && sd ? new Frac(sn, sd) : null; })() : null;

    const twoA = A.mul(2);
    const rationalRootsLocal = sqrtDeltaExact
      ? {
          x1: B.mul(-1).add(sqrtDeltaExact).div(twoA),
          x2: B.mul(-1).sub(sqrtDeltaExact).div(twoA),
        }
      : null;
    steps.push({
      step: 1,
      title: "Einsetzen in abc-Formel",
      latex: `x_{1,2} = \\frac{-${latexParen(B.toLatex())} \\pm \\sqrt{${latexParen(B.toLatex())}^{2} - 4\\,${latexParen(A.toLatex())}\\,${latexParen(C.toLatex())}}}{${twoA.toLatex()}}`,
    });
    steps.push({ step: 2, title: "Quadrat in der Wurzel berechnen", latex: `x_{1,2}= \\frac{-${latexParen(B.toLatex())} \\pm \\sqrt{${b2.toLatex()} - ${fourac.toLatex()}}}{${twoA.toLatex()}}` });
    steps.push({ step: 3, title: "Wurzel auflösen", latex: `x_{1,2}= \\frac{-${latexParen(B.toLatex())} \\pm ${sqrtDeltaExact ? sqrtDeltaExact.toLatex() : `\\sqrt{${Delta.toLatex()}}`}}{${twoA.toLatex()}}` });
    steps.push({ step: 4, title: "Ergebnis (Menge)", latex: rationalRootsLocal ? `\\mathbb{L}= \\{ ${rationalRootsLocal.x1.toLatex()} \\quad , \\quad ${rationalRootsLocal.x2.toLatex()} \\}` : `\\mathbb{L}= \\{ \\frac{-${latexParen(B.toLatex())} + \\sqrt{${Delta.toLatex()}}}{${twoA.toLatex()}} \\quad , \\quad \\frac{-${latexParen(B.toLatex())} - \\sqrt{${Delta.toLatex()}}}{${twoA.toLatex()}} \\}` });

    const isNegativeDelta = Delta.n < 0;
    // exact rational roots if sqrtDeltaExact exists
    const rationalRoots = !isNegativeDelta && sqrtDeltaExact
      ? {
          x1: B.mul(-1).add(sqrtDeltaExact).div(A.mul(2)),
          x2: B.mul(-1).sub(sqrtDeltaExact).div(A.mul(2)),
        }
      : null;
    return { type: "quadratic", A, B, C, Delta, sqrtDeltaLatex, isNegativeDelta, steps, rationalRoots, sqrtDeltaExact } as const;
  }, [a, b, c]);

  const renderEquationPreview = () => {
    if (mode === "pq") {
      const P = Frac.fromNumber(p);
      const Q = Frac.fromNumber(q);
      const latex = `x^2 ${P.n < 0 ? "-" : "+"} ${latexParen(latexAbs(P))}\\,x ${Q.n < 0 ? "-" : "+"} ${latexParen(latexAbs(Q))} = 0`;
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { throwOnError: false, displayMode: true }) }} />
        </div>
      );
    }
    const A = Frac.fromNumber(a); const B = Frac.fromNumber(b); const C = Frac.fromNumber(c);
    const signB = B.n < 0 ? "-" : "+";
    const signC = C.n < 0 ? "-" : "+";
    const latex = `${A.toLatex()}x^2 ${signB} ${latexParen(latexAbs(B))}\\,x ${signC} ${latexParen(latexAbs(C))} = 0`;
    return (
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 h-full w-full flex items-center justify-center">
        <div className="prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, { throwOnError: false, displayMode: true }) }} />
      </div>
    );
  };

  const renderResultPanel = () => {
    if (mode === "pq") {
      const { P, numerator, isNegativeD, xRational } = pqArtifacts;
      if (isNegativeD) {
        if (!showComplex) {
          const emptySet = katex.renderToString(`\\mathbb{L}= \\emptyset`, { throwOnError: false });
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
              <div className="prose-sm max-w-none text-red-700 dark:text-red-300" dangerouslySetInnerHTML={{ __html: emptySet }} />
              <div className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">Keine reellen Lösungen (D &lt; 0)</div>
            </div>
          );
        }
        const absNum = new Frac(Math.abs(numerator.n), numerator.d);
        const sqrtAbs = absNum.d === 1 ? sqrtInt(absNum.n) : null;
        const numPart = sqrtAbs ? String(sqrtAbs) : `\\sqrt{${absNum.toLatex()}}`;
        const setLatex = `\\mathbb{L}= \\{ -\\frac{${P.toLatex()}}{2} + i\\cdot\\frac{${numPart}}{2} \\quad , \\quad -\\frac{${P.toLatex()}}{2} - i\\cdot\\frac{${numPart}}{2} \\}`;
        const rendered = katex.renderToString(setLatex, { throwOnError: false });
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
            <div className="prose-sm max-w-none text-yellow-900 dark:text-yellow-100" dangerouslySetInnerHTML={{ __html: rendered }} />
          </div>
        );
      }
      const setLatex = xRational
        ? `\\mathbb{L}= \\{ ${xRational.x1.toLatex()} \\quad , \\quad ${xRational.x2.toLatex()} \\}`
        : `\\mathbb{L}= \\{ -\\frac{${P.toLatex()}}{2} + \\frac{\\sqrt{${numerator.toLatex()}}}{2} \\quad , \\quad -\\frac{${P.toLatex()}}{2} - \\frac{\\sqrt{${numerator.toLatex()}}}{2} \\}`;
      const rendered = katex.renderToString(setLatex, { throwOnError: false, displayMode: false });
      // numeric approximations only if irrational (no exact rational roots)
      const Dnum = (Number(p) * Number(p)) - 4 * Number(q);
      if (Dnum >= 0 && !xRational) {
        const x1num = (-Number(p) + Math.sqrt(Dnum)) / 2;
        const x2num = (-Number(p) - Math.sqrt(Dnum)) / 2;
        const approx = `\\begin{align*} x_1&\\approx ${fmt4(x1num)} \\quad x_2\\approx ${fmt4(x2num)} \\end{align*}`;
        const approxHtml = katex.renderToString(approx, { throwOnError: false, displayMode: true });
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 h-full w-full flex flex-col items-center justify-center gap-2">
            <div className="prose-sm max-w-none text-green-900 dark:text-green-100" dangerouslySetInnerHTML={{ __html: rendered }} />
            <div className="prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: approxHtml }} />
          </div>
        );
      }
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none text-green-900 dark:text-green-100" dangerouslySetInnerHTML={{ __html: rendered }} />
        </div>
      );
    }

    // abc
    if (abcArtifacts.type === "none") {
      const emptySet = katex.renderToString(`\\mathbb{L}= \\emptyset`, { throwOnError: false });
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none text-red-700 dark:text-red-300" dangerouslySetInnerHTML={{ __html: emptySet }} />
          <div className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">Keine reellen Lösungen (Δ &lt; 0)</div>
        </div>
      );
    }
    if (abcArtifacts.type === "all") {
      const allLatex = katex.renderToString(`\\mathbb{L}= \\mathbb{R}`, { throwOnError: false });
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none text-yellow-800 dark:text-yellow-200" dangerouslySetInnerHTML={{ __html: allLatex }} />
        </div>
      );
    }
    if (abcArtifacts.type === "linear") {
      const setLatex = katex.renderToString(`\\mathbb{L}= \\left\\{ ${abcArtifacts.x.toLatex()} \\right\\}`, { throwOnError: false });
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none text-blue-900 dark:text-blue-100" dangerouslySetInnerHTML={{ __html: setLatex }} />
        </div>
      );
    }
    // quadratic branch
    if (abcArtifacts.type === "quadratic") {
      const { A, B, Delta, isNegativeDelta, rationalRoots } = abcArtifacts;
      if (isNegativeDelta) {
        if (!showComplex) {
          const emptySet = katex.renderToString(`\\mathbb{L}= \\emptyset`, { throwOnError: false });
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
              <div className="prose-sm max-w-none text-red-700 dark:text-red-300" dangerouslySetInnerHTML={{ __html: emptySet }} />
              <div className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">Keine reellen Lösungen (Δ &lt; 0)</div>
            </div>
          );
        }
        const absDelta = new Frac(Math.abs(Delta.n), Delta.d);
        const sn = sqrtInt(absDelta.n); const sd = sqrtInt(absDelta.d);
        const sqrtAbs = sn && sd ? new Frac(sn, sd).toLatex() : `\\frac{\\sqrt{${absDelta.n}}}{${sd ?? `\\sqrt{${absDelta.d}}`}}`;
        const setLatex = `\\mathbb{L}= \\{ \\frac{-(${B.toLatex()}) + i\\cdot ${sqrtAbs}}{2\\cdot(${A.toLatex()})} \\quad , \\quad \\frac{-(${B.toLatex()}) - i\\cdot ${sqrtAbs}}{2\\cdot(${A.toLatex()})} \\}`;
        const rendered = katex.renderToString(setLatex, { throwOnError: false });
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
            <div className="prose-sm max-w-none text-yellow-900 dark:text-yellow-100" dangerouslySetInnerHTML={{ __html: rendered }} />
          </div>
        );
      }
      const setLatex = rationalRoots
        ? `\\mathbb{L}= \\{ ${rationalRoots.x1.toLatex()} \\quad , \\quad ${rationalRoots.x2.toLatex()} \\}`
        : `\\mathbb{L}= \\{ \\frac{-(${B.toLatex()}) + \\sqrt{${Delta.toLatex()}}}{2\\cdot(${A.toLatex()})} \\quad , \\quad \\frac{-(${B.toLatex()}) - \\sqrt{${Delta.toLatex()}}}{2\\cdot(${A.toLatex()})} \\}`;
      const rendered = katex.renderToString(setLatex, { throwOnError: false });
      const Dnum2 = (Number(b) * Number(b)) - 4 * Number(a) * Number(c);
      if (Dnum2 >= 0 && Number(a) !== 0 && !rationalRoots) {
        const denom = 2 * Number(a);
        const sqrtD = Math.sqrt(Dnum2);
        const x1num = (-Number(b) + sqrtD) / denom;
        const x2num = (-Number(b) - sqrtD) / denom;
        const approx = `\\begin{align*} x_1&\\approx ${fmt4(x1num)} \\quad x_2&\\approx ${fmt4(x2num)} \\end{align*}`;
        const approxHtml = katex.renderToString(approx, { throwOnError: false, displayMode: true });
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 h-full w-full flex flex-col items-center justify-center gap-2">
            <div className="prose-sm max-w-none text-green-900 dark:text-green-100" dangerouslySetInnerHTML={{ __html: rendered }} />
            <div className="prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: approxHtml }} />
          </div>
        );
      }
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 h-full w-full flex items-center justify-center">
          <div className="prose-sm max-w-none text-green-900 dark:text-green-100" dangerouslySetInnerHTML={{ __html: rendered }} />
        </div>
      );
    }
  };

  const stepsToRender: Step[] = useMemo(() => {
    if (mode === "pq") return pqArtifacts.steps;
    return abcArtifacts.steps as Step[];
  }, [mode, pqArtifacts.steps, abcArtifacts.steps]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-4 bg-white dark:bg-gray-800 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
        <button
          onClick={toggleExpanded}
          className="group flex items-center justify-center w-8 h-8 rounded-full ml-4 flex-shrink-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 transition-all duration-300"
        >
          <ChevronDown
            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : "animate-[intermittent-float_16s_ease-in-out_infinite] group-hover:animate-none"
            }`}
          />
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Mode toggle */}
          <div className="mb-4 inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode("pq")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                mode === "pq"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-pressed={mode === "pq"}
            >
              pq-Formel
            </button>
            <button
              onClick={() => setMode("abc")}
              className={`px-3 py-1.5 text-sm transition-colors border-l border-gray-200 dark:border-gray-700 ${
                mode === "abc"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-pressed={mode === "abc"}
            >
              abc-Formel
            </button>
          </div>

          {/* Inputs (volle Breite) */}
          <div className="mb-6">
            {mode === "pq" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-4 flex-nowrap">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">p</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">p</span>
                      </div>
                      <input type="number" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">q</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">q</span>
                      </div>
                      <input type="number" value={q} onChange={(e) => setQ(Number(e.target.value))} className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  </div>
                  <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 whitespace-nowrap">
                    <RotateCcw className="w-4 h-4" />
                    Zurücksetzen
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-end gap-4 flex-wrap md:flex-nowrap">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">a</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">a</span>
                    </div>
                    <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">b</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">b</span>
                    </div>
                    <input type="number" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">c</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-4 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-500 rounded-l-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">c</span>
                    </div>
                    <input type="number" value={c} onChange={(e) => setC(Number(e.target.value))} className="w-full pl-14 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 whitespace-nowrap">
                  <RotateCcw className="w-4 h-4" />
                  Zurücksetzen
                </button>
              </div>
            )}
          </div>

          {/* Zwei Spalten: Eingabe-Vorschau | Lösung (gleiche Höhe) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Eingabe */}
            <div className="flex flex-col h-full">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Eingabe</div>
              <div className="flex-1 flex items-center">{renderEquationPreview()}</div>
            </div>

            {/* Lösung */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Lösung</div>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={showComplex} onChange={(e) => setShowComplex(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  Komplexe Lösungen anzeigen
                </label>
              </div>
              <div className="flex-1 flex items-center">{renderResultPanel()}</div>
            </div>
          </div>

          {/* Schritt-für-Schritt (volle Breite) */}
          {stepsToRender.length > 0 && (
            <div className="mt-6">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button onClick={() => setShowSteps(!showSteps)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
                  {showSteps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Schritt-für-Schritt anzeigen ({stepsToRender.length})
                </button>
                {showSteps && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-base md:text-xl">
                      {mode === "pq" ? (
                        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: katex.renderToString(`x= -\\frac{p}{2} \\pm \\sqrt{(\\tfrac{p}{2})^2 - q}`, { throwOnError: false, displayMode: true }) }} />
                      ) : (
                        <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: katex.renderToString(`x= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`, { throwOnError: false, displayMode: true }) }} />
                      )}
                    </div>
                    {stepsToRender.map((s) => (
                      <div key={s.step} className={`rounded-lg p-4 ${showComplex && ((mode === 'pq' && pqArtifacts.isNegativeD) || (mode === 'abc' && abcArtifacts.type === 'quadratic' && abcArtifacts.isNegativeDelta)) && s.step === 6 ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-semibold">{s.step}</div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{s.title}</div>
                            {s.latex && (
                              <div className="prose max-w-none text-base md:text-lg dark:prose-invert" dangerouslySetInnerHTML={{ __html: katex.renderToString(s.latex, { throwOnError: false, displayMode: true }) }} />
                            )}
                            {s.explanation && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.explanation}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Quadratische Gleichungen • pq/abc • Reelle Lösungen
          </div>
        </>
      )}
    </div>
  );
}
