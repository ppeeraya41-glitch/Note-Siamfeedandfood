import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useTransactions();
  const { userProfile } = useAuth();
  const currency = userProfile?.currency || '$';

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAddCustomCat, setShowAddCustomCat] = useState<boolean>(false);
  const [customCatName, setCustomCatName] = useState<string>('');

  if (!isOpen) return null;

  // Numpad key handlers
  const handleAppendNumber = (num: string) => {
    if (amountStr === '0' && num !== '.') {
      setAmountStr(num);
    } else {
      if (amountStr.length < 10) {
        if (amountStr.includes('.')) {
          const decimals = amountStr.split('.')[1];
          if (decimals && decimals.length >= 2) return;
        }
        setAmountStr((prev) => prev + num);
      }
    }
  };

  const handleAppendDecimal = () => {
    if (!amountStr.includes('.')) {
      setAmountStr((prev) => prev + '.');
    }
  };

  const handleDeleteNumber = () => {
    if (amountStr.length > 1) {
      setAmountStr((prev) => prev.slice(0, -1));
    } else {
      setAmountStr('0');
    }
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const finalTitle = title.trim() || (type === 'income' ? `${selectedCategory} Income` : selectedCategory);

    try {
      await addTransaction({
        type,
        amount: numAmount,
        category: selectedCategory,
        title: finalTitle,
        date: date || new Date().toISOString().split('T')[0],
        time: timeFormatted,
        notes: notes.trim() || undefined,
      });

      // Confetti effect!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#A5B4FC', '#FDA4AF', '#86EFAC', '#4b5a9c'],
      });

      onClose();
      // Reset form
      setAmountStr('0');
      setTitle('');
      setNotes('');
      setSelectedCategory('Food');
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-transaction-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="add-transaction-modal-container"
        className="bg-[#0d0d0f] text-zinc-300 w-full max-w-lg min-h-screen md:min-h-[auto] md:max-h-[90vh] md:rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Top Header */}
        <header className="bg-[#0d0d0f] w-full top-0 sticky z-20 border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 h-14 w-full">
            <button
              id="btn-close-new-transaction"
              onClick={onClose}
              type="button"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all border border-zinc-800"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div className="font-serif text-lg font-medium text-zinc-100 text-center flex-1">
              New Record
            </div>
            <div className="w-9 h-9"></div>
          </div>
        </header>

        {/* Top Half: Amount Input & Type Selector */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-[#0d0d0f] z-10 border-b border-zinc-800">
          {/* Income / Expense Toggle */}
          <div className="flex p-1 bg-zinc-900 rounded-xl mb-4 max-w-[240px] mx-auto border border-zinc-800">
            <button
              id="btn-toggle-expense"
              type="button"
              onClick={() => {
                setType('expense');
                if (selectedCategory === 'Salary') setSelectedCategory('Food');
              }}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Expense
            </button>
            <button
              id="btn-toggle-income"
              type="button"
              onClick={() => {
                setType('income');
                setSelectedCategory('Salary');
              }}
              className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all duration-200 ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Display */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest font-semibold mb-1">
              AMOUNT
            </div>
            <div className="flex items-center justify-center relative">
              <span
                id="currency-symbol-display"
                className={`font-serif text-3xl md:text-5xl font-light mr-1.5 transition-colors duration-200 ${
                  type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {currency}
              </span>
              <span
                id="modal-amount-display"
                className="font-serif text-3xl md:text-5xl font-light text-zinc-100 tracking-tight transition-colors duration-200"
              >
                {amountStr}
              </span>
              <span className="font-mono text-3xl md:text-4xl text-amber-500 cursor-blink font-light ml-0.5">
                |
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Middle: Details (Category, Title, Date, Notes) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
          {/* Title input */}
          <div>
            <label className="block font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Title / Merchant
            </label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 focus-within:border-amber-500/80 transition-all shadow-sm">
              <span className="material-symbols-outlined text-zinc-500 text-[18px] mr-2.5">
                storefront
              </span>
              <input
                id="transaction-title-input"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-zinc-100 font-inter text-sm placeholder-zinc-600 outline-none"
                placeholder={type === 'expense' ? 'e.g. Whole Foods Market' : 'e.g. Acme Corp Salary'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Category
              </label>
              {showAddCustomCat ? (
                <button
                  onClick={() => setShowAddCustomCat(false)}
                  className="text-xs text-zinc-500 hover:underline"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            {showAddCustomCat ? (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Custom Category name"
                  value={customCatName}
                  onChange={(e) => setCustomCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-black border border-zinc-700 rounded-lg text-zinc-100 outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customCatName.trim()) {
                      setSelectedCategory(customCatName.trim());
                      setCustomCatName('');
                      setShowAddCustomCat(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-lg text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            ) : null}

            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar px-0.5">
              {DEFAULT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    id={`cat-chip-${cat.id}`}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {cat.icon}
                    </span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}

              {/* Add custom category chip */}
              <button
                type="button"
                id="btn-add-custom-cat"
                onClick={() => setShowAddCustomCat(true)}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-900 text-zinc-400 border border-dashed border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                title="Add custom category"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 focus-within:border-amber-500/80 transition-all shadow-sm">
                <span className="material-symbols-outlined text-zinc-500 text-[18px] mr-2.5">
                  calendar_today
                </span>
                <input
                  id="transaction-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-zinc-100 font-mono text-xs outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 focus-within:border-amber-500/80 transition-all shadow-sm">
                <span className="material-symbols-outlined text-zinc-500 text-[18px] mr-2.5">
                  edit_note
                </span>
                <input
                  id="transaction-notes-input"
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-zinc-100 font-inter text-sm placeholder-zinc-600 outline-none"
                  placeholder="Optional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Numpad & Action Button */}
        <div className="flex-shrink-0 bg-[#0d0d0f] border-t border-zinc-800 p-4 z-20">
          {/* Numpad Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3 max-w-sm mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                id={`numpad-key-${digit}`}
                onClick={() => handleAppendNumber(digit)}
                className="h-11 rounded-xl font-mono text-base font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 active:scale-95 transition-all flex items-center justify-center shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              id="numpad-key-dot"
              onClick={handleAppendDecimal}
              className="h-11 rounded-xl font-mono text-base font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center shadow-xs"
            >
              .
            </button>
            <button
              type="button"
              id="numpad-key-0"
              onClick={() => handleAppendNumber('0')}
              className="h-11 rounded-xl font-mono text-base font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              id="numpad-key-backspace"
              onClick={handleDeleteNumber}
              className="h-11 rounded-xl font-mono text-base font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center shadow-xs"
            >
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            id="btn-save-transaction"
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="w-full max-w-sm mx-auto h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-serif text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined icon-filled text-[20px]">check_circle</span>
            {isSubmitting ? 'Saving...' : 'Commit Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};
