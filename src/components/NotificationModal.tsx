import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { totalExpense } = useTransactions();
  const { userProfile } = useAuth();
  const currency = userProfile?.currency || '$';
  const monthlyBudget = userProfile?.monthlyBudget || 3000;

  if (!isOpen) return null;

  const budgetUsagePercent = Math.round((totalExpense / (monthlyBudget || 1)) * 100);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Budget Alert',
      message: `You've used ${budgetUsagePercent}% of your monthly ${currency}${monthlyBudget.toLocaleString()} limit.`,
      time: '10 mins ago',
      icon: 'info',
      color: budgetUsagePercent > 80 ? 'text-[#8f4953] bg-[#FDA4AF]/30' : 'text-[#006d3e] bg-[#86EFAC]/30',
    },
    {
      id: 'notif-2',
      title: 'Cloud Sync Successful',
      message: 'Your transactions have been synchronized to Firebase Firestore.',
      time: '1 hour ago',
      icon: 'cloud_done',
      color: 'text-[#4b5a9c] bg-[#A5B4FC]/30',
    },
    {
      id: 'notif-3',
      title: 'Income Logged',
      message: 'Acme Corp Salary direct deposit was successfully recorded.',
      time: 'Yesterday',
      icon: 'payments',
      color: 'text-[#006d3e] bg-[#86EFAC]/30',
    },
  ];

  return (
    <div
      id="notification-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center md:justify-end p-4 md:p-8 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0d0d0f] text-zinc-300 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-zinc-800 mt-12 md:mt-10 animate-scaleUp flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">notifications</span>
            <h3 className="font-serif text-base font-medium text-zinc-100">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-start gap-3 hover:border-zinc-700 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-serif text-xs font-medium text-zinc-100">{n.title}</p>
                <p className="font-inter text-xs text-zinc-400 mt-0.5">{n.message}</p>
                <p className="font-mono text-[10px] text-zinc-500 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-serif rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-sm"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};
