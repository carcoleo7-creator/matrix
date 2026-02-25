/**
 * Rules Engine — evaluates a list of rule objects against a context object.
 *
 * Rule schema:
 * {
 *   id:          string,
 *   name:        string,
 *   description: string,
 *   enabled:     boolean,
 *   priority:    number,          // lower = higher priority; first match wins per group
 *   condition: {
 *     logic:      'AND' | 'OR',
 *     conditions: Array<{ field: string, op: string, value: any }>
 *   },
 *   action: { discountPercent: number },
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 * }
 *
 * Evaluation context per severity group:
 *   { severity: 'Low'|'Medium'|'High', count: number, subtotal: number }
 */

function evalLeaf({ field, op, value }, ctx) {
  const actual = ctx[field];
  if (actual === undefined) return false;
  switch (op) {
    case 'eq':     return actual === value;
    case 'neq':    return actual !== value;
    case 'gt':     return Number(actual) > Number(value);
    case 'gte':    return Number(actual) >= Number(value);
    case 'lt':     return Number(actual) < Number(value);
    case 'lte':    return Number(actual) <= Number(value);
    case 'in':     return Array.isArray(value) && value.includes(actual);
    case 'not_in': return Array.isArray(value) && !value.includes(actual);
    default:       return false;
  }
}

function evalCondition(condition, ctx) {
  if (condition.logic) {
    const results = condition.conditions.map((c) => evalCondition(c, ctx));
    return condition.logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  }
  return evalLeaf(condition, ctx);
}

/** Returns all enabled rules that match ctx, sorted by priority ascending. */
export function evaluateRules(rules, ctx) {
  return rules
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority)
    .filter((rule) => evalCondition(rule.condition, ctx));
}

/** Returns the discountPercent of the first matching rule, or 0. */
export function getDiscountPercent(rules, ctx) {
  const matches = evaluateRules(rules, ctx);
  return matches.length > 0 ? matches[0].action.discountPercent : 0;
}

/**
 * Full calculation — replaces calculateDiscount from calculations.js.
 * Returns the same shape DiscountResults expects:
 * { subtotal, breakdown, totalPct, totalDiscount, finalAmount }
 */
export function calculateWithRules(rules, issues, subtotal) {
  if (!subtotal || !issues.length) {
    return {
      subtotal: subtotal || 0,
      breakdown: [],
      totalPct: 0,
      totalDiscount: 0,
      finalAmount: subtotal || 0,
    };
  }

  // Count issues by severity
  const counts = {};
  for (const issue of issues) {
    counts[issue.severity] = (counts[issue.severity] || 0) + 1;
  }

  const breakdown = [];
  let totalDiscount = 0;

  for (const [severity, count] of Object.entries(counts)) {
    const ctx = { severity, count, subtotal };
    const pct = getDiscountPercent(rules, ctx);
    const amount = Math.round((pct / 100) * subtotal * 100) / 100;
    if (pct > 0) breakdown.push({ severity, count, pct, amount });
    totalDiscount += amount;
  }

  totalDiscount = Math.round(Math.min(totalDiscount, subtotal) * 100) / 100;
  const finalAmount = Math.round(Math.max(0, subtotal - totalDiscount) * 100) / 100;
  const totalPct = subtotal > 0 ? Math.round((totalDiscount / subtotal) * 10000) / 100 : 0;

  return { subtotal, breakdown, totalPct, totalDiscount, finalAmount };
}
