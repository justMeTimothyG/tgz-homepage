import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Code, 
  MessageCircle, 
  Palette, 
  Camera, 
  ExternalLink,
  Mail,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  NextJSLogo, 
  ReactLogo, 
  TypeScriptLogo, 
  PostgreSQLLogo, 
  TailwindLogo, 
  NodeJSLogo, 
  DockerLogo 
} from '@/components/TechLogos';

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
              Heute studiere ich Wirtschaftsingenieurwesen und versuche, meine technischen Fähigkeiten weiter auszubauen.
              Ich bin fasziniert von den Möglichkeiten, die moderne Technologien bieten – Es war noch nie so einfach neue Dinge zu lernen und umzusetzen.
            </p>
          </div>
        </div>
      </section>

      {/* Skills Bento Grid */}
      <section className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
          Skills & Lernfelder
        </h2>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Tech Skills Card */}
              <div className="md:col-span-2 group relative flex flex-col gap-4 h-full rounded-xl p-6 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-out">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Coding & Tech Stack
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Von Next.js und React bis hin zu Datenbank-Design – ich liebe es, Ideen in funktionierenden Code zu verwandeln. TypeScript ist mein treuer Begleiter für typsichere Entwicklung.
                  </p>
                  
                  {/* Technology Logos Grid */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <NextJSLogo className="w-8 h-8 text-gray-900 dark:text-gray-100" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">Next.js</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <ReactLogo className="w-8 h-8 text-blue-500" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">React</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <TypeScriptLogo className="w-8 h-8 text-blue-600" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">TypeScript</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <PostgreSQLLogo className="w-8 h-8 text-blue-700" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">PostgreSQL</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <TailwindLogo className="w-8 h-8 text-teal-500" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">Tailwind</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <NodeJSLogo className="w-8 h-8 text-green-600" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">Node.js</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group/tech transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
                      <DockerLogo className="w-8 h-8 text-blue-500" />
                      <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200">Docker</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Journey */}
              <div className="group relative flex flex-col gap-4 h-full rounded-xl p-6 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-out">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Lernreise
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Kontinuierliches Lernen und Wachstum durch Projekte und schierer Neugier. Es gibt noch so vieles was ich lernen möchte.
                </p>
                
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">CAD Modelierung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Elektronik und Löten</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">日本語 - Japanisch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">3D Druck</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Communication */}
              <div className="group relative flex flex-col gap-4 h-full rounded-xl p-6 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-out">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Kommunikation
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Komplexe Ideen einfach erklären – das ist meine Leidenschaft. Ob in Blogposts, Präsentationen oder direkten Gesprächen.
                </p>
              </div>

              {/* Design & Creativity */}
              <div className="group relative flex flex-col gap-4 h-full rounded-xl p-6 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-out">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Design & UX
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  UI/UX Design mit Fokus auf Benutzerfreundlichkeit und ästhetische, intuitive Interfaces.
                </p>
              </div>

              {/* Photography */}
              <div className="group relative flex flex-col gap-4 h-full rounded-xl p-6 bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30 dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 ease-out">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Camera className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Fotografie
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Die Welt durch die Linse betrachten – ein Blick für Details, Komposition und visuelles Storytelling.
                </p>
              </div>
            </div>
          </div>
        </div>
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
              href="https://blickfangemsland.de" 
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
              href="https://github.com/justMeTimothyG/WiSe-24_25-Grundzuege-der-Wirtschaftsinformatik-Wunschnest/tree/master" 
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