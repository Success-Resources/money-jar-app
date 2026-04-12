import React, { useState, useEffect } from 'react';

const DEFAULT_JARS = [
  { name: 'Bills', color: '#DC2626' },
  { name: 'Investment', color: '#2563EB' },
  { name: 'Education', color: '#8B5CF6' },
  { name: 'Play', color: '#F59E0B' },
  { name: 'Give', color: '#10B981' },
  { name: 'Savings', color: '#06B6D4' },
];

export default function ExpenseTracker({ user, jars, onExpenseAdded, supabase }) {
  const [amount, setAmount] = useState('');
  const [selectedJar, setSelectedJar] = useState('Bills');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const jarList = jars.length > 0 ? jars : DEFAULT_JARS;

  useEffect(() => {
    loadRecentExpenses();
  }, []);

  const loadRecentExpenses = async () => {
    try {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);
      setRecentExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || !selectedJar) return;

    setLoading(true);
    try {
      const jarRecord = jars.find((j) => j.name === selectedJar) || {
        id: selectedJar,
        name: selectedJar,
      };

      const { error } = await supabase.from('expenses').insert([
        {
          user_id: user.id,
          jar_id: jarRecord.id || selectedJar,
          amount: parseFloat(amount),
          description: description || selectedJar,
          date: date,
        },
      ]);

      if (error) throw error;

      setNotification('✅ Expense logged successfully!');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onExpenseAdded();
      loadRecentExpenses();

      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Expense Form */}
      <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">📝 Log Daily Expense</h2>

        <form onSubmit={handleAddExpense} className="space-y-6">
          {notification && (
            <div
              className={`p-4 rounded-lg text-sm font-semibold ${
                notification.includes('Error')
                  ? 'bg-red-900 text-red-200 border border-red-500'
                  : 'bg-green-900 text-green-200 border border-green-500'
              }`}
            >
              {notification}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-2">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white text-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="0.00"
              required
            />
          </div>

          {/* Jar Selection */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-2">Which Jar?</label>
            <select
              value={selectedJar}
              onChange={(e) => setSelectedJar(e.target.value)}
              className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
            >
              {jarList.map((jar) => (
                <option key={jar.name || jar.id} value={jar.name || jar.id}>
                  {jar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-2">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
              placeholder="What did you spend on? (e.g., Grocery Shopping)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold py-4 rounded text-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : '💾 Log Expense'}
          </button>
        </form>
      </div>

      {/* Recent Expenses */}
      <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">📋 Recent Expenses</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense, index) => (
              <div
                key={index}
                className="bg-green-900 rounded-lg p-4 border-l-4 border-yellow-400 flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="text-yellow-300 font-semibold text-sm">
                    {expense.description || 'Expense'}
                  </p>
                  <p className="text-yellow-200 text-xs">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-lg">${expense.amount.toFixed(2)}</p>
                  <p className="text-yellow-200 text-xs">{expense.jar_id || 'Jar'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-yellow-300 text-sm">No expenses logged yet</p>
              <p className="text-yellow-200 text-xs">Start tracking by logging your first expense!</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {recentExpenses.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-yellow-500 space-y-2">
            <div className="flex justify-between text-yellow-300 text-sm">
              <span>Total (Last 10):</span>
              <span className="font-bold">
                ${recentExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-yellow-300 text-sm">
              <span>Average per expense:</span>
              <span className="font-bold">
                ${(recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
