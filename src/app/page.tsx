import Image from 'next/image';
import Link from 'next/link';
import LatestPosts from '@/components/LatestPosts';
import { collectionSections } from '@/data/collectionSections';
import { getLatestBlogPosts } from '@/lib/blog';

export default function HomePage() {
  const latestPosts = getLatestBlogPosts(5);
  const collections = collectionSections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionTitle: section.title,
    })),
  );

  return (
    <div className="">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Timothy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Lüdtke</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Ehrliches Lernen statt Hochglanz-Momente. <br /> 
              Ich dokumentiere meine Projekte, Gedanken und Fortschritte – offen, unperfekt und transparent. Denn echter Fortschritt entsteht im Prozess, nicht im Verborgenen. Student in Wirtschaftsingenieurwesen.
            </p>
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-800">
              <Image src="/profile.jpg" alt="Profilfoto von Timothy Lüdtke" width={400} height={400} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Collections overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sammlungen</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kompakte Lernpfade und thematische Cluster, die meine Beiträge bündeln.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((item) => {
              const cardContent = (
                <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 transition hover:border-blue-400/70 hover:shadow-sm dark:hover:border-blue-400/60">
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {item.sectionTitle}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  {item.subtitle ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              );

              if (item.href) {
                return (
                  <Link key={`${item.sectionTitle}-${item.title}`} href={item.href} className="group">
                    {cardContent}
                  </Link>
                );
              }

              return (
                <div
                  key={`${item.sectionTitle}-${item.title}`}
                  className="group opacity-80"
                  aria-disabled
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wavy separator */}
      <div className="relative">
        <svg className="w-full h-12 text-gray-50 dark:text-gray-900" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C240,0 480,64 720,32 C960,0 1200,64 1440,32 L1440,48 L0,48 Z"></path>
        </svg>
      </div>

      {/* Blog preview section with different background */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Neueste Beiträge</h2>
          <LatestPosts posts={latestPosts} />
        </div>
      </section>
    </div>
  );
}
