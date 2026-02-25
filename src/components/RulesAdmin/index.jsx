import { useState } from 'react';
import { getRules, saveRules, getHistory, resetToDefaults } from '../../utils/rulesStorage.js';
import RulesList    from './RulesList.jsx';
import RuleEditor   from './RuleEditor.jsx';
import RulesTester  from './RulesTester.jsx';
import RulesHistory from './RulesHistory.jsx';

const TABS = ['rules', 'tester', 'history'];

export default function RulesAdmin({ onRulesChange }) {
  const [rules,       setRules]       = useState(getRules);
  const [activeTab,   setActiveTab]   = useState('rules');
  const [editingRule, setEditingRule] = useState(null); // null=closed, 'new'=new, object=edit

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
    applyRules(updated, {
      description: `${isNew ? 'Created' : 'Updated'} "${rule.name}"`,
    });
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
        <button
          onClick={handleReset}
          className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
        >
          Reset to defaults
        </button>
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
    </div>
  );
}
