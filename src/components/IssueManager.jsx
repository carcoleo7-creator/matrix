import { useState } from 'react';
import IssueList from './IssueList.jsx';

const SEVERITIES = ['Low', 'Medium', 'High'];

const SEVERITY_DESCRIPTIONS = {
  Low:    '5% discount (fixed)',
  Medium: '10% (single) / 20% (2+ issues)',
  High:   '15% (single) / 30% (2+ issues)',
};

export default function IssueManager({ issues, onAdd, onRemove }) {
  const [selected, setSelected] = useState('Medium');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Issues</h2>

      {/* Add issue form */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <label htmlFor="severity-select" className="block text-xs font-medium text-gray-600 mb-1">
            Severity Level
          </label>
          <select
            id="severity-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s} — {SEVERITY_DESCRIPTIONS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onAdd(selected)}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Issue
          </button>
        </div>
      </div>

      {/* Severity reference */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {SEVERITIES.map((s) => (
          <div key={s} className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 text-center">
            <span className="font-semibold text-gray-700 block">{s}</span>
            {SEVERITY_DESCRIPTIONS[s]}
          </div>
        ))}
      </div>

      {/* Issue list */}
      <IssueList issues={issues} onRemove={onRemove} />
    </div>
  );
}
