function ConditionSummary({ condition }) {
  if (!condition?.conditions?.length) return <span className="text-gray-400">—</span>;
  return (
    <span className="font-mono">
      {condition.conditions.map((c, i) => (
        <span key={i}>
          {i > 0 && (
            <span className="mx-1 text-gray-400 font-sans">{condition.logic}</span>
          )}
          {c.field}&nbsp;{c.op}&nbsp;
          <span className="text-blue-700">{JSON.stringify(c.value)}</span>
        </span>
      ))}
    </span>
  );
}

const SEVERITY_COLOR = {
  Low:    'bg-green-100 text-green-700',
  Medium: 'bg-orange-100 text-orange-700',
  High:   'bg-red-100 text-red-700',
};

export default function RulesList({ rules, onAdd, onEdit, onToggle, onDelete }) {
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {rules.length} rule{rules.length !== 1 ? 's' : ''} ·{' '}
          {rules.filter((r) => r.enabled).length} active
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {/* Empty state */}
      {rules.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No rules defined. Add one to get started.
        </div>
      )}

      {/* Table */}
      {rules.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                <th className="pb-2 pl-1 w-12">Pri.</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Conditions</th>
                <th className="pb-2 text-right">Discount</th>
                <th className="pb-2 text-center">Status</th>
                <th className="pb-2 text-right pr-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((rule) => (
                <tr
                  key={rule.id}
                  className={`border-t border-gray-100 transition-opacity ${
                    rule.enabled ? '' : 'opacity-50'
                  }`}
                >
                  <td className="py-3 pl-1 text-gray-400 text-xs tabular-nums">
                    {rule.priority}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900 leading-snug">{rule.name}</div>
                    {rule.description && (
                      <div className="text-xs text-gray-400 leading-snug mt-0.5">
                        {rule.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-600">
                    <ConditionSummary condition={rule.condition} />
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-blue-700">
                    {rule.action.discountPercent}%
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onToggle(rule.id)}
                      title={rule.enabled ? 'Click to disable' : 'Click to enable'}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        rule.enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="py-3 text-right pr-1 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(rule)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
