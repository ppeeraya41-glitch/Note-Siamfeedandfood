import React from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: 'dashboard' | 'transactions' | 'statistics' | 'profile';
  setCurrentTab: (tab: 'dashboard' | 'transactions' | 'statistics' | 'profile') => void;
  onOpenNotifications: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenFilterDialog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNotifications,
  searchQuery,
  setSearchQuery,
  onOpenFilterDialog,
}) => {
  const { userProfile } = useAuth();

  return (
    <>
      {/* Desktop TopAppBar */}
      <header id="desktop-header" className="bg-[#0d0d0f] shadow-sm w-full top-0 sticky z-40 hidden md:block border-b border-zinc-800">
        <div className="flex items-center justify-between px-6 max-w-7xl mx-auto h-16 w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center text-black font-bold shadow-sm">
              FP
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-serif italic text-zinc-100 tracking-tight leading-tight">
                Fiscal Precision
              </span>
              <span className="text-[10px] font-mono text-amber-500/90 leading-none">
                PPeeraya Cloud
              </span>
            </div>
          </div>

          {/* Web Navigation Cluster */}
          <nav className="flex items-center gap-2">
            <button
              id="nav-tab-dashboard"
              onClick={() => setCurrentTab('dashboard')}
              className={`font-inter text-xs flex items-center gap-2 transition-all py-1.5 px-3 rounded-lg border ${
                currentTab === 'dashboard'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${currentTab === 'dashboard' ? 'text-amber-400' : ''}`}>
                dashboard
              </span>
              Dashboard
            </button>

            <button
              id="nav-tab-transactions"
              onClick={() => setCurrentTab('transactions')}
              className={`font-inter text-xs flex items-center gap-2 transition-all py-1.5 px-3 rounded-lg border ${
                currentTab === 'transactions'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${currentTab === 'transactions' ? 'text-amber-400' : ''}`}>
                receipt_long
              </span>
              Transactions
            </button>

            <button
              id="nav-tab-statistics"
              onClick={() => setCurrentTab('statistics')}
              className={`font-inter text-xs flex items-center gap-2 transition-all py-1.5 px-3 rounded-lg border ${
                currentTab === 'statistics'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${currentTab === 'statistics' ? 'text-amber-400' : ''}`}>
                leaderboard
              </span>
              Statistics
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setCurrentTab('profile')}
              className={`font-inter text-xs flex items-center gap-2 transition-all py-1.5 px-3 rounded-lg border ${
                currentTab === 'profile'
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${currentTab === 'profile' ? 'text-amber-400' : ''}`}>
                account_circle
              </span>
              Profile
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {/* Project / User Pill Badge */}
            <div 
              id="desktop-user-badge"
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2.5 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold ring-1 ring-amber-500/40">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>P</span>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-300 truncate max-w-[140px]">
                {userProfile?.email || 'p.peeraya41@gmail.com'}
              </span>
            </div>

            <button
              id="btn-desktop-notifications"
              onClick={onOpenNotifications}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 p-2 rounded-full relative transition-all active:scale-95 border border-zinc-800"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-[#0d0d0f]"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header id="mobile-header" className="bg-[#0d0d0f] shadow-sm w-full top-0 sticky z-40 md:hidden border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 h-14 w-full">
          <div 
            id="mobile-user-avatar"
            onClick={() => setCurrentTab('profile')}
            className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-700 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0 active:scale-95 transition-transform cursor-pointer shadow-sm"
          >
            FP
          </div>

          <div className="flex flex-col items-center">
            <h1 className="font-serif italic text-lg font-bold text-zinc-100 tracking-tight leading-tight">
              Fiscal Precision
            </h1>
            <span className="text-[9px] font-mono text-amber-500 leading-none">
              PPeeraya Cloud
            </span>
          </div>

          <button
            id="btn-mobile-notifications"
            onClick={onOpenNotifications}
            className="text-zinc-400 hover:text-zinc-100 active:scale-90 p-2 rounded-full relative border border-zinc-800 bg-zinc-900"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 ring-2 ring-[#0d0d0f]"></span>
          </button>
        </div>

        {/* Dynamic sub-header for Transactions tab with search & filter */}
        {currentTab === 'transactions' && setSearchQuery && (
          <div className="px-4 pb-3 pt-1 flex gap-2 bg-[#0d0d0f]">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px]">
                search
              </span>
              <input
                id="search-transactions-input"
                className="w-full pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors text-xs text-zinc-200 placeholder:text-zinc-500"
                placeholder="Search transactions..."
                type="text"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {onOpenFilterDialog && (
              <button
                id="btn-filter-tune"
                onClick={onOpenFilterDialog}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors text-zinc-400 active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
