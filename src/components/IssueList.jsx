const SEVERITY_STYLES = {
  Low:    { badge: 'bg-green-100 text-green-800 border-green-200',  dot: 'bg-green-500' },
  Medium: { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  High:   { badge: 'bg-red-100 text-red-800 border-red-200',         dot: 'bg-red-500' },
};

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
      <div className="flex flex-wrap gap-2">
        {issues.map((issue) => {
          const styles = SEVERITY_STYLES[issue.severity];
          return (
            <span
              key={issue.id}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-sm font-medium border ${styles.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
              {issue.severity}
              <button
                onClick={() => onRemove(issue.id)}
                className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
                aria-label={`Remove ${issue.severity} issue`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
