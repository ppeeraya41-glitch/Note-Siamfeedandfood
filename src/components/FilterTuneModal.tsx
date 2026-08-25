import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../data/categories';

interface FilterTuneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterTuneModal: React.FC<FilterTuneModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    searchQuery,
    setSearchQuery,
  } = useTransactions();

  if (!isOpen) return null;

  return (
    <div
      id="filter-tune-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0d0d0f] text-zinc-300 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-zinc-800 animate-scaleUp flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">tune</span>
            <h3 className="font-serif text-base font-medium text-zinc-100">Filter Records</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Type Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase text-zinc-400 tracking-wider">
            Transaction Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`py-1.5 text-xs rounded-lg font-mono transition-all ${
                selectedTypeFilter === 'all'
                  ? 'bg-zinc-800 text-amber-400 font-bold border border-zinc-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTypeFilter('income')}
              className={`py-1.5 text-xs rounded-lg font-mono transition-all ${
                selectedTypeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setSelectedTypeFilter('expense')}
              className={`py-1.5 text-xs rounded-lg font-mono transition-all ${
                selectedTypeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase text-zinc-400 tracking-wider">
            Category
          </label>
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategoryFilter('All')}
              className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                selectedCategoryFilter === 'All'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`p-2 rounded-xl text-xs font-medium border text-center flex flex-col items-center gap-1 transition-all ${
                  selectedCategoryFilter.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span className="truncate w-full">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={() => {
              setSelectedCategoryFilter('All');
              setSelectedTypeFilter('all');
              setSearchQuery('');
              onClose();
            }}
            className="flex-1 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-medium hover:bg-zinc-800 border border-zinc-800"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-serif rounded-xl text-xs font-bold shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
