/**
 * Rules storage — persists rules + version history in localStorage.
 * History is auto-snapshotted before every save (max 30 snapshots).
 */

const RULES_KEY   = 'comp_rules_v1';
const HISTORY_KEY = 'comp_rules_history_v1';

// ---------------------------------------------------------------------------
// Default rules — mirrors the original SEVERITY_RULES from calculations.js
// ---------------------------------------------------------------------------
function buildDefaults() {
  const now = new Date().toISOString();
  const make = (id, name, description, priority, severityVal, countOp, countVal, pct) => ({
    id,
    name,
    description,
    enabled: true,
    priority,
    condition: {
      logic: 'AND',
      conditions: [
        { field: 'severity', op: 'eq',   value: severityVal },
        { field: 'count',    op: countOp, value: countVal   },
      ],
    },
    action: { discountPercent: pct },
    createdAt: now,
    updatedAt: now,
  });

  return [
    make('def-1', 'Low – single',          'No discount for a single Low issue',         10, 'Low',    'eq',  1, 0),
    make('def-2', 'Low – multiple',         '10% discount for 2+ Low issues',             20, 'Low',    'gte', 2, 10),
    make('def-3', 'Medium – single',        '10% discount for a single Medium issue',     30, 'Medium', 'eq',  1, 10),
    make('def-4', 'Medium – multiple',      '20% discount for 2+ Medium issues',          40, 'Medium', 'gte', 2, 20),
    make('def-5', 'High – single',          '20% discount for a single High issue',       50, 'High',   'eq',  1, 20),
    make('def-6', 'High – multiple',        '50% discount for 2+ High issues',            60, 'High',   'gte', 2, 50),
  ];
}

export const DEFAULT_RULES = buildDefaults();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------
export function getRules() {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    return raw ? JSON.parse(raw) : buildDefaults();
  } catch {
    return buildDefaults();
  }
}

export function saveRules(rules, meta = {}) {
  _snapshot(getRules(), meta);
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function resetToDefaults() {
  saveRules(buildDefaults(), { description: 'Reset to defaults' });
}

// ---------------------------------------------------------------------------
// Version history
// ---------------------------------------------------------------------------
export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function _snapshot(rules, meta) {
  const history = getHistory();
  history.unshift({
    id:          crypto.randomUUID(),
    rules:       JSON.parse(JSON.stringify(rules)),
    timestamp:   new Date().toISOString(),
    author:      meta.author      || 'Admin',
    description: meta.description || 'Rules updated',
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}

/** Restore a snapshot by id. Saves the current rules as a new snapshot first. */
export function restoreSnapshot(snapshotId) {
  const snap = getHistory().find((s) => s.id === snapshotId);
  if (!snap) return false;
  saveRules(snap.rules, {
    description: `Restored snapshot from ${new Date(snap.timestamp).toLocaleString()}`,
  });
  return true;
}
