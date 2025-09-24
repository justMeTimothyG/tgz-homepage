import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollectionResource, type CollectionResource } from '@/lib/collection-resources';

export const metadata: Metadata = {
  title: 'Mathe I Sammlung – Timothy Lüdtke',
  description:
    'Kuratiert in Mathe I einsteigen: Generalmaterial, thematische Vertiefungen und Lernreflexionen für Lineare Algebra und Analysis im ersten Semester.',
};

const linkHighlightClass = 'from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500';

type SectionConfig = {
  key: string;
  title: string;
  description: string;
  resources: CollectionResource[];
  highlightClassName?: string;
};

const pageSections: SectionConfig[] = [
  {
    key: 'topics',
    title: 'Themen',
    description:
      'Vertiefungen zu Kernthemen der Vorlesung. Perfekt für Wiederholungsphasen und Prüfungsvorbereitung.',
    resources: [
      getCollectionResource(
        'potenz-exponential-logarithmen',
        'Potenz- und Logarithmengesetze',
        '',
      ),
      getCollectionResource(
        'trigonometrie-grundlagen',
        'Trigonometrie – Kreis, Sinus, Cosinus',
        '',
      ),
      getCollectionResource(
        'ableitungsregeln-zusammenfassung',
        'Differentiale - Ableitungen',
        '',
      ),
      getCollectionResource(
        'integrationsregeln-zusammenfassung',
        'Integrale',
        '',
      ),
    ],
  },
  {
    key: 'foundations',
    title: 'Grundlagen',
    description:
      'Starte mit den Fundamenten: Definitionen, Terme und Rechengesetze. Diese Beiträge schaffen das Vokabular, das in späteren Vorlesungen vorausgesetzt wird.',
    resources: [
      getCollectionResource(
        'mathematische-definitionen',
        'Mathematische Definitionen',
        '',
      ),
      getCollectionResource(
        'begriffe-und-rechenregeln',
        'Begriffe und Rechenregeln',
        '',
      ),
      getCollectionResource(
        'bruchrechnung',
        'Bruchrechnung',
        '',
      ),
      getCollectionResource(
        'summenzeichen',
        'Das Summenzeichen',
        '',
      ),
      getCollectionResource(
        'polynomdivision',
        'Polynomdivision',
        '',
      ),
    ],
  },
  {
    key: 'general',
    title: 'Generelles',
    description: 'Generelles was wichtig sein könnte für die Veranstaltung.',
    resources: [
      {
        title: 'Weitere Ressourcen folgen',
        variant: 'note',
      },
    ],
  },
  {
    key: 'reflections',
    title: 'Reflections',
    description:
      'Lernen endet nicht nach dem letzten Übungsblatt. Hier sammle ich Gedanken dazu, wie ich das Fach besser verankere: Methoden, Routinen und kleine Retrospektiven.',
    resources: [
      {
        title: 'Studi-Routine & Wochenstruktur',
      },
      {
        title: 'Weitere Reflexionen folgen',
        variant: 'note',
      },
    ],
  },
];

function CollectionListItem({ item }: { item: CollectionResource }) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex flex-col rounded-xl px-4 py-3 border border-transparent transition hover:border-amber-400/60 hover:bg-amber-50/70 dark:hover:border-amber-400/40 dark:hover:bg-amber-500/10"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</span>
      </Link>
    );
  }

  if (item.variant === 'note') {
    return (
      <div className="flex flex-col rounded-xl px-4 py-3 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{item.title}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl px-4 py-3 border border-transparent text-gray-800 dark:text-gray-200">
      <span className="font-semibold">{item.title}</span>
    </div>
  );
}

function CollectionSection({ section }: { section: SectionConfig }) {
  const highlightClass = section.highlightClassName ?? linkHighlightClass;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${highlightClass}`}>
            {section.title}
          </span>
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{section.description}</p>
      </div>
      <div className="space-y-3">
        {section.resources.map((item) => (
          <CollectionListItem key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function MatheEinsCollectionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <header className="text-center space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Sammlung · Universität
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
          Mathe I – Lineare Algebra & Analysis
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Diese Sammlung bündelt die wichtigsten Grundlagen aus meinem ersten Mathe-Semester.
        </p>
      </header>
      <div className="grid gap-12 lg:grid-cols-2">
        {pageSections.map((section) => (
          <CollectionSection key={section.key} section={section} />
        ))}
      </div>
    </div>
  );
}
