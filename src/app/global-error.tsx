"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-slate-100">
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-slate-400">Fehler</p>
          <h1 className="mt-2 text-6xl font-black">500</h1>
          <p className="mt-4 text-lg text-slate-300">Es ist ein unerwarteter Fehler aufgetreten.</p>
          {error.digest ? (
            <p className="mt-2 text-xs font-mono text-slate-500">Fehler-ID: {error.digest}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-700"
            >
              Noch einmal versuchen
            </button>
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
