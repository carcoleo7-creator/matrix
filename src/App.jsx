import { useState } from 'react';
import { calculateDiscount } from './utils/calculations.js';
import SubtotalInput from './components/SubtotalInput.jsx';
import IssueManager from './components/IssueManager.jsx';
import DiscountResults from './components/DiscountResults.jsx';

export default function App() {
  const [subtotal, setSubtotal] = useState(0);
  const [issues, setIssues] = useState([]);

  function addIssue(severity) {
    setIssues((prev) => [...prev, { id: crypto.randomUUID(), severity }]);
  }

  function removeIssue(id) {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  }

  const result = calculateDiscount(issues, subtotal);
  const hasIssues = issues.length > 0;
  const hasSubtotal = subtotal > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900">Compensation Matrix</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Severity-based discount calculator
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: inputs */}
          <div className="flex flex-col gap-6">
            <SubtotalInput value={subtotal} onChange={setSubtotal} />
            <IssueManager issues={issues} onAdd={addIssue} onRemove={removeIssue} />
          </div>

          {/* Right column: results */}
          <div>
            <DiscountResults
              result={result}
              hasIssues={hasIssues}
              hasSubtotal={hasSubtotal}
            />
          </div>
        </div>

        {/* Example scenario reference */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Example:</p>
          <p>
            Subtotal = $1,000 · Issues = [Medium, Medium, High]
            → Medium (2+) = 20% = $200, High (2+) = 30% = $300
            → <strong>Total Discount = $500 · Final = $500</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
