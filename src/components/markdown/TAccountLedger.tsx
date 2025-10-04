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
  privat: 2,
  aufwandskonto: 3,
  aufwand: 3,
  ertragskonto: 4,
  ertrag: 4,
  guv: 5,
};

const typeLabelMap: Record<KontoType, string> = {
  aktiv: 'Aktivkonten',
  passiv: 'Passivkonten',
  privat: 'Privatkonten',
  aufwandskonto: 'Aufwandskonten',
  aufwand: 'Aufwandkonten',
  ertragskonto: 'Ertragskonten',
  ertrag: 'Ertragskonten',
  guv: 'GuV-Konten',
};

interface StructuredGroup {
  type: KontoType;
  accounts: TAccountData[];
}

function getTypeLabel(type: KontoType) {
  return typeLabelMap[type] ?? type;
}

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
  const { structuredGroups, warnings } = useMemo(() => {
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

    const accountsByType = new Map<KontoType, TAccountData[]>();
    const typeFirstEncounterIndex = new Map<KontoType, number>();

    data.accounts.forEach((accountConfig, index) => {
      const account = map.get(accountConfig.title);
      if (!account) return;

      if (!accountsByType.has(account.type)) {
        accountsByType.set(account.type, []);
        typeFirstEncounterIndex.set(account.type, index);
      }

      accountsByType.get(account.type)!.push(account);
    });

    const structuredGroups: StructuredGroup[] = Array.from(accountsByType.entries())
      .sort(([typeA], [typeB]) => {
        const weightDiff = typeSortWeight[typeA] - typeSortWeight[typeB];
        if (weightDiff !== 0) return weightDiff;
        return (
          (typeFirstEncounterIndex.get(typeA) ?? 0) - (typeFirstEncounterIndex.get(typeB) ?? 0)
        );
      })
      .map(([type, accounts]) => ({ type, accounts }));

    const warningMessages = Array.from(missingAccounts).map(
      (name) => `Konto: ${name} wurde nicht definiert`
    );

    return {
      structuredGroups,
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

      {structuredGroups.map(({ type, accounts }) => (
        <section key={type} className="mb-10 last:mb-0">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            {getTypeLabel(type)}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {accounts.map((account) => (
              <TAccount key={account.title} account={account} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
