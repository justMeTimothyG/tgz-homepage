import Image from 'next/image';
import { Suspense } from 'react';
import LatestPostsClient from '@/components/LatestPostsClient';

// Prefer static generation for the landing page
export const dynamic = 'force-static';

// Client component imported normally; it fetches on the client so SSG isn't blocked

export default function HomePage() {
  return (
    <div className="">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Timothy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Lüdtke</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Software Engineer – Interaktive Bildung, Visualisierungen und KI-gestützte Inhalte
            </p>
          </div>
          <div className="flex md:justify-end">
            <div className="h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-800">
              <Image src="/profile.jpg" alt="Profilfoto von Timothy Lüdtke" width={400} height={400} className="h-full w-full object-cover" />
            </div>
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
          <Suspense fallback={<p className="text-gray-600 dark:text-gray-300">Lade Beiträge…</p>}>
            <LatestPostsClient />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
