"use client";

import React from 'react';
import { Wrench } from 'lucide-react';
import GcdCalculator from '@/components/markdown/GcdCalculator';
import LcmCalculator from '@/components/markdown/LcmCalculator';
import GaussianElimination from '@/components/markdown/GaussianElimination';
import PascalsTriangle from '@/components/markdown/PascalsTriangle';
import VennSets from '@/components/markdown/VennSets';

type ToolId = 'gcd' | 'lcm' | 'gauss' | 'pascal' | 'venn';
type ToolTree = {
  label: string;
  items?: { id: ToolId; name: string; description?: string }[];
  children?: ToolTree[];
};

const toolsTree: ToolTree[] = [
  {
    label: 'Mathematik',
    items: [
      { id: 'gcd', name: 'ggT-Rechner', description: 'Größter gemeinsamer Teiler' },
      { id: 'lcm', name: 'kgV-Rechner', description: 'Kleinstes gemeinsames Vielfaches' },
      { id: 'gauss', name: 'Gauß-Eliminationsrechner', description: 'Zeilenumformungen, RREF, LGS' },
      { id: 'pascal', name: 'Pascal’sches Dreieck', description: '(a + b)^n und Binomialkoeffizienten' },
      { id: 'venn', name: 'Mengenlehre – Venn', description: 'A ∪ B, A ∩ B, A \\ B, B \\ A, A Δ B' },
    ],
  },
];

function ToolPanel({ selected }: { selected: ToolId }) {
  switch (selected) {
    case 'gcd':
      return (
        <GcdCalculator
          title="ggT-Rechner (Größter gemeinsamer Teiler)"
          description="Berechnet den ggT zweier Zahlen mit dem euklidischen Algorithmus."
          defaultExpanded
        />
      );
    case 'lcm':
      return (
        <LcmCalculator
          title="kgV-Rechner (Kleinstes gemeinsames Vielfaches)"
          description="Berechnet das kgV zweier Zahlen: kgV(a,b) = (a × b) / ggT(a,b)"
          defaultExpanded
        />
      );
    case 'gauss':
      return (
        <GaussianElimination
          title="Gaußsches Eliminationsverfahren (Zeilenumformungen)"
          description="Interaktiver Rechner für lineare Gleichungssysteme. Letzte Spalte ist die rechte Seite (Ergebnisspalte)."
          defaultExpanded
        />
      );
    case 'pascal':
      return (
        <PascalsTriangle
          title="Pascal’sches Dreieck & Binomische Formel"
          description="Erkunde (a + b)^n mit dem Pascal’schen Dreieck. Setze a und b ein oder zeige die allgemeine Formel."
          initialLevel={5}
        />
      );
    case 'venn':
      return <VennSets />;
    default:
      return null;
  }
}

function Group({ node, level, onSelect, selected }: {
  node: ToolTree;
  level: number;
  onSelect: (id: ToolId) => void;
  selected: ToolId;
}) {
  const padding = 8 + level * 12; // px indentation
  return (
    <div style={{ paddingLeft: padding }} className="mb-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        {node.label}
      </div>
      {node.items && (
        <ul className="space-y-1">
          {node.items.map((item) => {
            const isActive = selected === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isActive}
                  title={item.description}
                  className={`w-full text-left px-2 py-2 transition-colors relative group ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {node.children && node.children.map((child) => (
        <Group key={child.label} node={child} level={level + 1} onSelect={onSelect} selected={selected} />
      ))}
    </div>
  );
}

export default function ToolsClient() {
  // Keep initial SSR and hydration output identical; read hash only after mount
  const [selected, setSelected] = React.useState<ToolId>('gcd');

  React.useEffect(() => {
    const readHash = () => {
      const id = window.location.hash.replace('#', '') as ToolId;
      if (id === 'gcd' || id === 'lcm' || id === 'gauss' || id === 'pascal' || id === 'venn') setSelected(id);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const handleSelect = (id: ToolId) => {
    setSelected(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.hash = id;
      history.replaceState(null, '', url.toString());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tools</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
          Kleine Rechner und nützliche Helfer – zentral gesammelt, ohne den passenden Blogartikel suchen zu müssen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden pr-1">
            {toolsTree.map((node) => (
              <Group key={node.label} node={node} level={0} onSelect={handleSelect} selected={selected} />
            ))}
          </div>
        </aside>

        {/* Content */}
        <section className="lg:col-span-8 xl:col-span-9 min-h-[400px]">
          <ToolPanel selected={selected} />
        </section>
      </div>
    </div>
  );
}
