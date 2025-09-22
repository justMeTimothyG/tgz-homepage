import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum - Timothy Lüdtke',
  description: 'Impressum und Kontaktdaten von Timothy Lüdtke - Software Engineer.',
  robots: 'noindex, nofollow'
};

export default function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Impressum
        </h1>
        
        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Angaben gemäß § 5 TMG
            </h2>

            <div className="space-y-2">
              <p className="font-medium">Timothy Lüdtke</p>
              <p>Kaiserstr. 7B</p>
              <p>49809 Lingen</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Kontakt
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Telefon:</span> +49 (0) 173 4501637
              </p>
              <p>
                <span className="font-medium">E-Mail:</span> hallo@tgz.lol
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <div className="space-y-2">
              <p>Timothy Lüdtke</p>
              <p>Kaiserstr. 7B</p>
              <p>49809 Lingen</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Haftungsausschluss
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Haftung für Inhalte
                </h3>
                <p className="text-sm leading-relaxed">
                  Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                  allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht 
                  unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
                  Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
                  Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
                  der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
                  Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Haftung für Links
                </h3>
                <p className="text-sm leading-relaxed">
                  Mein Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte ich keinen Einfluss habe. 
                  Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
                  Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten 
                  wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren 
                  zum Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte 
                  einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige 
                  Links umgehend entfernen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Urheberrecht
                </h3>
                <p className="text-sm leading-relaxed">
                  Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
                  Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
                  Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte 
                  Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem 
                  auf eine Urheberrechtsverletzung aufmerksam werden, bitte ich um einen entsprechenden Hinweis. 
                  Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Datenschutz
                </h3>
                <p className="text-sm leading-relaxed">
                  Diese Website wird als persönliche, nicht-kommerzielle Plattform für den Austausch von Wissen und 
                  Erfahrungen im Bereich Softwareentwicklung betrieben. Die Nutzung der Website erfolgt ohne 
                  Erhebung personenbezogener Daten, sofern nicht ausdrücklich auf entsprechende Datenverarbeitungen 
                  hingewiesen wird.
                </p>
              </div>
            </div>
          </section>

          <section className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p>Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}</p>
          </section>
        </div>
      </div>
    </div>
  );
}