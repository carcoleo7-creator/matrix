import { useState } from 'react';
import { verifyPassword, hasCustomPassword } from '../../utils/rulesStorage.js';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    const ok = await verifyPassword(password);
    setLoading(false);
    if (ok) {
      onUnlock();
    } else {
      setError('Incorrect password.');
      setPassword('');
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        {/* Icon + title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            🔒
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Rules Engine</h2>
          <p className="text-sm text-gray-500 mt-1">Admin access only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              autoFocus
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>

        {/* Hint shown only when still on the default password */}
        {!hasCustomPassword() && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Default password: <span className="font-mono">admin</span>
          </p>
        )}
      </div>
    </div>
  );
}
