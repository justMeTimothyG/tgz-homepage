"use client";

import React from "react";

type Operation = "union" | "intersection" | "aMinusB" | "bMinusA" | "xor";

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

function VennSVG({ op }: { op: Operation }) {
  // Larger diagram
  const w = 520;
  const h = 320;
  const r = 120;
  const ax = 210; // left circle center x
  const bx = 310; // right circle center x
  const cy = 180; // centers y

  // Colors
  const line = "#64748b"; // slate-500
  const fill = {
    primary: "#3b82f6", // blue-500
    secondary: "#22c55e", // green-500
    highlight: "#60a5fa", // blue-400
  };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mx-auto block w-full h-auto max-w-[720px]"
      role="img"
      aria-label="Venn-Diagramm"
      preserveAspectRatio="xMidYMid meet"
    >
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
      <rect x="0" y="0" width={w} height={h} rx="16" fill="currentColor" opacity="0.03" />

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
      <text x={ax} y={cy - r - 14} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="16">A</text>
      <text x={bx} y={cy - r - 14} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200" fontSize="16">B</text>
    </svg>
  );
}

const OP_META: Record<Operation, { expr: string; symbol: string; label: string; description: string }> = {
  union: { expr: "A ∪ B", symbol: "∪", label: "Vereinigung", description: "Alles in A oder B (oder beiden)." },
  intersection: { expr: "A ∩ B", symbol: "∩", label: "Schnittmenge", description: "Elemente, die gleichzeitig in A und B liegen." },
  aMinusB: { expr: "A ∖ B", symbol: "∖", label: "Differenz A∖B", description: "Elemente in A, aber nicht in B." },
  bMinusA: { expr: "B ∖ A", symbol: "∖", label: "Differenz B∖A", description: "Elemente in B, aber nicht in A." },
  xor: { expr: "A Δ B", symbol: "Δ", label: "Symmetrische Differenz", description: "Elemente in genau einer der beiden Mengen." },
};

const OP_SUBTITLE: Record<Operation, string> = {
  union: "Vereinigung",
  intersection: "Schnittmenge",
  aMinusB: "Differenz",
  bMinusA: "Differenz",
  xor: "Symmetrische Differenz",
};

export default function VennSets() {
  const [op, setOp] = React.useState<Operation>("union");
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click / Esc
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cx("my-6")}> 
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-8 md:p-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: header, dropdown, description */}
          <div className="self-center order-1">
            {/* Centered term A [op] B */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {(() => {
                const leftLabel = op === 'bMinusA' ? 'B' : 'A';
                const rightLabel = op === 'bMinusA' ? 'A' : 'B';
                return (
                  <>
                    <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100 select-none">{leftLabel}</span>
                    <div className="relative">
                      <button
                        ref={btnRef}
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={open}
                        aria-label="Mengenoperation auswählen"
                        className="min-w-[3rem] inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-2xl font-semibold px-3 py-1.5 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {OP_META[op].symbol}
                      </button>
                      {open && (
                        <div
                          ref={menuRef}
                          role="menu"
                          className="absolute z-20 mt-2 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
                        >
                          {([
                            'union',
                            'intersection',
                            'aMinusB',
                            'bMinusA',
                            'xor',
                          ] as Operation[]).map((key) => {
                            const active = key === op;
                            return (
                              <button
                                key={key}
                                role="menuitem"
                                onClick={() => {
                                  setOp(key);
                                  setOpen(false);
                                }}
                                className={cx(
                                  'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
                                  active
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100'
                                )}
                              >
                                <span className="w-6 text-xl text-center select-none">{OP_META[key].symbol}</span>
                                <span className="truncate text-sm">{OP_META[key].label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-3xl font-semibold text-gray-900 dark:text-gray-100 select-none">{rightLabel}</span>
                  </>
                );
              })()}
            </div>

            {/* Sub title reflecting current operator */}
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
              {OP_SUBTITLE[op]}
            </div>

            {/* Only explanation text (no repeating subtitle) */}
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 text-center">
              {OP_META[op].description}
            </p>

            {/* Eselsbrücke (nur für aktuelle Auswahl) */}
            <div className="mt-5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 text-center">Eselsbrücke</div>
              <div className="flex items-center gap-3 justify-center text-sm text-gray-700 dark:text-gray-300">
                <span className="w-6 text-xl text-center">{OP_META[op].symbol}</span>
                <span>
                  {op === 'union' && 'Vereinigung – wie eine Schale, die alles auffängt.'}
                  {op === 'intersection' && 'Schnitt – die Überlappung „unter der Kappe“.'}
                  {op === 'aMinusB' && 'Differenz – der Rückstrich „schneidet“ etwas heraus.'}
                  {op === 'bMinusA' && 'Differenz – der Rückstrich „schneidet“ etwas heraus.'}
                  {op === 'xor' && 'Symmetrische Differenz – Delta steht für Veränderung (entweder/oder).'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: larger diagram */}
          <div className="lg:pl-4 order-2">
            <VennSVG op={op} />
          </div>
        </div>
      </div>
    </div>
  );
}
