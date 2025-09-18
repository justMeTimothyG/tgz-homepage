'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const navigation = [
  { name: 'Über mich', href: '/ueber-mich' },
  { name: 'Blog', href: '/blog' },
  { name: 'Sammlungen', href: '/sammlungen' },
  { name: 'Tools', href: '/tools' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide navigation on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="bg-transparent border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-gray-900 dark:text-white underline underline-offset-4'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              aria-expanded={mobileMenuOpen}
              aria-controls="primary-navigation"
            >
              <span className="sr-only">Hauptmenü öffnen</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="primary-navigation"
          className={`md:hidden origin-top overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? 'max-h-[480px] opacity-100 translate-y-0'
              : 'pointer-events-none max-h-0 opacity-0 -translate-y-2'
          }`}
        >
          <div className="px-4 pb-6 pt-4">
            <nav className="flex flex-col items-center gap-3 text-center">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`w-full rounded-full px-5 py-3 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 dark:focus-visible:ring-offset-gray-900 ${
                      isActive
                        ? 'bg-gray-900/10 text-gray-900 underline underline-offset-4 dark:bg-white/10 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-2 flex items-center justify-center">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </nav>
  );
}
