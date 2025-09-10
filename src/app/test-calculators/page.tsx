import GcdCalculator from '@/components/registry/GcdCalculator';
import LcmCalculator from '@/components/registry/LcmCalculator';

export default function TestCalculatorsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        ggT und kgV Rechner - Test
      </h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Größter gemeinsamer Teiler (ggT)
          </h2>
          <GcdCalculator />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Kleinstes gemeinsames Vielfaches (kgV)
          </h2>
          <LcmCalculator />
        </section>
      </div>

      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Verwendung in Blog-Posts
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Diese Komponenten können in Markdown-Blog-Posts verwendet werden:
        </p>
        <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm">
          <div>{`<GcdCalculator initialA={48} initialB={18} />`}</div>
          <div>{`<LcmCalculator initialA={12} initialB={8} />`}</div>
        </div>
      </div>
    </div>
  );
}