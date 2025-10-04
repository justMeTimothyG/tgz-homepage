import React, { useMemo } from 'react';

import TAccount, { Booking, InitialBooking, KontoType, TAccountData } from './TAccount';

type LedgerBooking = [string, string, number];

interface LedgerAccountConfig {
  title: string;
  type: KontoType;
  initValue: InitialBooking;
}

interface LedgerData {
  accounts: LedgerAccountConfig[];
  bookings: LedgerBooking[];
}

interface TAccountLedgerProps {
  data: LedgerData;
  className?: string;
}

const typeSortWeight: Record<KontoType, number> = {
  aktiv: 0,
  passiv: 1,
  aufwandskonto: 2,
  aufwand: 2,
  ertragskonto: 3,
  ertrag: 3,
  guv: 4,
};

function normalizeAccounts(config: LedgerAccountConfig[]) {
  const map = new Map<string, TAccountData>();

  config.forEach((account) => {
    map.set(account.title, {
      title: account.title,
      type: account.type,
      initValue: account.initValue,
      bookings: [],
    });
  });

  return map;
}

export default function TAccountLedger({ data, className = '' }: TAccountLedgerProps) {
  const { structuredAccounts, warnings } = useMemo(() => {
    const map = normalizeAccounts(data.accounts);
    const missingAccounts = new Set<string>();

    data.bookings.forEach(([debit, credit, amount]) => {
      const debitAccount = map.get(debit);
      if (debitAccount) {
        debitAccount.bookings.push([amount, 'S']);
      } else {
        missingAccounts.add(debit);
      }

      const creditAccount = map.get(credit);
      if (creditAccount) {
        creditAccount.bookings.push([amount, 'H']);
      } else {
        missingAccounts.add(credit);
      }
    });

    const accounts = Array.from(map.values()).sort((a, b) => {
      const typeDiff = typeSortWeight[a.type] - typeSortWeight[b.type];
      if (typeDiff !== 0) return typeDiff;
      return a.title.localeCompare(b.title, 'de', { sensitivity: 'base' });
    });

    const warningMessages = Array.from(missingAccounts).map(
      (name) => `Konto: ${name} wurde nicht definiert`
    );

    return {
      structuredAccounts: accounts,
      warnings: warningMessages,
    };
  }, [data.accounts, data.bookings]);

  return (
    <div className={`not-prose my-8 ${className}`}>
      {warnings.length > 0 && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <ul className="list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {structuredAccounts.map((account) => (
          <TAccount key={account.title} account={account} />
        ))}
      </div>
    </div>
  );
}
