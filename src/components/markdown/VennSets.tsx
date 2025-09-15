"use client";

import React from "react";

type Operation = "union" | "intersection" | "aMinusB" | "bMinusA" | "xor";

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

function VennSVG({ op }: { op: Operation }) {
  // SVG dims and circle positions/sizes
  const w = 240;
  const h = 150;
  const r = 55;
  const ax = 95; // left circle center x
  const bx = 145; // right circle center x
  const cy = 80; // centers y

  // Colors
  const line = "#64748b"; // slate-500
  const fill = {
    primary: "#3b82f6", // blue-500
    secondary: "#22c55e", // green-500
    highlight: "#60a5fa", // blue-400
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto block">
      <defs>
        {/* Base circles as reusable shapes */}
        <circle id="circleA" cx={ax} cy={cy} r={r} />
        <circle id="circleB" cx={bx} cy={cy} r={r} />

        {/* Clip intersection by clipping B with A */}
        <clipPath id="clipIntersection">
          <use href="#circleA" />
        </clipPath>

        {/* Masks for A\B and B\A and Union */}
        <mask id="maskAminusB">
          <rect x="0" y="0" width={w} height={h} fill="black" />
          <use href="#circleA" fill="white" />
          <use href="#circleB" fill="black" />
        </mask>
        <mask id="maskBminusA">
          <rect x="0" y="0" width={w} height={h} fill="black" />
          <use href="#circleB" fill="white" />
          <use href="#circleA" fill="black" />
        </mask>
        <mask id="maskUnion">
          <rect x="0" y="0" width={w} height={h} fill="black" />
          <use href="#circleA" fill="white" />
          <use href="#circleB" fill="white" />
        </mask>
      </defs>

      {/* Subtle background to anchor the diagram */}
      <rect x="0" y="0" width={w} height={h} rx="12" fill="currentColor" opacity="0.03" />

      {/* Base circles outline */}
      <use href="#circleA" fill="#3b82f610" stroke={line} strokeWidth="2" />
      <use href="#circleB" fill="#22c55e10" stroke={line} strokeWidth="2" />

      {/* Highlighted regions based on the operation */}
      {op === "intersection" && (
        <use
          href="#circleB"
          clipPath="url(#clipIntersection)"
          fill={fill.highlight}
          opacity="0.7"
        />
      )}
      {op === "aMinusB" && (
        <rect x="0" y="0" width={w} height={h} fill={fill.primary} opacity="0.7" mask="url(#maskAminusB)" />
      )}
      {op === "bMinusA" && (
        <rect x="0" y="0" width={w} height={h} fill={fill.secondary} opacity="0.7" mask="url(#maskBminusA)" />
      )}
      {op === "union" && (
        <rect x="0" y="0" width={w} height={h} fill={fill.highlight} opacity="0.6" mask="url(#maskUnion)" />
      )}
      {op === "xor" && (
        <>
          <rect x="0" y="0" width={w} height={h} fill={fill.primary} opacity="0.55" mask="url(#maskAminusB)" />
          <rect x="0" y="0" width={w} height={h} fill={fill.secondary} opacity="0.55" mask="url(#maskBminusA)" />
        </>
      )}

      {/* Labels A and B */}
      <text x={ax} y={cy - r - 10} textAnchor="middle" className="fill-current" fill="#0f172a" fontSize="14">
        A
      </text>
      <text x={bx} y={cy - r - 10} textAnchor="middle" className="fill-current" fill="#0f172a" fontSize="14">
        B
      </text>
    </svg>
  );
}

const OP_META: Record<Operation, { expr: string; symbol: string; label: string; description: string }> = {
  union: { expr: "A ∪ B", symbol: "∪", label: "Vereinigung", description: "Alles in A oder B (oder beiden)." },
  intersection: { expr: "A ∩ B", symbol: "∩", label: "Schnitt", description: "Elemente, die gleichzeitig in A und B liegen." },
  aMinusB: { expr: "A ∖ B", symbol: "∖", label: "Differenz A∖B", description: "Elemente in A, aber nicht in B." },
  bMinusA: { expr: "B ∖ A", symbol: "∖", label: "Differenz B∖A", description: "Elemente in B, aber nicht in A." },
  xor: { expr: "A Δ B", symbol: "Δ", label: "Symm. Differenz", description: "Elemente in genau einer der beiden Mengen." },
};

export default function VennSets() {
  const [op, setOp] = React.useState<Operation>("union");

  return (
    <div className={cx("my-6")}> 
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800 shadow-sm">
        {/* Header with A [symbol] B and dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">A</span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100" aria-label="Operation">
              {OP_META[op].symbol}
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">B</span>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            Operation:
            <select
              value={op}
              onChange={(e) => setOp(e.target.value as Operation)}
              className="min-w-[10rem] px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Mengenoperation wählen"
            >
              <option value="union">∪ Vereinigung</option>
              <option value="intersection">∩ Schnitt</option>
              <option value="aMinusB">A ∖ B</option>
              <option value="bMinusA">B ∖ A</option>
              <option value="xor">Δ Symmetrische Differenz</option>
            </select>
          </label>
        </div>

        {/* Expression and description */}
        <div className="text-center sm:text-left mb-3">
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">{OP_META[op].expr}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{OP_META[op].description}</div>
        </div>

        {/* Diagram */}
        <div className="mt-2">
          <VennSVG op={op} />
        </div>
      </div>
    </div>
  );
}
