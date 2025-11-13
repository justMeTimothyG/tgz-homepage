import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollectionResource, type CollectionResource } from '@/lib/collection-resources';

export const metadata: Metadata = {
  title: 'Rechtliche Grundlagen Sammlung – Timothy Lüdtke',
  description:
    'Rechtliche Grundlagen souverän verstehen: Vorlesungsnotizen, thematische Vertiefungen und Reflexionen für das dritte Semester.',
};

const linkHighlightClass = 'from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500';

type SectionConfig = {
  key: string;
  title: string;
  description: string;
  resources: CollectionResource[];
  highlightClassName?: string;
};

const pageSections: SectionConfig[] = [
  {
    key: 'vorlesungsnotizen',
    title: 'Vorlesungsnotizen',
    description: 'Kondensierte Zusammenfassungen der Vorlesungen – perfekt zum Nacharbeiten und zur Prüfungsvorbereitung.',
    resources: [
      getCollectionResource({
        slug: '01-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '01: Einführung in das Rechtssystem',
      }),
      getCollectionResource({
        slug: '02-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '02: BGB AT, Rechtssubjekte, Rechtsobjekte, Willenserklärungen',
      }),
      getCollectionResource({
        slug: '03-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '03: Vertragsrecht und Wirksamkeitshindernisse',
      }),
      getCollectionResource({
        slug: '04-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '04: Stellvertretung, Einführung in das Schuldrecht',
      }),
      getCollectionResource({
        slug: '05-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '05: Rechtliche Grundlagen - Fortführung Schuldverhältnis',
      }),
      getCollectionResource({
        slug: '06-rechtliche-grundlagen',
        source: 'lecture',
        overrideTitle: '06: Fallbearbeitung - Schadensersatz und Leistungsstörungen',
      }),
      {
        title: 'Weitere Vorlesungsnotizen folgen',
        variant: 'note',
      },
    ],
  },
  {
    key: 'generelles',
    title: 'Generelles',
    description: 'Allgemeine Informationen und Hinweise, die für die Veranstaltung relevant sind.',
    resources: [
      getCollectionResource({
        slug: 'rechtliche-grundlagen-klausurhinweise',
        source: 'lecture',
        overrideTitle: 'Klausur Hinweise - Rechtliche Grundlagen WiSe 25/26',
      }),
    ],
  },
  {
    key: 'grundlagen',
    title: 'Grundlagen',
    description: 'Die Basisbegriffe und -prinzipien, die in jeder Rechtsmaterie wiederkehren.',
    resources: [
      {
        title: 'Definitionen & Legalbegriffe',
        variant: 'note',
      },
      {
        title: 'Überblick: Rechtsquellen & Auslegung',
        variant: 'note',
      },
    ],
  },
  {
    key: 'reflections',
    title: 'Reflections',
    description: 'Lernreflexionen, Routinen und Notizen zur nachhaltigen Verankerung der Inhalte.',
    resources: [
      {
        title: 'Learning Log Rechtliche Grundlagen',
        variant: 'note',
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
        className="group flex flex-col rounded-xl px-4 py-3 border border-transparent transition hover:border-emerald-400/60 hover:bg-emerald-50/70 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</span>
        {item.description ? (
          <span className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
        ) : null}
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

export default function CollectionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <header className="text-center space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Sammlung · Universität
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
          Rechtliche Grundlagen
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Diese Sammlung bündelt die wichtigsten Grundlagen aus der Veranstaltung Rechtliche Grundlagen im 3. Semester.
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
