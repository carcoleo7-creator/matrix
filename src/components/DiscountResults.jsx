const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const SEVERITY_COLORS = {
  Low:    'text-green-700 bg-green-50',
  Medium: 'text-yellow-700 bg-yellow-50',
  High:   'text-red-700 bg-red-50',
};

export default function DiscountResults({ result, hasIssues, hasSubtotal }) {
  if (!hasSubtotal && !hasIssues) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">🧮</div>
        <p className="text-sm">Enter a subtotal and add issues to see the discount calculation.</p>
      </div>
    );
  }

  if (!hasIssues) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">Add at least one issue to calculate a discount.</p>
      </div>
    );
  }

  if (!hasSubtotal) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">💰</div>
        <p className="text-sm">Enter a subtotal amount to calculate the final price.</p>
      </div>
    );
  }

  const { subtotal, breakdown, totalPct, totalDiscount, finalAmount } = result;
  const isOverDiscount = totalDiscount > subtotal;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Discount Breakdown</h2>

      {isOverDiscount && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          ⚠️ Total discount ({totalPct}%) exceeds subtotal. Final amount is capped at $0.00.
        </div>
      )}

      {/* Breakdown table */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-600">Severity</th>
            <th className="text-center py-2 pr-4 font-semibold text-gray-600">Issues</th>
            <th className="text-center py-2 pr-4 font-semibold text-gray-600">Discount %</th>
            <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-2 pr-4 text-gray-500">Subtotal</td>
            <td className="py-2 pr-4 text-center text-gray-400">—</td>
            <td className="py-2 pr-4 text-center text-gray-400">—</td>
            <td className="py-2 text-right font-medium text-gray-700">{fmt.format(subtotal)}</td>
          </tr>
          {breakdown.map((b) => (
            <tr key={b.severity} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_COLORS[b.severity]}`}>
                  {b.severity}
                </span>
              </td>
              <td className="py-2 pr-4 text-center text-gray-600">{b.count}</td>
              <td className="py-2 pr-4 text-center text-gray-600">{b.pct}%</td>
              <td className="py-2 text-right text-red-600 font-medium">−{fmt.format(b.amount)}</td>
            </tr>
          ))}
          <tr className="border-b-2 border-gray-300">
            <td colSpan={2} className="py-2 pr-4 font-bold text-gray-800">Total Discount</td>
            <td className="py-2 pr-4 text-center font-bold text-gray-800">{totalPct}%</td>
            <td className="py-2 text-right font-bold text-red-600">−{fmt.format(totalDiscount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Final amount */}
      <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-4 border border-blue-100">
        <span className="text-base font-bold text-blue-900">Final Amount</span>
        <span className="text-2xl font-bold text-blue-700">{fmt.format(finalAmount)}</span>
      </div>
    </div>
  );
}
