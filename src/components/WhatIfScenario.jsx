import React, { useState, useMemo } from 'react';

export default function WhatIfScenario({ jars, expenses, goals }) {
  const [reductions, setReductions] = useState({});

  // Calculate current month spending by jar
  const getMonthSpending = (jarId) => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const eDate = new Date(e.date);
        return e.jar_id === jarId && eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  // Calculate savings scenarios
  const scenarios = useMemo(() => {
    const results = {};

    // For each jar with reductions
    let totalCurrentSpending = 0;
    let totalProjectedSpending = 0;

    Object.entries(reductions).forEach(([jarId, reduction]) => {
      const currentSpending = getMonthSpending(jarId);
      const savings = (currentSpending * reduction) / 100;
      const projected = currentSpending - savings;

      results[jarId] = {
        current: currentSpending,
        reduction,
        savings,
        projected,
      };

      totalCurrentSpending += currentSpending;
      totalProjectedSpending += projected;
    });

    return {
      byJar: results,
      totalSavings: totalCurrentSpending - totalProjectedSpending,
      totalCurrent: totalCurrentSpending,
      totalProjected: totalProjectedSpending,
    };
  }, [reductions, expenses]);

  const handleReductionChange = (jarId, value) => {
    setReductions({
      ...reductions,
      [jarId]: parseFloat(value),
    });
  };

  const DEFAULT_JARS = [
    { name: 'Bills', color: '#DC2626' },
    { name: 'Investment', color: '#2563EB' },
    { name: 'Education', color: '#8B5CF6' },
    { name: 'Play', color: '#F59E0B' },
    { name: 'Give', color: '#10B981' },
    { name: 'Savings', color: '#06B6D4' },
  ];

  const jarList = jars.length > 0 ? jars : DEFAULT_JARS;

  return (
    <div className="space-y-8">
      <div className="bg-green-800 border-2 border-yellow-500 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">📊 What-If Savings Scenario</h2>
        <p className="text-yellow-300 mb-8">
          Use the sliders below to explore how much you could save by reducing spending in each category.
        </p>

        {/* Scenario Controls */}
        <div className="space-y-6 mb-8">
          {jarList.map((jar) => {
            const jarId = jar.id || jar.name;
            const currentSpending = getMonthSpending(jarId);
            const reduction = reductions[jarId] || 0;
            const scenarioData = scenarios.byJar[jarId];

            return (
              <div key={jarId} className="bg-green-900 rounded-lg p-6 border border-yellow-500">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-yellow-400">{jar.name}</h3>
                  <span className="text-yellow-300 font-semibold">
                    Current: ${currentSpending.toFixed(2)}
                  </span>
                </div>

                {/* Slider */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={reduction}
                    onChange={(e) => handleReductionChange(jarId, e.target.value)}
                    className="w-full h-3 bg-green-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                  <div className="flex justify-between text-yellow-300 text-sm mt-2">
                    <span>0%</span>
                    <span className="font-bold text-yellow-400">{reduction}%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Projection */}
                {reduction > 0 && (
                  <div className="bg-green-800 rounded p-4 space-y-2">
                    <div className="flex justify-between text-yellow-300">
                      <span>Potential Savings:</span>
                      <span className="font-bold text-green-300">
                        ${scenarioData.savings.toFixed(2)}/month
                      </span>
                    </div>
                    <div className="flex justify-between text-yellow-300">
                      <span>Projected New Spending:</span>
                      <span className="font-bold text-yellow-400">
                        ${scenarioData.projected.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-200 mt-2">
                      💡 If you cut {jar.name.toLowerCase()} by {reduction}%, you'd save{' '}
                      <strong>${scenarioData.savings.toFixed(2)}</strong> this month.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Impact */}
        {scenarios.totalSavings > 0 && (
          <div className="bg-yellow-900 border-2 border-yellow-400 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">📈 Total Monthly Impact</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-yellow-800 rounded-lg p-4">
                <p className="text-yellow-200 text-sm mb-2">Current Total Spending</p>
                <p className="text-3xl font-bold text-yellow-300">
                  ${scenarios.totalCurrent.toFixed(2)}
                </p>
              </div>

              <div className="bg-green-900 rounded-lg p-4">
                <p className="text-green-200 text-sm mb-2">Potential Savings</p>
                <p className="text-3xl font-bold text-green-300">
                  ${scenarios.totalSavings.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-900 rounded-lg p-4">
                <p className="text-blue-200 text-sm mb-2">Projected New Total</p>
                <p className="text-3xl font-bold text-blue-300">
                  ${scenarios.totalProjected.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Annual Projection */}
            <div className="mt-6 p-4 bg-green-900 rounded-lg border border-green-400">
              <p className="text-green-200 mb-2">
                💰 <strong>Annual Savings Projection:</strong> If you maintain these reductions for a full year, you could save:
              </p>
              <p className="text-4xl font-bold text-green-300">
                ${(scenarios.totalSavings * 12).toFixed(2)}/year
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {scenarios.totalSavings === 0 && (
          <div className="text-center py-12">
            <p className="text-yellow-300 text-lg mb-2">🎯 Explore your savings potential</p>
            <p className="text-yellow-200 text-sm">
              Move the sliders above to see how much you could save by reducing spending in each category.
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-900 border border-blue-400 rounded-lg p-6">
          <h4 className="text-blue-300 font-bold mb-3">💡 Smart Reduction Tips</h4>
          <ul className="text-blue-200 text-sm space-y-2">
            <li>• Start with 5-10% reductions to find sustainable habits</li>
            <li>• Focus on the categories with highest spending first</li>
            <li>• Small cuts across multiple categories add up faster</li>
            <li>• Track your actual spending to see if you meet these targets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
