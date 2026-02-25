import { useState } from 'react';
import { calculateWithRules } from './utils/rulesEngine.js';
import { getRules } from './utils/rulesStorage.js';
import SubtotalInput from './components/SubtotalInput.jsx';
import IssueManager  from './components/IssueManager.jsx';
import DiscountResults from './components/DiscountResults.jsx';
import RulesAdmin    from './components/RulesAdmin/index.jsx';

export default function App() {
  const [subtotal,  setSubtotal]  = useState(0);
  const [issues,    setIssues]    = useState([]);
  const [rules,     setRules]     = useState(getRules);
  const [activeTab, setActiveTab] = useState('calculator');

  function addIssue(name, severity) {
    setIssues((prev) => [...prev, { id: crypto.randomUUID(), name, severity }]);
  }

  function removeIssue(id) {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  }

  const result     = calculateWithRules(rules, issues, subtotal);
  const hasIssues  = issues.length > 0;
  const hasSubtotal = subtotal > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Compensation Matrix</h1>
              <p className="text-sm text-gray-500 mt-0.5">Severity-based discount calculator</p>
            </div>
            <nav className="flex gap-1">
              {['calculator', 'rules'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-lg capitalize font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {activeTab === 'calculator' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: inputs */}
              <div className="flex flex-col gap-6">
                <SubtotalInput value={subtotal} onChange={setSubtotal} />
                <IssueManager
                  issues={issues}
                  rules={rules}
                  onAdd={addIssue}
                  onRemove={removeIssue}
                />
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

            {/* Example hint */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">Example:</p>
              <p>
                Subtotal = $1,000 · Issues = [Medium, Medium, High]
                → Medium (2+) = 20% = $200, High (1) = 20% = $200
                → <strong>Total Discount = $400 · Final = $600</strong>
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Discount rules are configurable — open the{' '}
                <button
                  onClick={() => setActiveTab('rules')}
                  className="underline font-medium hover:text-blue-800"
                >
                  Rules tab
                </button>{' '}
                to customize them.
              </p>
            </div>
          </>
        ) : (
          <RulesAdmin onRulesChange={setRules} />
        )}
      </main>
    </div>
  );
}
