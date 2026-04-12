import React, { useState } from 'react';

const DEFAULT_JARS = [
  { name: 'Bills', color: '#DC2626' },
  { name: 'Investment', color: '#2563EB' },
  { name: 'Education', color: '#8B5CF6' },
  { name: 'Play', color: '#F59E0B' },
  { name: 'Give', color: '#10B981' },
  { name: 'Savings', color: '#06B6D4' },
];

export default function GoalTracker({ user, jars, goals, onGoalAdded, supabase }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedJar, setSelectedJar] = useState('Savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const jarList = jars.length > 0 ? jars : DEFAULT_JARS;

  const getMonthSpending = (jarId) => {
    const now = new Date();
    // This would need actual expense data
    return 0;
  };

  const calculateProjection = (targetAmount, targetDate, currentSaved) => {
    const today = new Date();
    const target = new Date(targetDate);
    const monthsRemaining = Math.max(1, Math.ceil((target - today) / (1000 * 60 * 60 * 24 * 30)));
    const monthlyNeeded = (targetAmount - currentSaved) / monthsRemaining;
    return {
      monthsRemaining,
      monthlyNeeded,
      isOnPace: monthlyNeeded > 0,
    };
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!targetAmount || !targetDate) return;

    setLoading(true);
    try {
      const jarRecord = jars.find((j) => j.name === selectedJar) || { id: selectedJar, name: selectedJar };

      const { error } = await supabase.from('goals').insert([
        {
          user_id: user.id,
          jar_id: jarRecord.id || selectedJar,
          target_amount: parseFloat(targetAmount),
          target_date: targetDate,
          current_saved: 0,
        },
      ]);

      if (error) throw error;

      setNotification('✅ Goal created successfully!');
      setTargetAmount('');
      setTargetDate('');
      setShowForm(false);
      onGoalAdded();

      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      setNotification(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400">🎯 Savings Goals</h2>
          <p className="text-yellow-300 text-sm">Set targets and track your progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-6 py-3 rounded text-lg"
        >
          + New Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-yellow-400 mb-6">Create New Goal</h3>

          <form onSubmit={handleAddGoal} className="space-y-6">
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

            {/* Target Amount */}
            <div>
              <label className="block text-yellow-400 font-semibold mb-2">Target Amount ($)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="100"
                min="0"
                className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white text-lg focus:outline-none"
                placeholder="10000"
                required
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-yellow-400 font-semibold mb-2">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 bg-green-900 border-2 border-yellow-400 rounded text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold py-3 rounded text-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✅ Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const targetDate = new Date(goal.target_date);
            const today = new Date();
            const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            const monthsRemaining = Math.ceil(daysRemaining / 30);
            const progress = (goal.current_saved / goal.target_amount) * 100;
            const monthlyNeeded = monthsRemaining > 0 ? (goal.target_amount - goal.current_saved) / monthsRemaining : 0;
            const onPace = monthlyNeeded <= 0 || (monthlyNeeded > 0 && progress > (100 * ((30 - (daysRemaining % 30)) / 30)));

            return (
              <div key={goal.id} className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-yellow-400">
                    {goal.jar_id} Goal
                  </h3>
                  <p className="text-yellow-300 text-sm">
                    Target: {targetDate.toLocaleDateString()} ({monthsRemaining} months)
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-yellow-300 text-sm mb-2">
                    <span>${goal.current_saved.toFixed(2)}</span>
                    <span className="font-bold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-yellow-300 text-sm mt-2">
                    <span>Progress</span>
                    <span className="font-bold">${goal.target_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="bg-green-900 rounded p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-yellow-300">
                    <span>Remaining:</span>
                    <span className="font-bold">
                      ${(goal.target_amount - goal.current_saved).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-yellow-300">
                    <span>Monthly Target:</span>
                    <span className="font-bold text-lg">
                      ${monthlyNeeded.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-yellow-300">
                    <span>Days Left:</span>
                    <span className="font-bold">{Math.max(0, daysRemaining)} days</span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 p-3 rounded text-center font-semibold text-sm">
                  {progress >= 100 ? (
                    <div className="bg-green-700 text-green-100">✅ Goal Achieved!</div>
                  ) : onPace ? (
                    <div className="bg-blue-700 text-blue-100">📈 On Track</div>
                  ) : (
                    <div className="bg-orange-700 text-orange-100">⚠️ Behind Pace</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-12 text-center">
          <p className="text-yellow-300 text-lg mb-4">🎯 No goals set yet</p>
          <p className="text-yellow-200 text-sm mb-6">
            Create a goal to track your savings progress and stay motivated!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-green-950 font-bold px-8 py-3 rounded text-lg"
          >
            Set Your First Goal
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-6">
        <h3 className="text-blue-300 font-bold text-lg mb-4">💡 Goal-Setting Tips</h3>
        <ul className="text-blue-200 text-sm space-y-2">
          <li>• Set realistic timelines - give yourself 3-12 months for bigger goals</li>
          <li>• Break large goals into smaller milestones</li>
          <li>• Review your progress monthly and adjust if needed</li>
          <li>• Celebrate when you hit 25%, 50%, and 75% progress!</li>
          <li>• Use the What-If Scenario tool to see how to reach goals faster</li>
        </ul>
      </div>
    </div>
  );
}
