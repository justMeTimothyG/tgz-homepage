import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import 'katex/dist/katex.min.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timothy Ludtke - Software Engineer",
  description: "Portfolio und Lern-Blog von Timothy Ludtke - Software Engineer mit Fokus auf interaktive Bildung und KI-gestützte Inhalte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100`}
      >
        {/* Set initial theme before hydration to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
  (function(){
    try {
      var s = localStorage.getItem('theme');
      var m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var t = s || m;
  if (t === 'dark') { document.documentElement.classList.add('dark'); }
    } catch (e) {}
  })();
          `,
          }}
        />
        {/* Plausible Analytics */}
        <Script
          src="https://analytics.blickfangemsland.de/js/script.js"
          data-domain="tluedtke.de"
          strategy="afterInteractive"
        />
        {/* KaTeX is loaded via CSS in Markdown component; no runtime script needed */}
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
