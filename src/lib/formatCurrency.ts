/** Format amount in Omani Rials (OMR) */
export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return '﷼0';
  return `﷼${n.toLocaleString('en-OM', { maximumFractionDigits: 0 })}`;
}

export const FREE_SHIPPING_MIN_INR = 999;
