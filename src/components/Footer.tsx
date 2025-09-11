'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Startseite', href: '/' },
    { name: 'Über mich', href: '/ueber-mich' },
    { name: 'Blog', href: '/blog' },
  ];


  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand/Logo Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
              Software Engineer mit Fokus auf interaktive Bildung und KI-gestützte Inhalte. 
              Teile mein Wissen über Programmierung, Algorithmen und moderne Technologien.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
              Schnelle Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


      </div>
                  {/* Legal Links Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12 mb-2 ">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <Link href="/impressum" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                Impressum
              </Link>

              <Link href="/cookie-richtlinie" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                Cookie-Richtlinie
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {currentYear} Blickfang Emsland. Alle Rechte vorbehalten.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}