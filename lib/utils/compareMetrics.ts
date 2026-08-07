export type MetricType = 'lower_is_better' | 'higher_is_better';

export function getWinnerIndex(values: (number | null | undefined)[], type: MetricType): number | null {
  let bestIndex = -1;
  let bestValue = type === 'lower_is_better' ? Infinity : -Infinity;

  values.forEach((val, index) => {
    if (val === null || val === undefined || isNaN(val)) return;
    if (type === 'lower_is_better' && val < bestValue) {
      bestValue = val;
      bestIndex = index;
    } else if (type === 'higher_is_better' && val > bestValue) {
      bestValue = val;
      bestIndex = index;
    }
  });

  // Check for ties
  const tieCount = values.filter(v => v === bestValue).length;
  if (tieCount > 1 || bestIndex === -1) return null;

  return bestIndex;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
