import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_JARS = [
  { name: 'Bills', percentage: 55, color: '#DC2626' },
  { name: 'Investment', percentage: 10, color: '#2563EB' },
  { name: 'Education', percentage: 10, color: '#8B5CF6' },
  { name: 'Play', percentage: 10, color: '#F59E0B' },
  { name: 'Give', percentage: 5, color: '#10B981' },
  { name: 'Savings', percentage: 10, color: '#06B6D4' },
];

export default function JarOverview({ user, jars, expenses, goals, onDataChange, supabase }) {
  const [showAddJar, setShowAddJar] = useState(false);
  const [newJarName, setNewJarName] = useState('');
  const [newJarBudget, setNewJarBudget] = useState('');
  const [loadingJars, setLoadingJars] = useState(jars);

  const currentJars = jars.length > 0 ? jars : DEFAULT_JARS.map((jar) => ({
    id: Math.random(),
    user_id: user.id,
    name: jar.name,
    budget: 1000, // Default budget
    color: jar.color,
    created_at: new Date(),
  }));

  const getMonthExpenses = (jarId) => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const eDate = new Date(e.date);
        return e.jar_id === jarId && eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleAddJar = async (e) => {
    e.preventDefault();
    if (!newJarName || !newJarBudget) return;

    try {
      const { error } = await supabase.from('jars').insert([
        {
          user_id: user.id,
          name: newJarName,
          budget: parseFloat(newJarBudget),
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      ]);
      if (error) throw error;
      setNewJarName('');
      setNewJarBudget('');
      setShowAddJar(false);
      onDataChange();
    } catch (error) {
      console.error('Error adding jar:', error);
    }
  };

  const chartData = currentJars.map((jar) => ({
    name: jar.name,
    value: jar.budget,
    color: jar.color,
  }));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-yellow-400">Your Money Jars</h2>
        <button
          onClick={() => setShowAddJar(!showAddJar)}
          className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-6 py-2 rounded"
        >
          + Add Jar
        </button>
      </div>

      {/* Add Jar Form */}
      {showAddJar && (
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold text-lg mb-4">Create Custom Jar</h3>
          <form onSubmit={handleAddJar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newJarName}
                onChange={(e) => setNewJarName(e.target.value)}
                placeholder="Jar name (e.g., Entertainment)"
                className="px-4 py-2 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
              />
              <input
                type="number"
                value={newJarBudget}
                onChange={(e) => setNewJarBudget(e.target.value)}
                placeholder="Monthly budget ($)"
                className="px-4 py-2 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-6 py-2 rounded"
            >
              Create Jar
            </button>
          </form>
        </div>
      )}

      {/* Jar Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jar Cards */}
        <div className="space-y-4">
          {currentJars.map((jar) => {
            const spent = getMonthExpenses(jar.id || jar.name);
            const percentage = (spent / jar.budget) * 100;
            const remaining = jar.budget - spent;
            const isAlertThreshold = percentage >= 80;

            return (
              <div
                key={jar.id}
                className={`rounded-lg p-6 border-2 transition ${
                  isAlertThreshold
                    ? 'bg-red-900 border-red-400 shadow-lg shadow-red-500'
                    : 'bg-green-800 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400">{jar.name}</h3>
                    <p className="text-yellow-200 text-sm">Monthly Budget: ${jar.budget.toFixed(2)}</p>
                  </div>
                  {isAlertThreshold && (
                    <span className="bg-red-500 text-white font-bold px-3 py-1 rounded text-sm">
                      ⚠️ 80%+
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-yellow-300 text-sm mb-2">
                    <span>Spent: ${spent.toFixed(2)}</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${
                        percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-green-400'
                      } transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-yellow-200">
                  {remaining > 0 ? (
                    <p className="text-green-300 font-semibold">
                      💚 ${remaining.toFixed(2)} remaining
                    </p>
                  ) : (
                    <p className="text-red-300 font-semibold">
                      💔 ${Math.abs(remaining).toFixed(2)} over budget
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget Distribution Chart */}
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6 flex flex-col justify-center">
          <h3 className="text-yellow-400 font-bold text-lg mb-4 text-center">Budget Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
        <h3 className="text-yellow-400 font-bold text-lg mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-900 rounded p-4">
            <p className="text-yellow-300 text-sm">Total Budget</p>
            <p className="text-yellow-400 text-2xl font-bold">
              ${currentJars.reduce((sum, j) => sum + j.budget, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-900 rounded p-4">
            <p className="text-yellow-300 text-sm">Total Spent</p>
            <p className="text-yellow-400 text-2xl font-bold">
              ${currentJars.reduce((sum, j) => sum + getMonthExpenses(j.id || j.name), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-900 rounded p-4">
            <p className="text-yellow-300 text-sm">Total Remaining</p>
            <p className="text-green-300 text-2xl font-bold">
              ${(
                currentJars.reduce((sum, j) => sum + j.budget, 0) -
                currentJars.reduce((sum, j) => sum + getMonthExpenses(j.id || j.name), 0)
              ).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-900 rounded p-4">
            <p className="text-yellow-300 text-sm">Avg Spent Per Jar</p>
            <p className="text-yellow-400 text-2xl font-bold">
              ${(
                currentJars.reduce((sum, j) => sum + getMonthExpenses(j.id || j.name), 0) / currentJars.length
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
