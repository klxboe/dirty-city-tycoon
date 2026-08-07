// Große Zahlen kurz und lesbar darstellen (deutsches Format): 1500 -> "1,5k", 2300000 -> "2,3 Mio".

const UNITS: Array<[threshold: number, divisor: number, suffix: string]> = [
  [1_000_000_000, 1_000_000_000, ' Mrd'],
  [1_000_000, 1_000_000, ' Mio'],
  [1_000, 1_000, 'k'],
];

export function formatNumber(value: number): string {
  const rounded = Math.floor(Math.max(0, value));

  for (const [threshold, divisor, suffix] of UNITS) {
    if (rounded >= threshold) {
      const short = rounded / divisor;
      const text = short < 10 ? short.toFixed(1).replace('.', ',') : Math.round(short).toString();
      return `${text}${suffix}`;
    }
  }

  return rounded.toLocaleString('de-DE');
}

export function formatPercent(value: number): string {
  return `${Math.floor(Math.min(1, Math.max(0, value)) * 100)}%`;
}

/** Für feste Effekt-Werte wie "+1,5 Müll/s", die im Gegensatz zu Geldbeträgen ihre Nachkommastelle behalten sollen. */
export function formatRate(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
