import type { Metadata } from 'next';
import Link from 'next/link';

type CollectionItem = {
  title: string;
  description: string;
  subtitle: string;
  href?: string;
};

type CollectionSection = {
  title: string;
  description: string;
  items: CollectionItem[];
};

export const metadata: Metadata = {
  title: 'Sammlungen - Timothy Lüdtke',
  description:
    'Kurierte Sammlungen und thematische Übersichten über Blogposts – geordnet nach Studium, Themen und Lernpfaden.',
};

const collectionSections: CollectionSection[] = [
  {
    title: 'Studium',
    description:
      'Module und Schwerpunkte aus meinem Studium. Jede Sammlung bündelt Blogposts, Zusammenfassungen und Materialien, die beim Lernen helfen.',
    items: [
      {
        href: '/sammlungen/mathe-eins',
        title: 'Mathe I – Lineare Algebra & Analysis',
        description:
          'Grundlagen, Verständnisfragen und Repetitorien für den Einstieg – von linearen Gleichungssystemen bis zu Differenzialrechnung.',
        subtitle: '1. Semester',
      },
    ],
  },
  {
    title: 'Kuratiert & Experimente',
    description:
      'Sammlungen abseits der Uni: Lernpfade, Experimente und thematische Deep-Dives aus meinem persönlichen Wissensarchiv.',
    items: [
      {
        title: 'In Planung',
        description:
          'Weitere Sammlungen folgen – von Produktivität über KI-Werkzeuge bis hin zu kreativen Projekten. Stay tuned!',
        subtitle: 'Demnächst',
      },
    ],
  },
];

export default function CollectionsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Kuratiertes Lernen
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100">
          Sammlungen für Fokus & Struktur
        </h1>
        <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Hier findest du sortierte Übersichten über meine Blogposts. Jede Sammlung liefert Kontext,
          thematische Unterteilungen und klare Einstiege – perfekt, um gezielt in Themen einzutauchen
          oder Prüfungen strukturiert vorzubereiten.
        </p>
      </header>
      <div className="space-y-16">
        {collectionSections.map((section) => (
          <section key={section.title} className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
                  {section.title}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
                {section.description}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {section.items.map((item) => (
                item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex h-full flex-col rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-white/40 dark:bg-gray-900/40 p-6 transition hover:-translate-y-1 hover:border-blue-400/70 hover:bg-blue-50/60 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5"
                  >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{item.subtitle}</span>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </Link>
                ) : (
                  <div
                    key={item.title}
                    className="flex h-full flex-col rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-950/40 p-6 text-gray-500 dark:text-gray-400"
                  >
                    <span className="text-sm font-medium">{item.subtitle}</span>
                    <h3 className="mt-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
