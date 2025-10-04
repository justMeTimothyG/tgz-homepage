import React from 'react';

export type BookingSide = 'S' | 'H';

export type KontoType =
  | 'aktiv'
  | 'passiv'
  | 'aufwandskonto'
  | 'aufwand'
  | 'ertragskonto'
  | 'ertrag'
  | 'guv';

export type Booking = [number, BookingSide];
export type InitialBooking = [number, BookingSide | null];

export interface TAccountData {
  title: string;
  initValue: InitialBooking;
  type: KontoType;
  bookings: Booking[];
}

interface TAccountProps {
  account: TAccountData;
  className?: string;
}

const numberFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmountParts(value: number) {
  const [integerPart, decimalPart] = numberFormatter.format(value).split(',');
  return {
    integerPart,
    decimalPart: decimalPart ?? '00',
  };
}

function Amount({ value }: { value: number }) {
  const { integerPart, decimalPart } = formatAmountParts(value);
  const decimals = decimalPart === '00' ? '--' : decimalPart;
  return (
    <span className="tabular-nums">
      {integerPart}
      <span className="opacity-70">,{decimals}</span>
    </span>
  );
}

function computeSaldoSign(type: KontoType, difference: number) {
  if (difference === 0) return 'neutral';

  const category = (() => {
    switch (type) {
      case 'aktiv':
      case 'aufwandskonto':
      case 'aufwand':
        return 'debit';
      case 'passiv':
      case 'ertragskonto':
      case 'ertrag':
      case 'guv':
      default:
        return 'credit';
    }
  })();

  const isPositive = category === 'debit' ? difference > 0 : difference < 0;
  return isPositive ? 'positive' : 'negative';
}

export default function TAccount({ account, className = '' }: TAccountProps) {
  const { title, initValue, type, bookings } = account;

  const [initialAmount, initialSide] = initValue;

  const sumSFromBookings = bookings.reduce((acc, [amount, side]) => (side === 'S' ? acc + amount : acc), 0);
  const sumHFromBookings = bookings.reduce((acc, [amount, side]) => (side === 'H' ? acc + amount : acc), 0);

  const sumS = (initialSide === 'S' ? initialAmount : 0) + sumSFromBookings;
  const sumH = (initialSide === 'H' ? initialAmount : 0) + sumHFromBookings;

  const difference = sumS - sumH;
  const saldoAmount = Math.abs(difference);
  const saldoSide = saldoAmount === 0 ? null : difference > 0 ? 'H' : 'S';
  const saldoSign = computeSaldoSign(type, difference);

  const totalS = sumS + (saldoSide === 'S' ? saldoAmount : 0);
  const totalH = sumH + (saldoSide === 'H' ? saldoAmount : 0);

  const highlightBase = 'rounded-md border px-3 py-2 text-sm';
  const abStyles = `${highlightBase} border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-200`;
  const saldoStylesBase = `${highlightBase} font-medium`;
  const saldoStyles = saldoSign === 'positive'
    ? `${saldoStylesBase} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200`
    : saldoSign === 'negative'
      ? `${saldoStylesBase} border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200`
      : `${saldoStylesBase} border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-600/60 dark:bg-gray-700/40 dark:text-gray-200`;

  const renderEntries = (side: BookingSide) => {
    const items: React.ReactNode[] = [];

    if (initialSide === side) {
      items.push(
        <div key="init" className={`${abStyles} -mx-3`}>
          <div className="flex justify-between">
            <span className="font-semibold">AB</span>
            <Amount value={initialAmount} />
          </div>
        </div>
      );
    }

    bookings.forEach(([amount, bookingSide], index) => {
      if (bookingSide === side) {
        items.push(
          <div key={`booking-${side}-${index}`} className="flex justify-end text-right text-sm text-gray-800 dark:text-gray-200">
            <Amount value={amount} />
          </div>
        );
      }
    });

    return items;
  };

  const renderSaldo = (side: BookingSide) => {
    if (saldoSide !== side || saldoAmount === 0) return null;

    return (
      <div className={`${saldoStyles} -mx-3`}>
        <div className="flex justify-between">
          <span>Saldo</span>
          <Amount value={saldoAmount} />
        </div>
      </div>
    );
  };

  return (
    <div className={`not-prose my-6 ${className}`}>
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 text-xs font-semibold tracking-wide text-gray-600 dark:border-gray-700 dark:text-gray-300">
          <span className="uppercase">Soll</span>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          <span className="uppercase">Haben</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          <div className="space-y-2 px-6 py-4">
            {renderEntries('S')}
            {renderSaldo('S')}
          </div>
          <div className="space-y-2 px-6 py-4">
            {renderEntries('H')}
            {renderSaldo('H')}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-gray-200 text-sm dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Summe
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                <Amount value={totalS} />
              </span>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Summe
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                <Amount value={totalH} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
