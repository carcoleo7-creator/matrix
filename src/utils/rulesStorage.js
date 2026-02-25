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

// ---------------------------------------------------------------------------
// Password protection
// SHA-256 of "admin" — used when no custom password has been set yet.
// ---------------------------------------------------------------------------
const PASSWORD_KEY  = 'comp_rules_password_hash';
const DEFAULT_HASH  = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

async function _sha256(text) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getPasswordHash() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_HASH;
}

/** Returns true if `password` matches the stored hash. */
export async function verifyPassword(password) {
  return (await _sha256(password)) === getPasswordHash();
}

/** Hashes and persists a new password. */
export async function setPassword(newPassword) {
  localStorage.setItem(PASSWORD_KEY, await _sha256(newPassword));
}

/** True when a custom password has been saved (i.e. not relying on the default). */
export function hasCustomPassword() {
  return !!localStorage.getItem(PASSWORD_KEY);
}

// ---------------------------------------------------------------------------

/** Restore a snapshot by id. Saves the current rules as a new snapshot first. */
export function restoreSnapshot(snapshotId) {
  const snap = getHistory().find((s) => s.id === snapshotId);
  if (!snap) return false;
  saveRules(snap.rules, {
    description: `Restored snapshot from ${new Date(snap.timestamp).toLocaleString()}`,
  });
  return true;
}
