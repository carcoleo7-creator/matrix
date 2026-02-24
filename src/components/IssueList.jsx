import { SEVERITY_RULES } from '../utils/calculations.js';

const SEVERITY_STYLES = {
  Low:    { badge: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
  Medium: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  High:   { badge: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
};

function getEffectivePct(severity, counts) {
  const count = counts[severity] || 0;
  if (count === 0) return 0;
  const rule = SEVERITY_RULES[severity];
  return count >= 2 ? rule.multiple : rule.single;
}

export default function IssueList({ issues, onRemove }) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">
        No issues added yet. Use the form above to add issues.
      </p>
    );
  }

  const counts = issues.reduce((acc, { severity }) => {
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const summaryParts = ['Low', 'Medium', 'High']
    .filter((s) => counts[s])
    .map((s) => `${counts[s]} ${s}`);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        {issues.length} issue{issues.length !== 1 ? 's' : ''}: {summaryParts.join(', ')}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-3 font-semibold text-gray-500 w-8">#</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-500">Issue</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-500">Severity</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-500">Weight</th>
              <th className="py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => {
              const styles = SEVERITY_STYLES[issue.severity];
              const pct = getEffectivePct(issue.severity, counts);
              const weightLabel = pct === 0 ? '0% (apology)' : `${pct}%`;

              return (
                <tr key={issue.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-3 text-gray-400">{idx + 1}</td>
                  <td className="py-2 pr-3 text-gray-800 font-medium">{issue.name}</td>
                  <td className="py-2 pr-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${styles.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-gray-600 text-xs">{weightLabel}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onRemove(issue.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${issue.name}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
