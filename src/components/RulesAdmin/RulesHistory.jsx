import { useState } from 'react';
import { getHistory, restoreSnapshot } from '../../utils/rulesStorage.js';

export default function RulesHistory({ onRestore }) {
  const [history,  setHistory]  = useState(getHistory);
  const [expanded, setExpanded] = useState(null);

  function handleRestore(id) {
    const snap = history.find((s) => s.id === id);
    if (!confirm(`Restore snapshot from ${new Date(snap.timestamp).toLocaleString()}?\nCurrent rules will be saved as a new snapshot.`)) return;
    restoreSnapshot(id);
    setHistory(getHistory());
    onRestore?.();
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No history yet. Each time you save, edit, or delete a rule a snapshot is recorded here.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">
        {history.length} snapshot{history.length !== 1 ? 's' : ''} · auto-saved on every change · max 30 kept
      </p>

      <div className="space-y-2">
        {history.map((snap) => (
          <div
            key={snap.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Row header */}
            <div className="flex items-start justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{snap.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(snap.timestamp).toLocaleString()} · {snap.author} · {snap.rules.length} rule{snap.rules.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setExpanded(expanded === snap.id ? null : snap.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  {expanded === snap.id ? 'Hide' : 'View'}
                </button>
                <button
                  onClick={() => handleRestore(snap.id)}
                  className="text-xs bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>

            {/* Expandable JSON diff */}
            {expanded === snap.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Rule snapshot (JSON)</p>
                <pre className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto max-h-52 leading-relaxed">
                  {JSON.stringify(snap.rules, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
