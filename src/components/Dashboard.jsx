import React, { useState, useEffect } from 'react';
import JarOverview from './JarOverview';
import ExpenseTracker from './ExpenseTracker';
import GoalTracker from './GoalTracker';
import MonthlyReport from './MonthlyReport';
import WhatIfScenario from './WhatIfScenario';

export default function Dashboard({ user, supabase }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [jars, setJars] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Set up real-time listeners
    const expenseSubscription = supabase
      .channel('expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      expenseSubscription.unsubscribe();
    };
  }, [user]);

  const loadData = async () => {
    try {
      // Load jars
      const { data: jarsData } = await supabase
        .from('jars')
        .select('*')
        .eq('user_id', user.id);

      // Load expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Load goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      setJars(jarsData || []);
      setExpenses(expensesData || []);
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-yellow-400 text-xl">Loading your jars...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950">
      {/* Header */}
      <header className="bg-green-950 border-b-4 border-yellow-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-yellow-500">💰 Money Jar</h1>
            <p className="text-yellow-300 text-sm">Master Your Financial Habits</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-yellow-300">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-green-900 border-b-2 border-yellow-500">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 py-4 overflow-x-auto">
          {[
            { id: 'overview', label: '🏦 Jars', icon: '🏦' },
            { id: 'expense', label: '📝 Log Expense', icon: '📝' },
            { id: 'scenario', label: '📊 What-If', icon: '📊' },
            { id: 'goals', label: '🎯 Goals', icon: '🎯' },
            { id: 'report', label: '📈 Report', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 font-semibold rounded transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-green-950'
                  : 'bg-green-800 text-yellow-400 hover:bg-green-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <JarOverview
            user={user}
            jars={jars}
            expenses={expenses}
            goals={goals}
            onDataChange={loadData}
            supabase={supabase}
          />
        )}
        {activeTab === 'expense' && (
          <ExpenseTracker
            user={user}
            jars={jars}
            onExpenseAdded={loadData}
            supabase={supabase}
          />
        )}
        {activeTab === 'scenario' && (
          <WhatIfScenario jars={jars} expenses={expenses} goals={goals} />
        )}
        {activeTab === 'goals' && (
          <GoalTracker
            user={user}
            jars={jars}
            goals={goals}
            onGoalAdded={loadData}
            supabase={supabase}
          />
        )}
        {activeTab === 'report' && (
          <MonthlyReport jars={jars} expenses={expenses} goals={goals} />
        )}
      </main>
    </div>
  );
}
