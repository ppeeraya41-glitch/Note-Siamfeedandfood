/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { StatisticsView } from './components/StatisticsView';
import { ProfileView } from './components/ProfileView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { NotificationModal } from './components/NotificationModal';
import { FilterTuneModal } from './components/FilterTuneModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'transactions' | 'statistics' | 'profile'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  const { searchQuery, setSearchQuery } = useTransactions();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col font-inter selection:bg-amber-500/30">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFilterDialog={() => setIsFilterModalOpen(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 md:py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewAllTransactions={() => setCurrentTab('transactions')}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsView
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {currentTab === 'statistics' && <StatisticsView />}

        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Filter Tune Modal */}
      <FilterTuneModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <MainAppContent />
      </TransactionProvider>
    </AuthProvider>
  );
}
