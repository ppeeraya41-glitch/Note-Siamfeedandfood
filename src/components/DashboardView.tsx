import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo } from '../data/categories';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onViewAllTransactions: () => void;
  onSelectTransaction?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onViewAllTransactions,
  onSelectTransaction,
}) => {
  const { totalBalance, totalIncome, totalExpense, categoryBreakdowns, topSpentCategory, transactions } =
    useTransactions();
  const { userProfile } = useAuth();
  const currency = userProfile?.currency || '$';

  const recentTransactions = transactions.slice(0, 4);

  // Format currency helpers
  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Conic gradient calculation for the dynamic doughnut chart
  const conicGradientStyle = React.useMemo(() => {
    if (!categoryBreakdowns || categoryBreakdowns.length === 0) {
      return 'conic-gradient(#f59e0b 0% 45%, #f43f5e 45% 75%, #10b981 75% 100%)';
    }
    let currentPct = 0;
    const parts: string[] = [];
    const colors = ['#f59e0b', '#f43f5e', '#10b981', '#38bdf8', '#a855f7', '#fb923c'];

    categoryBreakdowns.slice(0, 5).forEach((cat, idx) => {
      const color = cat.color || colors[idx % colors.length];
      const start = currentPct;
      const end = currentPct + cat.percentage;
      parts.push(`${color} ${start}% ${end}%`);
      currentPct = end;
    });

    if (currentPct < 100 && parts.length > 0) {
      parts.push(`#27272a ${currentPct}% 100%`);
    }

    return `conic-gradient(${parts.join(', ')})`;
  }, [categoryBreakdowns]);

  return (
    <div id="dashboard-view" className="flex flex-col gap-6 md:gap-8 pb-20 md:pb-8 animate-fadeIn">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Hero Card: Total Balance */}
        <section
          id="hero-balance-card"
          className="md:col-span-8 bg-[#0d0d0f] ambient-shadow-level-1 rounded-2xl p-5 md:p-6 flex flex-col justify-between relative overflow-hidden group border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          {/* Ambient Glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/15 transition-colors duration-700 pointer-events-none"></div>

          <div className="z-10 flex flex-col gap-1.5 mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium">
                  Total Balance
                </span>
                <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  USD
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Wallet
              </span>
            </div>
            <p
              id="display-total-balance"
              className="font-serif text-3xl md:text-5xl font-light text-zinc-100 tracking-tight mt-1"
            >
              {currency}
              {formatAmount(totalBalance)}
            </p>
          </div>

          <div className="z-10 grid grid-cols-2 gap-3 md:gap-4 mt-auto">
            {/* Income Sub-card */}
            <div
              id="dashboard-income-card"
              className="bg-zinc-900/50 rounded-xl p-3.5 md:p-4 border border-zinc-800 flex flex-col gap-1 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="material-symbols-outlined text-base">arrow_upward</span>
                <span className="font-inter text-xs uppercase tracking-wider font-semibold">
                  Income
                </span>
              </div>
              <p className="font-mono text-lg md:text-xl font-semibold text-zinc-100">
                +{currency}
                {formatAmount(totalIncome)}
              </p>
            </div>

            {/* Expenses Sub-card */}
            <div
              id="dashboard-expenses-card"
              className="bg-zinc-900/50 rounded-xl p-3.5 md:p-4 border border-zinc-800 flex flex-col gap-1 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-1 text-rose-400">
                <span className="material-symbols-outlined text-base">arrow_downward</span>
                <span className="font-inter text-xs uppercase tracking-wider font-semibold">
                  Expenses
                </span>
              </div>
              <p className="font-mono text-lg md:text-xl font-semibold text-zinc-100">
                -{currency}
                {formatAmount(totalExpense)}
              </p>
            </div>
          </div>
        </section>

        {/* Chart Card: Spending by Category */}
        <section
          id="spending-by-category-card"
          className="md:col-span-4 bg-[#0d0d0f] ambient-shadow-level-1 rounded-2xl p-5 md:p-6 flex flex-col border border-zinc-800 hover:border-zinc-700 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-lg font-medium text-zinc-100">
              Spending by Category
            </h3>
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
              Breakdown
            </span>
          </div>

          {/* Doughnut Chart with Center Cutout */}
          <div className="flex-grow flex items-center justify-center py-4 relative">
            <div
              className="w-40 h-40 rounded-full relative flex items-center justify-center shadow-inner transition-transform hover:scale-105 duration-300 ring-4 ring-zinc-900"
              style={{ background: conicGradientStyle }}
            >
              {/* Center cutout */}
              <div className="w-28 h-28 bg-[#0d0d0f] rounded-full absolute flex flex-col items-center justify-center shadow-sm border border-zinc-800">
                <span className="font-inter text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Top Spent</span>
                <span className="font-serif text-base font-bold text-amber-400 truncate max-w-[90px] px-1">
                  {topSpentCategory.name}
                </span>
                <span className="font-mono text-xs text-zinc-400 font-semibold">
                  {topSpentCategory.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 mt-2">
            {(categoryBreakdowns.length > 0 ? categoryBreakdowns.slice(0, 3) : [
              { category: 'Food', percentage: 45, color: '#f59e0b' },
              { category: 'Rent', percentage: 30, color: '#f43f5e' },
              { category: 'Transport', percentage: 25, color: '#10b981' },
            ]).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-900/40 border border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="font-inter text-zinc-300 font-medium">{cat.category}</span>
                </div>
                <span className="font-mono font-semibold text-zinc-100">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Transactions Section */}
      <section id="recent-transactions-section" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-medium text-zinc-100">
              Recent Transactions
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              Live Log
            </span>
          </div>
          <button
            id="btn-view-all-transactions"
            onClick={onViewAllTransactions}
            className="text-amber-400 hover:text-amber-300 font-inter text-xs font-semibold hover:underline flex items-center gap-1 active:scale-95 transition-all"
          >
            View All
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {recentTransactions.length === 0 ? (
            <div className="bg-[#0d0d0f] rounded-2xl p-8 text-center border border-zinc-800">
              <p className="text-sm text-zinc-500">No transactions recorded yet.</p>
              <button
                onClick={onOpenAddModal}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg text-xs hover:brightness-110 transition-all shadow-sm"
              >
                Add Your First Transaction
              </button>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const catInfo = getCategoryInfo(tx.category);
              const isExpense = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  id={`transaction-item-${tx.id}`}
                  onClick={() => onSelectTransaction?.(tx.id)}
                  className="bg-[#0d0d0f] ambient-shadow-level-1 rounded-xl p-3.5 flex items-center justify-between hover:bg-zinc-900/80 hover:border-zinc-700 transition-all cursor-pointer border border-zinc-800 group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isExpense
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/40'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {catInfo.icon}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-inter text-sm md:text-base font-medium text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {tx.title}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        {tx.time} • {tx.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-base md:text-lg font-semibold ${
                      isExpense ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {currency}
                    {formatAmount(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Floating Action Button (Quick Add) */}
      <button
        id="fab-add-transaction"
        onClick={onOpenAddModal}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-black font-bold rounded-full ambient-shadow-level-2 flex items-center justify-center hover:brightness-110 active:scale-90 transition-all z-30 shadow-lg border border-amber-300/40"
        title="Add Transaction"
      >
        <span className="material-symbols-outlined text-[30px] font-bold">add</span>
      </button>
    </div>
  );
};
