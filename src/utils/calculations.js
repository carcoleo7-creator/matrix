/**
 * Severity matrix discount rules:
 *   Low (1):        0% (apology only)
 *   Low (2+):       10%
 *   Medium (1):     10%
 *   Medium (2+):    20%
 *   High (1):       20%
 *   High (2+):      50%
 */

export const SEVERITY_RULES = {
  Low:    { single: 0,  multiple: 10 },
  Medium: { single: 10, multiple: 20 },
  High:   { single: 20, multiple: 50 },
};

/**
 * @param {Array<{id: string, name: string, severity: 'Low'|'Medium'|'High'}>} issues
 * @param {number} subtotal
 * @returns {{
 *   subtotal: number,
 *   breakdown: Array<{severity: string, count: number, pct: number, amount: number}>,
 *   totalPct: number,
 *   totalDiscount: number,
 *   finalAmount: number,
 * }}
 */
export function calculateDiscount(issues, subtotal) {
  const counts = { Low: 0, Medium: 0, High: 0 };
  issues.forEach(({ severity }) => {
    if (severity in counts) counts[severity] += 1;
  });

  const breakdown = [];

  for (const severity of ['Low', 'Medium', 'High']) {
    const count = counts[severity];
    if (count === 0) continue;
    const rule = SEVERITY_RULES[severity];
    const pct = count >= 2 ? rule.multiple : rule.single;
    if (pct === 0) continue; // single Low = apology only, no monetary discount row
    breakdown.push({ severity, count, pct, amount: Math.round((subtotal * pct) / 100 * 100) / 100 });
  }

  const totalPct = breakdown.reduce((sum, b) => sum + b.pct, 0);
  const totalDiscount = Math.round((subtotal * totalPct) / 100 * 100) / 100;
  const finalAmount = Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);

  return { subtotal, breakdown, totalPct, totalDiscount, finalAmount };
}
