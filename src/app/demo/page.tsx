import GaussianElimination from '@/components/markdown/GaussianElimination';
import Download from '@/components/markdown/Download';

export const metadata = {
  title: 'Demo | Komponenten-Vorschau',
  description: 'Schnelle Vorschau neu erstellter Komponenten.',
};

export default function DemoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Komponenten-Demo</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Gaussian Elimination</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Interaktiver Editor mit exakten Brüchen und Schrittansicht.</p>
        <GaussianElimination defaultExpanded initialRows={3} initialCols={4} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Download</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Einzel-Download sowie Varianten-Auswahl.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Download
            title="Einzeldownload (Beispiel)"
            description="Direkter Download einer Datei."
            href="https://example.com/sample.pdf"
            fileType="pdf"
          />
          <Download
            title="Varianten (Beispiel Karteikarten)"
            description="Wähle die gewünschte Variante."
            variants={[
              { variant: 'Anki', link: 'https://example.com/deck.apkg', filetype: 'apkg' },
              { variant: 'PDF A4', link: 'https://example.com/cards-a4.pdf', filetype: 'pdf' },
              { variant: 'PDF A5', link: 'https://example.com/cards-a5.pdf', filetype: 'pdf' },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

