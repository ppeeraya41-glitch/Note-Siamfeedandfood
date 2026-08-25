import React from 'react';

interface BottomNavProps {
  currentTab: 'dashboard' | 'transactions' | 'statistics' | 'profile';
  setCurrentTab: (tab: 'dashboard' | 'transactions' | 'statistics' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden bg-[#0d0d0f]/95 backdrop-blur-md border-t border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.7)] fixed bottom-0 left-0 w-full z-40 rounded-t-2xl pb-6 pt-2 px-3 transition-all"
    >
      <div className="flex justify-around items-center w-full max-w-md mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          id="mobile-tab-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
            currentTab === 'dashboard'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 rounded-xl px-4 py-1.5 shadow-sm font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 px-3'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentTab === 'dashboard' ? 'icon-filled text-amber-400' : ''
            }`}
          >
            dashboard
          </span>
          <span className="font-inter text-[11px] leading-tight mt-0.5">
            Dashboard
          </span>
        </button>

        {/* Tab 2: Transactions */}
        <button
          id="mobile-tab-transactions"
          onClick={() => setCurrentTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
            currentTab === 'transactions'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 rounded-xl px-4 py-1.5 shadow-sm font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 px-3'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentTab === 'transactions' ? 'icon-filled text-amber-400' : ''
            }`}
          >
            receipt_long
          </span>
          <span className="font-inter text-[11px] leading-tight mt-0.5">
            Transactions
          </span>
        </button>

        {/* Tab 3: Statistics */}
        <button
          id="mobile-tab-statistics"
          onClick={() => setCurrentTab('statistics')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
            currentTab === 'statistics'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 rounded-xl px-4 py-1.5 shadow-sm font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 px-3'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentTab === 'statistics' ? 'icon-filled text-amber-400' : ''
            }`}
          >
            leaderboard
          </span>
          <span className="font-inter text-[11px] leading-tight mt-0.5">
            Statistics
          </span>
        </button>

        {/* Tab 4: Profile */}
        <button
          id="mobile-tab-profile"
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
            currentTab === 'profile'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 rounded-xl px-4 py-1.5 shadow-sm font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 px-3'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              currentTab === 'profile' ? 'icon-filled text-amber-400' : ''
            }`}
          >
            account_circle
          </span>
          <span className="font-inter text-[11px] leading-tight mt-0.5">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
