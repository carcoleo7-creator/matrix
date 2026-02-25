/**
 * Rules validator — schema constants + validation logic.
 * Used by RuleEditor to show inline errors and warnings.
 */

export const FIELDS = [
  { id: 'severity', label: 'Severity',     type: 'enum',   options: ['Low', 'Medium', 'High'] },
  { id: 'count',    label: 'Issue Count',  type: 'number' },
  { id: 'subtotal', label: 'Subtotal ($)', type: 'number' },
];

export const OPERATORS = {
  enum: [
    { id: 'eq',     label: '=' },
    { id: 'neq',    label: '≠' },
    { id: 'in',     label: 'in' },
    { id: 'not_in', label: 'not in' },
  ],
  number: [
    { id: 'eq',  label: '=' },
    { id: 'neq', label: '≠' },
    { id: 'gt',  label: '>' },
    { id: 'gte', label: '≥' },
    { id: 'lt',  label: '<' },
    { id: 'lte', label: '≤' },
  ],
};

/**
 * Validates a rule object.
 * @param {object} rule        - The rule being validated.
 * @param {object[]} allRules  - All existing rules (for conflict detection).
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateRule(rule, allRules = []) {
  const errors   = [];
  const warnings = [];

  // Name
  if (!rule.name?.trim()) {
    errors.push('Name is required.');
  }

  // Priority
  const pri = Number(rule.priority);
  if (isNaN(pri) || pri < 1 || !Number.isInteger(pri)) {
    errors.push('Priority must be a positive integer.');
  }

  // Discount %
  const pct = Number(rule.action?.discountPercent);
  if (isNaN(pct)) {
    errors.push('Discount % must be a number.');
  } else if (pct < 0 || pct > 100) {
    errors.push('Discount % must be between 0 and 100.');
  }

  // Conditions
  const conds = rule.condition?.conditions ?? [];
  if (conds.length === 0) {
    errors.push('At least one condition is required.');
  }
  conds.forEach((c, i) => {
    const num = i + 1;
    if (!c.field) errors.push(`Condition ${num}: field is required.`);
    if (!c.op)    errors.push(`Condition ${num}: operator is required.`);
    if (c.value === '' || c.value == null) errors.push(`Condition ${num}: value is required.`);
  });

  // Priority conflict warning
  if (!isNaN(pri)) {
    const conflicts = allRules.filter(
      (r) => r.id !== rule.id && Number(r.priority) === pri && r.enabled && rule.enabled,
    );
    conflicts.forEach((c) => {
      warnings.push(
        `Priority ${pri} is already used by "${c.name}". The first rule in priority order wins.`,
      );
    });
  }

  return { errors, warnings };
}
