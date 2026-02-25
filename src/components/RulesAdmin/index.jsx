import { useState } from 'react';
import { getRules, saveRules, getHistory, resetToDefaults, setPassword, verifyPassword } from '../../utils/rulesStorage.js';
import RulesList    from './RulesList.jsx';
import RuleEditor   from './RuleEditor.jsx';
import RulesTester  from './RulesTester.jsx';
import RulesHistory from './RulesHistory.jsx';

const TABS = ['rules', 'tester', 'history'];

// ---------------------------------------------------------------------------
// Change-password modal
// ---------------------------------------------------------------------------
function ChangePasswordModal({ onClose }) {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (next.length < 4) { setError('New password must be at least 4 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const ok = await verifyPassword(current);
    if (!ok) { setLoading(false); setError('Current password is incorrect.'); return; }
    await setPassword(next);
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center">
            <p className="text-green-700 font-medium text-sm">Password updated successfully.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
            {[
              { label: 'Current password', value: current, set: setCurrent },
              { label: 'New password',     value: next,    set: setNext    },
              { label: 'Confirm new',      value: confirm, set: setConfirm },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => { set(e.target.value); setError(''); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !current || !next || !confirm}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Saving…' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main admin panel
// ---------------------------------------------------------------------------
export default function RulesAdmin({ onRulesChange, onLock }) {
  const [rules,           setRules]           = useState(getRules);
  const [activeTab,       setActiveTab]       = useState('rules');
  const [editingRule,     setEditingRule]     = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);

  function applyRules(updated, meta) {
    saveRules(updated, meta);
    setRules(updated);
    onRulesChange?.(updated);
  }

  function handleToggle(id) {
    const rule    = rules.find((r) => r.id === id);
    const updated = rules.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r,
    );
    applyRules(updated, { description: `Toggled "${rule?.name}"` });
  }

  function handleDelete(id) {
    const rule = rules.find((r) => r.id === id);
    if (!confirm(`Delete rule "${rule?.name}"?`)) return;
    applyRules(rules.filter((r) => r.id !== id), { description: `Deleted "${rule?.name}"` });
  }

  function handleSaveRule(rule) {
    const isNew   = !rules.find((r) => r.id === rule.id);
    const updated = isNew
      ? [...rules, rule]
      : rules.map((r) => (r.id === rule.id ? rule : r));
    applyRules(updated, { description: `${isNew ? 'Created' : 'Updated'} "${rule.name}"` });
    setEditingRule(null);
  }

  function handleRestore() {
    const fresh = getRules();
    setRules(fresh);
    onRulesChange?.(fresh);
  }

  function handleReset() {
    if (!confirm('Reset all rules to defaults? Current rules will be saved in history.')) return;
    resetToDefaults();
    handleRestore();
  }

  const historyCount = getHistory().length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Rules Engine</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {rules.filter((r) => r.enabled).length} active · {rules.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChangingPassword(true)}
            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Change password
          </button>
          <button
            onClick={handleReset}
            className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
          >
            Reset to defaults
          </button>
          <button
            onClick={onLock}
            title="Lock the Rules Engine"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg transition-colors"
          >
            🔒 Lock
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 px-5 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-3 text-sm capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-700 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {tab === 'history' && historyCount > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                {historyCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === 'rules' && (
          <RulesList
            rules={rules}
            onAdd={() => setEditingRule('new')}
            onEdit={(rule) => setEditingRule(rule)}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        {activeTab === 'tester' && <RulesTester rules={rules} />}
        {activeTab === 'history' && <RulesHistory onRestore={handleRestore} />}
      </div>

      {/* Editor modal */}
      {editingRule !== null && (
        <RuleEditor
          rule={editingRule === 'new' ? null : editingRule}
          existingRules={rules}
          onSave={handleSaveRule}
          onClose={() => setEditingRule(null)}
        />
      )}

      {/* Change-password modal */}
      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
    </div>
  );
}
