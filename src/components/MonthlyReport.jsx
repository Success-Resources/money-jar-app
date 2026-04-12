import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function MonthlyReport({ jars, expenses, goals }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const DEFAULT_JARS = [
    { name: 'Bills', color: '#DC2626' },
    { name: 'Investment', color: '#2563EB' },
    { name: 'Education', color: '#8B5CF6' },
    { name: 'Play', color: '#F59E0B' },
    { name: 'Give', color: '#10B981' },
    { name: 'Savings', color: '#06B6D4' },
  ];

  const jarList = jars.length > 0 ? jars : DEFAULT_JARS;

  const monthData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);

    const monthExpenses = expenses.filter((e) => {
      const eDate = new Date(e.date);
      return eDate.getFullYear() === year && eDate.getMonth() + 1 === month;
    });

    const jarSummary = jarList.map((jar) => {
      const jarId = jar.id || jar.name;
      const spent = monthExpenses
        .filter((e) => e.jar_id === jarId)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        name: jar.name,
        spent,
        budget: jar.budget || 0,
        color: jar.color,
        remaining: Math.max(0, (jar.budget || 0) - spent),
        overspent: Math.max(0, spent - (jar.budget || 0)),
      };
    });

    const totalSpent = jarSummary.reduce((sum, j) => sum + j.spent, 0);
    const totalBudget = jarSummary.reduce((sum, j) => sum + j.budget, 0);
    const totalRemaining = jarSummary.reduce((sum, j) => sum + j.remaining, 0);
    const totalOverspent = jarSummary.reduce((sum, j) => sum + j.overspent, 0);

    return {
      month: selectedMonth,
      jarSummary,
      totalSpent,
      totalBudget,
      totalRemaining,
      totalOverspent,
      monthExpenses,
    };
  }, [selectedMonth, expenses, jarList]);

  const chartData = monthData.jarSummary.map((jar) => ({
    name: jar.name,
    Spent: jar.spent,
    Budget: jar.budget,
  }));

  const pieData = monthData.jarSummary
    .filter((j) => j.spent > 0)
    .map((j) => ({
      name: j.name,
      value: j.spent,
      color: j.color,
    }));

  const getMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: monthStr,
      });
    }
    return months;
  };

  return (
    <div className="space-y-8">
      {/* Month Selector */}
      <div className="flex gap-4 items-center">
        <label className="text-yellow-400 font-semibold">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-green-800 border-2 border-yellow-400 rounded text-white focus:outline-none"
        >
          {getMonthOptions().map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <p className="text-yellow-300 text-sm font-semibold mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-yellow-400">
            ${monthData.totalBudget.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <p className="text-yellow-300 text-sm font-semibold mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-yellow-400">
            ${monthData.totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <p className="text-yellow-300 text-sm font-semibold mb-2">Remaining</p>
          <p className="text-3xl font-bold text-green-300">
            ${monthData.totalRemaining.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <p className="text-yellow-300 text-sm font-semibold mb-2">Overspent</p>
          <p className="text-3xl font-bold text-red-400">
            ${monthData.totalOverspent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Budget vs Spending */}
        <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold text-lg mb-4">Budget vs Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#FCD34D" />
              <YAxis stroke="#FCD34D" />
              <Tooltip
                contentStyle={{ backgroundColor: '#064E3B', border: '2px solid #FCD34D' }}
                formatter={(value) => `$${value.toFixed(2)}`}
                labelStyle={{ color: '#FCD34D' }}
              />
              <Legend />
              <Bar dataKey="Budget" fill="#10B981" />
              <Bar dataKey="Spent" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Spending Distribution */}
        {pieData.length > 0 && (
          <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
            <h3 className="text-yellow-400 font-bold text-lg mb-4">Spending Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Jar Breakdown Table */}
      <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-6">
        <h3 className="text-yellow-400 font-bold text-lg mb-4">Detailed Breakdown by Jar</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-yellow-500">
                <th className="text-left text-yellow-400 font-bold py-3 px-4">Jar</th>
                <th className="text-right text-yellow-400 font-bold py-3 px-4">Budget</th>
                <th className="text-right text-yellow-400 font-bold py-3 px-4">Spent</th>
                <th className="text-right text-yellow-400 font-bold py-3 px-4">Remaining</th>
                <th className="text-right text-yellow-400 font-bold py-3 px-4">%</th>
              </tr>
            </thead>
            <tbody>
              {monthData.jarSummary.map((jar) => {
                const percentage = jar.budget > 0 ? (jar.spent / jar.budget) * 100 : 0;
                const statusColor =
                  percentage >= 100 ? 'text-red-400' : percentage >= 80 ? 'text-yellow-400' : 'text-green-300';

                return (
                  <tr key={jar.name} className="border-b border-green-700 hover:bg-green-700">
                    <td className="py-3 px-4 text-yellow-300 font-semibold">{jar.name}</td>
                    <td className="text-right py-3 px-4 text-yellow-300">${jar.budget.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-yellow-300 font-semibold">${jar.spent.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">
                      <span className={jar.remaining >= 0 ? 'text-green-300' : 'text-red-300'}>
                        ${jar.remaining >= 0 ? jar.remaining.toFixed(2) : (-jar.overspent).toFixed(2)}
                      </span>
                    </td>
                    <td className={`text-right py-3 px-4 font-bold ${statusColor}`}>
                      {percentage.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-6">
        <h3 className="text-blue-300 font-bold text-lg mb-4">📊 Key Insights</h3>
        <div className="space-y-3 text-blue-200 text-sm">
          <div className="p-3 bg-blue-800 rounded">
            <p className="font-semibold mb-1">Highest Spending:</p>
            <p>
              {monthData.jarSummary.length > 0
                ? `${monthData.jarSummary.reduce((a, b) => (a.spent > b.spent ? a : b)).name} at $${monthData.jarSummary.reduce((a, b) => (a.spent > b.spent ? a : b)).spent.toFixed(2)}`
                : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-blue-800 rounded">
            <p className="font-semibold mb-1">Budget Adherence:</p>
            <p>
              {monthData.totalBudget > 0
                ? `${((1 - monthData.totalSpent / monthData.totalBudget) * 100).toFixed(1)}% - You are ${monthData.totalSpent > monthData.totalBudget ? 'over' : 'under'} budget`
                : 'N/A'}
            </p>
          </div>
          <div className="p-3 bg-blue-800 rounded">
            <p className="font-semibold mb-1">Transactions:</p>
            <p>{monthData.monthExpenses.length} expense(s) logged this month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
