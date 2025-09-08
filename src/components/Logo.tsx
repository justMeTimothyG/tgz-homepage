'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="text-xl font-extrabold tracking-tight leading-none">
      <span className="inline-flex items-baseline gap-1">
        <span className="text-gray-900 dark:text-white">Timothy</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Lüdtke</span>
      </span>
    </Link>
  );
}


