import { useState } from 'react';
import { FIELDS, OPERATORS, validateRule } from '../../utils/rulesValidator.js';
import { evaluateRules } from '../../utils/rulesEngine.js';

// Standard contexts used for the live preview
const PREVIEW_CONTEXTS = [
  { severity: 'Low',    count: 1, subtotal: 1000 },
  { severity: 'Low',    count: 2, subtotal: 1000 },
  { severity: 'Medium', count: 1, subtotal: 1000 },
  { severity: 'Medium', count: 2, subtotal: 1000 },
  { severity: 'High',   count: 1, subtotal: 1000 },
  { severity: 'High',   count: 2, subtotal: 1000 },
];

function makeEmptyRule() {
  return {
    id:          crypto.randomUUID(),
    name:        '',
    description: '',
    enabled:     true,
    priority:    10,
    condition: {
      logic:      'AND',
      conditions: [{ field: 'severity', op: 'eq', value: 'Low' }],
    },
    action:    { discountPercent: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Condition row sub-component
// ---------------------------------------------------------------------------
function ConditionRow({ cond, onChange, onRemove, canRemove }) {
  const fieldDef = FIELDS.find((f) => f.id === cond.field) ?? FIELDS[0];
  const ops      = OPERATORS[fieldDef.type] ?? OPERATORS.number;

  function handleFieldChange(newField) {
    const def    = FIELDS.find((f) => f.id === newField) ?? FIELDS[0];
    const defOp  = OPERATORS[def.type]?.[0]?.id ?? 'eq';
    const defVal = def.type === 'enum' ? def.options[0] : 1;
    onChange('field', newField);
    onChange('op',    defOp);
    onChange('value', defVal);
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      {/* Field */}
      <select
        value={cond.field}
        onChange={(e) => handleFieldChange(e.target.value)}
        className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {FIELDS.map((f) => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>

      {/* Operator */}
      <select
        value={cond.op}
        onChange={(e) => onChange('op', e.target.value)}
        className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {ops.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>

      {/* Value */}
      {fieldDef.type === 'enum' ? (
        <select
          value={cond.value}
          onChange={(e) => onChange('value', e.target.value)}
          className="border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {fieldDef.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          min="0"
          value={cond.value}
          onChange={(e) => onChange('value', Number(e.target.value))}
          className="w-20 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-gray-300 hover:text-red-400 text-lg leading-none"
          title="Remove condition"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor modal
// ---------------------------------------------------------------------------
export default function RuleEditor({ rule, existingRules, onSave, onClose }) {
  const [form, setForm] = useState(() =>
    rule ? JSON.parse(JSON.stringify(rule)) : makeEmptyRule(),
  );

  const { errors, warnings } = validateRule(form, existingRules);

  // Live preview — which standard contexts does this rule match?
  const previewMatches = PREVIEW_CONTEXTS.filter((ctx) => {
    try {
      return evaluateRules([{ ...form, enabled: true }], ctx).length > 0;
    } catch {
      return false;
    }
  });

  // Generic deep-set via dot-path
  function setPath(path, value) {
    setForm((prev) => {
      const next  = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj     = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      next.updatedAt = new Date().toISOString();
      return next;
    });
  }

  function setConditionField(idx, field, value) {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.condition.conditions[idx][field] = value;
      return next;
    });
  }

  function addCondition() {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.condition.conditions.push({ field: 'severity', op: 'eq', value: 'Low' });
      return next;
    });
  }

  function removeCondition(idx) {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.condition.conditions.splice(idx, 1);
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (errors.length > 0) return;
    onSave({
      ...form,
      priority: Number(form.priority),
      action:   { discountPercent: Number(form.action.discountPercent) },
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">
            {rule ? 'Edit Rule' : 'New Rule'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Name + Priority */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setPath('name', e.target.value)}
                placeholder="e.g. High – multiple issues"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.priority}
                onChange={(e) => setPath('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Lower = first</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setPath('description', e.target.value)}
              placeholder="Optional — shown in the rules list"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs font-medium text-gray-700">Conditions</label>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Match</span>
                <select
                  value={form.condition.logic}
                  onChange={(e) => setPath('condition.logic', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="AND">ALL (AND)</option>
                  <option value="OR">ANY (OR)</option>
                </select>
                <span>of:</span>
              </div>
            </div>

            <div className="space-y-2">
              {form.condition.conditions.map((cond, idx) => (
                <ConditionRow
                  key={idx}
                  cond={cond}
                  onChange={(field, value) => setConditionField(idx, field, value)}
                  onRemove={() => removeCondition(idx)}
                  canRemove={form.condition.conditions.length > 1}
                />
              ))}
            </div>

            {form.condition.conditions.length < 5 && (
              <button
                type="button"
                onClick={addCondition}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add condition
              </button>
            )}
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={form.action.discountPercent}
                onChange={(e) => setPath('action.discountPercent', e.target.value)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">% of subtotal</span>
            </div>
          </div>

          {/* Enabled toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setPath('enabled', e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">Rule is active</span>
          </label>

          {/* Live preview */}
          {previewMatches.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">Live preview — matches:</p>
              <ul className="space-y-0.5 text-xs text-blue-700">
                {previewMatches.map((ctx, i) => (
                  <li key={i}>
                    · {ctx.severity} × {ctx.count} →{' '}
                    <strong>{form.action.discountPercent}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-800">⚠ {w}</p>
              ))}
            </div>
          )}

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-800">✕ {e}</p>
              ))}
            </div>
          )}
        </form>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={errors.length > 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {rule ? 'Save Changes' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}
