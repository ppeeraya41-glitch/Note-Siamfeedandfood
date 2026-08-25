import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryInfo, DEFAULT_CATEGORIES } from '../data/categories';
import { Transaction } from '../types';

interface TransactionsViewProps {
  onOpenAddModal: () => void;
  onSelectTransaction?: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
}) => {
  const {
    filteredTransactions,
    deleteTransaction,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    searchQuery,
    setSearchQuery,
  } = useTransactions();
  const { userProfile } = useAuth();
  const currency = userProfile?.currency || '$';

  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  const filterChips = ['All', 'Income', 'Expense', 'Groceries', 'Transport', 'Food', 'Shopping', 'Housing'];

  // Format currency helpers
  const formatAmount = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Group transactions by date relative label (Today, Yesterday, Date)
  const groupedTransactions = React.useMemo<Record<string, Transaction[]>>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((tx) => {
      let groupLabel = tx.date;
      if (tx.date === todayStr) {
        groupLabel = 'Today';
      } else if (tx.date === yesterdayStr) {
        groupLabel = 'Yesterday';
      } else {
        try {
          const dateObj = new Date(tx.date);
          groupLabel = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          });
        } catch {
          groupLabel = tx.date;
        }
      }

      if (!groups[groupLabel]) {
        groups[groupLabel] = [];
      }
      groups[groupLabel].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const handleChipClick = (chip: string) => {
    if (chip === 'All') {
      setSelectedCategoryFilter('All');
      setSelectedTypeFilter('all');
    } else if (chip === 'Income') {
      setSelectedTypeFilter('income');
      setSelectedCategoryFilter('All');
    } else if (chip === 'Expense') {
      setSelectedTypeFilter('expense');
      setSelectedCategoryFilter('All');
    } else {
      setSelectedCategoryFilter(chip);
      setSelectedTypeFilter('all');
    }
  };

  const isChipActive = (chip: string) => {
    if (chip === 'All') {
      return selectedCategoryFilter === 'All' && selectedTypeFilter === 'all';
    }
    if (chip === 'Income') {
      return selectedTypeFilter === 'income' && selectedCategoryFilter === 'All';
    }
    if (chip === 'Expense') {
      return selectedTypeFilter === 'expense' && selectedCategoryFilter === 'All';
    }
    return selectedCategoryFilter.toLowerCase() === chip.toLowerCase();
  };

  return (
    <div id="transactions-view" className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-24 md:pb-12 animate-fadeIn">
      {/* Desktop Search Bar */}
      <div className="hidden md:flex gap-3 items-center bg-[#0d0d0f] p-3 rounded-2xl shadow-sm border border-zinc-800">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[20px]">
            search
          </span>
          <input
            id="desktop-search-input"
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none text-sm text-zinc-100 placeholder:text-zinc-500"
            placeholder="Search by title, category, or notes..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-amber-400"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {filterChips.map((chip) => {
          const active = isChipActive(chip);
          return (
            <button
              key={chip}
              id={`filter-chip-${chip.toLowerCase()}`}
              onClick={() => handleChipClick(chip)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                active
                  ? 'bg-zinc-800 text-amber-400 border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Transactions List Grouped by Date */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="bg-[#0d0d0f] rounded-2xl p-12 text-center border border-zinc-800 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto mb-3 border border-zinc-800">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h4 className="font-serif text-lg font-medium text-zinc-100">No transactions found</h4>
          <p className="font-inter text-xs text-zinc-500 mt-1">
            Try adjusting your search query or filter chips.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('All');
              setSelectedTypeFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([dateLabel, txList]) => (
            <div key={dateLabel} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <h2 className="font-serif text-base font-semibold text-zinc-300">
                  {dateLabel}
                </h2>
                <div className="h-px flex-1 bg-zinc-800"></div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {txList.length} {txList.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              <div className="bg-[#0d0d0f] rounded-2xl shadow-sm border border-zinc-800 overflow-hidden divide-y divide-zinc-800/70">
                {txList.map((tx) => {
                  const catInfo = getCategoryInfo(tx.category);
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      id={`tx-row-${tx.id}`}
                      onClick={() => setSelectedTxForDetail(tx)}
                      className="p-4 flex items-center justify-between hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Icon */}
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

                        {/* Title & Notes */}
                        <div>
                          <h3 className="font-inter text-sm md:text-base font-medium text-zinc-100 group-hover:text-amber-400 transition-colors">
                            {tx.title}
                          </h3>
                          <p className="font-inter text-xs text-zinc-500 line-clamp-1">
                            {tx.notes || tx.category}
                          </p>
                        </div>
                      </div>

                      {/* Amount & Time */}
                      <div className="text-right">
                        <p
                          className={`font-mono text-sm md:text-base font-semibold ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {currency}
                          {formatAmount(tx.amount)}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-500">{tx.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="fab-add-transaction-list"
        onClick={onOpenAddModal}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-black font-bold rounded-full ambient-shadow-level-2 flex items-center justify-center hover:brightness-110 active:scale-90 transition-all z-30 shadow-lg border border-amber-300/40"
        title="Add Transaction"
      >
        <span className="material-symbols-outlined text-[30px] font-bold">add</span>
      </button>

      {/* Transaction Detail & Delete Modal */}
      {selectedTxForDetail && (
        <div
          id="tx-detail-modal-overlay"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTxForDetail(null);
          }}
        >
          <div className="bg-[#0d0d0f] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-800 animate-scaleUp flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${
                  selectedTxForDetail.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {selectedTxForDetail.type}
              </span>
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-center my-2">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Total Amount</p>
              <h3
                className={`font-mono text-3xl font-bold mt-1 ${
                  selectedTxForDetail.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {selectedTxForDetail.type === 'expense' ? '-' : '+'}
                {currency}
                {formatAmount(selectedTxForDetail.amount)}
              </h3>
              <p className="font-serif text-lg font-medium text-zinc-100 mt-1">
                {selectedTxForDetail.title}
              </p>
            </div>

            <div className="bg-zinc-900/80 rounded-xl p-3.5 text-xs space-y-2 border border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500">Category</span>
                <span className="font-medium text-zinc-200">{selectedTxForDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Time</span>
                <span className="font-mono text-zinc-300">
                  {selectedTxForDetail.date} • {selectedTxForDetail.time}
                </span>
              </div>
              {selectedTxForDetail.notes && (
                <div className="flex flex-col pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 mb-0.5">Notes</span>
                  <span className="text-zinc-300">{selectedTxForDetail.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                id="btn-delete-transaction"
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this transaction?')) {
                    await deleteTransaction(selectedTxForDetail.id);
                    setSelectedTxForDetail(null);
                  }
                }}
                className="flex-1 py-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl font-semibold text-xs hover:bg-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete
              </button>
              <button
                onClick={() => setSelectedTxForDetail(null)}
                className="flex-1 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl font-semibold text-xs hover:bg-zinc-700 active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
