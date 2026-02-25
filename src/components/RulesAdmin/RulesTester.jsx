import { useState } from 'react';
import { evaluateRules, calculateWithRules } from '../../utils/rulesEngine.js';

const PRESETS = [
  {
    label:    'No issues',
    issues:   [],
    subtotal: 1000,
  },
  {
    label:    'Single Low',
    issues:   [{ name: 'Issue A', severity: 'Low' }],
    subtotal: 1000,
  },
  {
    label:    '2× Medium + 1× High',
    issues:   [
      { name: 'Issue A', severity: 'Medium' },
      { name: 'Issue B', severity: 'Medium' },
      { name: 'Issue C', severity: 'High' },
    ],
    subtotal: 1000,
  },
  {
    label:    'All severities',
    issues:   [
      { name: 'Issue A', severity: 'Low' },
      { name: 'Issue B', severity: 'Medium' },
      { name: 'Issue C', severity: 'High' },
    ],
    subtotal: 1000,
  },
];

const SEVERITY_DOT = {
  Low:    'bg-green-400',
  Medium: 'bg-orange-400',
  High:   'bg-red-500',
};

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function RulesTester({ rules }) {
  const [issues,        setIssues]        = useState([]);
  const [subtotal,      setSubtotal]      = useState(1000);
  const [severityToAdd, setSeverityToAdd] = useState('Low');

  function loadPreset(preset) {
    setSubtotal(preset.subtotal);
    setIssues(preset.issues.map((i) => ({ ...i, id: crypto.randomUUID() })));
  }

  function addIssue() {
    setIssues((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Issue ${prev.length + 1}`, severity: severityToAdd },
    ]);
  }

  function removeIssue(id) {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  }

  const result = calculateWithRules(rules, issues, subtotal);

  // Per-severity breakdown of which rule fired
  const severityCounts = issues.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Test the active rules against a custom scenario before publishing.
      </p>

      {/* Preset buttons */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Quick scenarios</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => loadPreset(p)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 w-20 shrink-0">Subtotal</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={subtotal}
            onChange={(e) => setSubtotal(Number(e.target.value))}
            className="pl-7 border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Issue builder */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-medium text-gray-700 w-20 shrink-0">Issues</label>
          <select
            value={severityToAdd}
            onChange={(e) => setSeverityToAdd(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {['Low', 'Medium', 'High'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={addIssue}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add
          </button>
          {issues.length > 0 && (
            <button
              onClick={() => setIssues([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {issues.length === 0 && (
            <p className="text-xs text-gray-400">No issues — add one above.</p>
          )}
          {issues.map((issue) => (
            <span
              key={issue.id}
              className="inline-flex items-center gap-1.5 text-xs bg-gray-100 rounded-full pl-2.5 pr-1.5 py-1"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[issue.severity]}`} />
              {issue.name} ({issue.severity})
              <button
                onClick={() => removeIssue(issue.id)}
                className="text-gray-400 hover:text-red-400 leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Result</p>
        {result.breakdown.length === 0 ? (
          <p className="text-sm text-gray-400">
            {issues.length === 0 ? 'Add issues to see results.' : 'No discounts apply.'}
          </p>
        ) : (
          <>
            {result.breakdown.map((b, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {b.severity} × {b.count} → {b.pct}%
                </span>
                <span className="text-gray-700 tabular-nums">−{fmt.format(b.amount)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold">
              <span className="text-gray-700">Total discount</span>
              <span className="text-green-700 tabular-nums">−{fmt.format(result.totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Final</span>
              <span className="tabular-nums">{fmt.format(result.finalAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Rule trace */}
      {issues.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Rule trace
          </p>
          <div className="space-y-1.5">
            {Object.entries(severityCounts).map(([severity, count]) => {
              const matched = evaluateRules(rules, { severity, count, subtotal });
              return (
                <div key={severity} className="text-xs text-gray-600 flex gap-2">
                  <span className="shrink-0">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${SEVERITY_DOT[severity]}`} />
                    <span className="font-medium">{severity} × {count}:</span>
                  </span>
                  {matched.length > 0 ? (
                    <span>
                      matched{' '}
                      <span className="text-blue-700 font-medium">"{matched[0].name}"</span>
                      {' '}→ {matched[0].action.discountPercent}%
                      {matched.length > 1 && (
                        <span className="text-gray-400"> (+{matched.length - 1} lower-priority skipped)</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">no rule matched → 0%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
