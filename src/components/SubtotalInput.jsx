export default function SubtotalInput({ value, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <label htmlFor="subtotal" className="block text-sm font-semibold text-gray-700 mb-2">
        Subtotal Amount
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
          $
        </span>
        <input
          id="subtotal"
          type="number"
          min="0"
          step="0.01"
          value={value === 0 ? '' : value}
          placeholder="0.00"
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : Math.max(0, val));
          }}
          className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>
      {value > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          Current subtotal:{' '}
          <span className="font-medium text-gray-700">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          </span>
        </p>
      )}
    </div>
  );
}
