import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo } from '../data/categories';

export const StatisticsView: React.FC = () => {
  const { totalIncome, totalExpense, categoryBreakdowns, monthlyStats } = useTransactions();
  const { userProfile, updateProfile } = useAuth();
  const currency = userProfile?.currency || '$';
  const monthlyBudget = userProfile?.monthlyBudget || 3000;

  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [tempBudget, setTempBudget] = useState<string>(monthlyBudget.toString());
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

  const netBalance = totalIncome - totalExpense;
  const budgetUsagePercent = Math.min(100, Math.round((totalExpense / (monthlyBudget || 1)) * 100));

  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      await updateProfile({ monthlyBudget: val });
    }
    setIsEditingBudget(false);
  };

  // Sample static & dynamic category data for breakdown
  const displayCategories = categoryBreakdowns.length > 0
    ? categoryBreakdowns
    : [
        { category: 'Housing', amount: 1200, percentage: 95, icon: 'home', color: '#86EFAC', count: 1 },
        { category: 'Food & Dining', amount: 450, percentage: 75, icon: 'restaurant', color: '#86EFAC', count: 3 },
        { category: 'Transportation', amount: 200, percentage: 40, icon: 'directions_car', color: '#86EFAC', count: 2 },
        { category: 'Shopping', amount: 150, percentage: 60, icon: 'shopping_bag', color: '#86EFAC', count: 1 },
      ];

  return (
    <div id="statistics-view" className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-24 md:pb-12 animate-fadeIn">
      {/* Header & Tabs */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-zinc-100">
            Statistics & Analytics
          </h1>
          <p className="font-inter text-xs text-zinc-500 mt-0.5">
            Real-time financial performance & budget targets
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-[#0d0d0f] p-1 rounded-xl flex gap-1 w-full max-w-xs border border-zinc-800">
          <button
            id="tab-period-weekly"
            onClick={() => setPeriod('weekly')}
            className={`flex-1 py-1.5 text-center rounded-lg font-inter text-xs transition-all ${
              period === 'weekly'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Weekly
          </button>
          <button
            id="tab-period-monthly"
            onClick={() => setPeriod('monthly')}
            className={`flex-1 py-1.5 text-center rounded-lg font-inter text-xs transition-all ${
              period === 'monthly'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Monthly
          </button>
          <button
            id="tab-period-yearly"
            onClick={() => setPeriod('yearly')}
            className={`flex-1 py-1.5 text-center rounded-lg font-inter text-xs transition-all ${
              period === 'yearly'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Yearly
          </button>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Main Chart Area */}
        <div
          id="net-balance-chart-card"
          className="md:col-span-8 bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-5 md:p-6 flex flex-col gap-4 border border-zinc-800"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-medium">Net Flow</span>
              <p className="font-serif text-2xl md:text-4xl font-light text-zinc-100 mt-1">
                {netBalance >= 0 ? '+' : '-'}
                {currency}
                {formatAmount(Math.abs(netBalance || 4250.0))}
              </p>
            </div>
            <div className="flex gap-1.5 items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>12% vs Last Month</span>
            </div>
          </div>

          {/* Dynamic Interactive Bar Chart */}
          <div className="mt-4 flex-1 min-h-[220px] flex items-end justify-between gap-3 px-2 pb-8 border-b border-zinc-800 relative">
            {/* Y Axis Guide */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-zinc-500 opacity-60 pb-8 pointer-events-none hidden sm:flex font-mono">
              <span>$8k</span>
              <span>$4k</span>
              <span>$0</span>
            </div>

            {monthlyStats.map((item, idx) => {
              const incomeHeight = Math.min(95, Math.max(20, (item.income / 9000) * 100));
              const expenseHeight = Math.min(90, Math.max(15, (item.expense / 9000) * 100));
              const isLast = idx === monthlyStats.length - 1;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredMonth(item.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex flex-col justify-end items-center gap-1.5 h-full flex-1 group cursor-pointer relative pl-6 sm:pl-0"
                >
                  {/* Income bar */}
                  <div
                    className={`w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${
                      isLast ? 'ring-2 ring-emerald-400/40' : 'opacity-90'
                    }`}
                    style={{ height: `${incomeHeight}%` }}
                  ></div>

                  {/* Expense bar */}
                  <div
                    className={`w-full max-w-[20px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${
                      isLast ? 'ring-2 ring-rose-400/40' : 'opacity-90'
                    }`}
                    style={{ height: `${expenseHeight}%` }}
                  ></div>

                  {/* Label */}
                  <span
                    className={`text-xs absolute -bottom-6 font-mono ${
                      isLast ? 'text-amber-400 font-semibold' : 'text-zinc-500'
                    }`}
                  >
                    {item.month}
                  </span>

                  {/* Tooltip on Hover */}
                  {hoveredMonth === item.month && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none animate-fadeIn font-mono">
                      <p className="text-emerald-400">Income: +{currency}{formatAmount(item.income)}</p>
                      <p className="text-rose-400">Expense: -{currency}{formatAmount(item.expense)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex gap-6 justify-center mt-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              <span className="text-zinc-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <span className="text-zinc-400">Expenses</span>
            </div>
          </div>
        </div>

        {/* Total Expenses Summary */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div
            id="budget-limit-card"
            className="bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-5 md:p-6 flex flex-col justify-between border border-zinc-800"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Expenses vs Budget</span>
                <button
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  {isEditingBudget ? 'Cancel' : 'Edit Budget'}
                </button>
              </div>
              <p className="font-serif text-2xl md:text-3xl font-light text-rose-400 mt-1">
                {currency}
                {formatAmount(totalExpense || 2450.0)}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {isEditingBudget ? (
                <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <label className="text-xs text-zinc-300 font-medium">Monthly Budget Goal</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-black border border-zinc-700 rounded-lg text-zinc-100 focus:border-amber-500 outline-none"
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-lg text-xs font-bold shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-inter text-xs text-zinc-500">Budget Limit</span>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    {currency}
                    {formatAmount(monthlyBudget)}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePercent > 90
                      ? 'bg-rose-500'
                      : budgetUsagePercent > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetUsagePercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-zinc-400 text-right font-mono">
                {budgetUsagePercent}% Used
              </p>
            </div>
          </div>

          {/* Quick Tip Widget */}
          <div className="bg-[#0d0d0f] rounded-2xl p-4 border border-zinc-800 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <div>
              <p className="font-medium text-zinc-200">Spending Insight</p>
              <p className="text-zinc-400 mt-0.5">
                Financial habits tracked reliably via <span className="text-amber-400 font-mono">PPeeraya Firebase Cloud</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section
        id="category-breakdown-section"
        className="bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-5 md:p-6 border border-zinc-800"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-lg font-medium text-zinc-100">
            Category Breakdown
          </h3>
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-amber-400 hover:text-amber-300 font-inter text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            {showAllCategories ? 'Show Less' : 'See All'}{' '}
            <span className="material-symbols-outlined text-sm">
              {showAllCategories ? 'expand_less' : 'chevron_right'}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {(showAllCategories ? displayCategories : displayCategories.slice(0, 4)).map((item) => {
            const catInfo = getCategoryInfo(item.category);
            const percent = item.percentage || Math.min(100, Math.round((item.amount / (totalExpense || 1)) * 100));

            return (
              <div key={item.category} className="flex items-center gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 group-hover:border-amber-500/50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon || catInfo.icon}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-inter font-medium text-zinc-200">{item.category}</span>
                    <span className="font-mono font-semibold text-zinc-100">
                      {currency}
                      {formatAmount(item.amount)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
