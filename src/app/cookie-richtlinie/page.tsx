import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie-Richtlinie - Timothy Lüdtke',
  description: 'Informationen über die Verwendung von Cookies auf der Website von Timothy Lüdtke.',
  robots: 'noindex, nofollow'
};

export default function CookieRichtliniePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Cookie-Richtlinie
        </h1>
        
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          
          {/* Gute Nachricht */}
          <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">🍪 Gute Nachricht!</h2>
            <div className="space-y-3 text-sm text-green-800 dark:text-green-200 leading-relaxed">
              <p className="text-lg font-medium">
                Diese Website verwendet KEINE Cookies!
              </p>
              <p>
                Ich verzichte bewusst auf den Einsatz von Cookies, um Ihre Privatsphäre 
                zu schützen und eine bessere Nutzererfahrung zu bieten. Sie müssen daher auch keinen 
                Cookie-Banner akzeptieren.
              </p>
            </div>
          </section>

          {/* Was bedeutet das */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">✨ Was bedeutet das für Sie?</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm leading-relaxed">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔒 Maximum Privacy</h3>
                <p className="text-blue-800 dark:text-blue-200">
                  Keine Tracking-Cookies, keine Werbecookies, keine versteckten Datensammler. 
                  Ihre Privatsphäre ist mir wichtig.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">⚡ Schnellere Website</h3>
                <p className="text-purple-800 dark:text-purple-200">
                  Ohne Cookie-Banner und Tracking-Skripte lädt die Website schneller 
                  und bietet eine bessere Nutzererfahrung.
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">🎯 DSGVO-konform</h3>
                <p className="text-orange-800 dark:text-orange-200">
                  Automatisch DSGVO-konform, da keine personenbezogenen Daten über 
                  Cookies gespeichert werden.
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <h3 className="font-medium text-teal-900 dark:text-teal-100 mb-2">🚫 Kein Banner-Spam</h3>
                <p className="text-teal-800 dark:text-teal-200">
                  Keine nervigen Cookie-Banner, die Ihre Aufmerksamkeit von den 
                  technischen Inhalten ablenken.
                </p>
              </div>
            </div>
          </section>

          {/* Analytics ohne Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📊 Website-Analyse ohne Cookies</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Für die Verbesserung der Website verwende ich <strong>Plausible Analytics</strong> – 
                eine datenschutzfreundliche Alternative zu Google Analytics.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-3">🌟 Warum Plausible Analytics?</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
                  <li><strong>100% cookiefrei</strong> – verwendet keine Cookies</li>
                  <li><strong>Anonyme Daten</strong> – keine persönliche Identifikation möglich</li>
                  <li><strong>DSGVO-konform</strong> – erfüllt alle europäischen Datenschutzstandards</li>
                  <li><strong>Selbst gehostet</strong> – läuft auf eigenen Servern</li>
                  <li><strong>Open Source</strong> – transparente und vertrauenswürdige Software</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📈 Was wird erfasst?</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-2">Alle Daten werden vollständig anonymisiert erfasst:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Seitenaufrufe und Verweildauer</li>
                  <li>Referrer-Websites (woher Besucher kommen)</li>
                  <li>Land/Region (nicht exakte Standorte)</li>
                  <li>Gerätetyp und Browser (ohne eindeutige Kennungen)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technische Details */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">🔧 Technische Details</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Session Storage</h3>
                <p>
                  Diese Website verwendet nur technisch notwendige Session Storage-Daten für 
                  die grundlegende Funktionalität (z.B. Formular-Zustand). Diese werden 
                  automatisch gelöscht, wenn Sie Ihren Browser schließen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Local Storage</h3>
                <p>
                  Es werden minimale Local Storage-Daten nur für die Benutzerfreundlichkeit 
                  verwendet (z.B. Dark/Light Mode-Einstellung). Diese enthalten keine 
                  persönlichen Daten und dienen ausschließlich der besseren Nutzererfahrung.
                </p>
              </div>
            </div>
          </section>

          {/* Externe Dienste */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">🌐 Externe Dienste</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Hosting & Services</h3>
                <div className="text-yellow-800 dark:text-yellow-200 space-y-2">
                  <p><strong>Vercel (EU/Deutschland):</strong> Website-Hosting und CDN</p>
                  <p><strong>GitHub:</strong> Code-Repository (nur für Entwicklungszwecke)</p>
                  <p className="text-xs">
                    Diese Dienste können grundlegende Server-Logs für Sicherheit und Performance führen, 
                    verwenden aber keine Tracking-Cookies.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Browser-Einstellungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">🔧 Browser-Einstellungen</h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Da keine Cookies verwendet werden, müssen Sie keine speziellen Browser-Einstellungen vornehmen. 
                Ihre Standard-Datenschutzeinstellungen reichen vollkommen aus.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">💡 Empfehlung für maximale Privatsphäre:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  <li>Verwenden Sie einen aktuellen Browser mit aktivierten Datenschutzfunktionen</li>
                  <li>Aktivieren Sie &quot;Do Not Track&quot; in Ihren Browser-Einstellungen</li>
                  <li>Verwenden Sie Browsererweiterungen wie uBlock Origin für zusätzlichen Schutz</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📝 Änderungen dieser Richtlinie</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Sollten in Zukunft doch Cookies eingesetzt werden müssen, werde ich:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Sie vorab über Änderungen informieren</li>
                <li>Ihre explizite Einwilligung einholen</li>
                <li>Diese Cookie-Richtlinie entsprechend aktualisieren</li>
                <li>Transparente Opt-out-Möglichkeiten anbieten</li>
              </ul>
            </div>
          </section>

          {/* Kontakt */}
          <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">📞 Fragen zur Cookie-Richtlinie?</h2>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
              <p>
                Haben Sie Fragen zur cookiefreien Website oder zum Datenschutz? 
                Ich erkläre Ihnen gerne alle Details:
              </p>
              <div>
                <p><strong>E-Mail:</strong> hallo@tgz.lol</p>
                <p><strong>Telefon:</strong> +49 (0) 151 68104955</p>
              </div>
            </div>
          </section>

          {/* Zusammenfassung */}
          <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">🎯 Zusammenfassung</h2>
            <div className="text-sm text-green-800 dark:text-green-200 space-y-3">
              <p className="font-medium">
                Diese Website ist stolz darauf, 100% cookiefrei zu sein!
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>✅ Keine Cookies = keine Einverständniserklärung nötig</li>
                <li>✅ Anonyme, DSGVO-konforme Analytics mit Plausible</li>
                <li>✅ Maximaler Datenschutz ohne Kompromisse</li>
                <li>✅ Bessere Performance und Nutzererfahrung</li>
                <li>✅ Fokus auf technische Inhalte ohne Ablenkung</li>
              </ul>
            </div>
          </section>

          <section className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p>
              Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })} | 
              Letzte Aktualisierung: Bei Änderungen werden Sie informiert
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}