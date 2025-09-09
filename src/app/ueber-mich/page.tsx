import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Code, 
  MessageCircle, 
  Palette, 
  Microscope, 
  Camera, 
  Target,
  ExternalLink,
  Mail
} from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/BentoGrid';

export const metadata: Metadata = {
  title: 'Über mich - Timothy Lüdtke',
  description: 'Learning in Public – Das Leben ist kein Highlight-Reel, sondern ein Prozess. Meine Geschichte, Skills und Projekte als Software Engineer.',
};

export default function UeberMichPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="mb-8">
          <div className="h-32 w-32 mx-auto rounded-full overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700 mb-6">
            <Image 
              src="/profile.jpg" 
              alt="Timothy Lüdtke" 
              width={200} 
              height={200} 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Learning in Public
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Das Leben ist kein Highlight-Reel, sondern ein Prozess. Hier teile ich meine 
          Gedanken, Projekte und Lernreise – nicht perfekt, aber ehrlich. Denn echter 
          Fortschritt entsteht nicht im Verborgenen, sondern in der Offenheit des Lernens.
        </p>
      </section>

      {/* Story Section */}
      <section className="mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Meine Story & Motivation
          </h2>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Alles begann mit einem Uni-Projekt namens <strong>&ldquo;Wunschnest&rdquo;</strong> – einer Plattform, 
              die Menschen dabei helfen sollte, ihre Träume in greifbare Ziele zu verwandeln. 
              Zum ersten Mal setzte ich ein echtes Projekt von Anfang bis Ende um, machte 
              Fortschritte sichtbar und lernte dabei eine wichtige Lektion: 
            </p>
            
            <blockquote className="border-l-4 border-blue-500 pl-6 italic text-lg">
              &ldquo;Öffentliches Lernen gibt Struktur – es macht aus vagen Ideen konkrete Schritte.&rdquo;
            </blockquote>
            
            <p>
              Diese Erfahrung prägt mich bis heute. Genau wie meine Liebe zum Tagebuchschreiben: 
              <em>&ldquo;An diesem Tag&hellip;&rdquo;</em> – jeder Eintrag ist ein kleiner Baustein, jede Reflexion 
              ein Schritt vorwärts. Mein Ziel ist es, andere zum Nachdenken anzuregen und zu 
              zeigen, dass echte Entwicklung in der Transparenz des Lernprozesses liegt.
            </p>
            
            <p>
              Heute arbeite ich als Software Engineer mit Fokus auf interaktive Bildung, 
              Visualisierungen und KI-gestützte Inhalte. Jeden Tag lerne ich etwas Neues – 
              und hier dokumentiere ich diese Reise.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Bento Grid */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Skills & Lernfelder
        </h2>
        
        <BentoGrid>
          <BentoCard
            title="Coding & Tech"
            description="Von Next.js und React über Python bis hin zu Datenbank-Design – ich liebe es, Ideen in funktionierenden Code zu verwandeln. TypeScript ist mein treuer Begleiter für typsichere Entwicklung."
            icon={Code}
            size="large"
          >
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                Next.js
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                TypeScript
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                Python
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                PostgreSQL
              </span>
            </div>
          </BentoCard>

          <BentoCard
            title="Kommunikation"
            description="Komplexe Ideen einfach erklären – das ist meine Leidenschaft. Ob in Blogposts, Präsentationen oder direkten Gesprächen, ich finde die richtigen Worte."
            icon={MessageCircle}
            size="medium"
          />

          <BentoCard
            title="Kreativität & Design"
            description="UI/UX Design mit Fokus auf Benutzerfreundlichkeit. Tailwind CSS ist mein Werkzeug der Wahl für saubere, responsive Designs."
            icon={Palette}
            size="medium"
          />

          <BentoCard
            title="Wissenschaft"
            description="Systematisches Denken und datengetriebene Entscheidungen aus meinem wissenschaftlichen Hintergrund."
            icon={Microscope}
            size="small"
          />

          <BentoCard
            title="Fotografie"
            description="Die Welt durch die Linse betrachten – ein Blick für Details und Komposition."
            icon={Camera}
            size="small"
          />

          <BentoCard
            title="Projektmanagement"
            description="Von der Idee zur Umsetzung – strukturiert und zielorientiert arbeiten."
            icon={Target}
            size="small"
          />
        </BentoGrid>
      </section>

      {/* Projects Section */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Projekte & Links
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Fotografie
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Meine fotografischen Arbeiten und visuellen Geschichten.
            </p>
            <Link 
              href="#" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Zur Fotografie-Seite <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Blog & Gedanken
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Meine Lernreise, Reflexionen und technische Erkenntnisse.
            </p>
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Zum Blog <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Wunschnest
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Das Projekt, das alles ins Rollen brachte – eine Plattform für Träume und Ziele.
            </p>
            <Link 
              href="#" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mehr erfahren <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              #inProgress
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aktuelle Projekte und Experimente – live dokumentiert.
            </p>
            <Link 
              href="/blog?tag=inProgress" 
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Laufende Projekte <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Lust auf Zusammenarbeit?
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Ob für spannende Projekte, gemeinsame Lernreisen oder einfach einen 
            inspirierenden Austausch – ich freue mich auf deine Nachricht!
          </p>
          
          <Link 
            href="mailto:hallo@tgz.lol"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200"
          >
            <Mail className="w-5 h-5" />
            hallo@tgz.lol
          </Link>
        </div>
      </section>
    </div>
  );
}