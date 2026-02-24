import { useState } from 'react';
import { ISSUE_CATALOG } from '../utils/issueCatalog.js';
import IssueList from './IssueList.jsx';

const SEVERITIES = ['Low', 'Medium', 'High'];

export default function IssueManager({ issues, onAdd, onRemove }) {
  const [selectedCatalogId, setSelectedCatalogId] = useState(ISSUE_CATALOG[0].id);
  const [severity, setSeverity] = useState(ISSUE_CATALOG[0].defaultSeverity);

  function handleCatalogChange(e) {
    const id = e.target.value;
    setSelectedCatalogId(id);
    const item = ISSUE_CATALOG.find((c) => c.id === id);
    if (item) setSeverity(item.defaultSeverity);
  }

  function handleAdd() {
    const item = ISSUE_CATALOG.find((c) => c.id === selectedCatalogId);
    if (item) onAdd(item.name, severity);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Issues</h2>

      {/* Add issue form */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="issue-select" className="block text-xs font-medium text-gray-600 mb-1">
            Issue
          </label>
          <select
            id="issue-select"
            value={selectedCatalogId}
            onChange={handleCatalogChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {ISSUE_CATALOG.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <label htmlFor="severity-select" className="block text-xs font-medium text-gray-600 mb-1">
            Severity
          </label>
          <select
            id="severity-select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
        >
          + Add Issue
        </button>
      </div>

      {/* Issue list */}
      <IssueList issues={issues} onRemove={onRemove} />
    </div>
  );
}
