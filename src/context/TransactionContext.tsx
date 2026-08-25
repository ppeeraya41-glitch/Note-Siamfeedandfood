import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Transaction, TransactionType } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BASE_BALANCE } from '../data/initialData';

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

interface MonthlyStat {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  isSyncing: boolean;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categoryBreakdowns: CategoryBreakdown[];
  topSpentCategory: { name: string; amount: number; percentage: number };
  monthlyStats: MonthlyStat[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  selectedTypeFilter: 'all' | 'income' | 'expense';
  setSelectedTypeFilter: (type: 'all' | 'income' | 'expense') => void;
  filteredTransactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  exportDataAsCSV: () => void;
  exportDataAsJSON: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'fiscal_precision_local_txs';

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Firestore Sync Listener
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setLoading(false);
      return;
    }

    setIsSyncing(true);
    const userTxsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(userTxsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty for this user, seed with initial transactions
          try {
            const batch = writeBatch(db);
            INITIAL_TRANSACTIONS.forEach((tx) => {
              const newDocRef = doc(userTxsRef);
              batch.set(newDocRef, { ...tx, id: newDocRef.id, userId: user.uid });
            });
            await batch.commit();
          } catch (seedErr) {
            console.warn('Could not seed initial data to Firestore:', seedErr);
            setTransactions(INITIAL_TRANSACTIONS);
          }
        } else {
          const list: Transaction[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Transaction, 'id'>),
          }));
          setTransactions(list);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        }
        setLoading(false);
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Firestore subscription error (fallback to local):', err);
        setLoading(false);
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Persist locally for non-logged in or offline sessions
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Financial calculations
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalBalance = useMemo(() => {
    return INITIAL_BASE_BALANCE + totalIncome - totalExpense;
  }, [totalIncome, totalExpense]);

  // Category breakdown for expenses
  const categoryBreakdowns = useMemo<CategoryBreakdown[]>(() => {
    const expenseMap = new Map<string, { amount: number; count: number }>();
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 1;

    expenseTxs.forEach((t) => {
      const cat = t.category || 'Other';
      const existing = expenseMap.get(cat) || { amount: 0, count: 0 };
      expenseMap.set(cat, {
        amount: existing.amount + Number(t.amount || 0),
        count: existing.count + 1,
      });
    });

    const categoryColors: Record<string, { color: string; icon: string }> = {
      Food: { color: '#A5B4FC', icon: 'restaurant' },
      Rent: { color: '#FDA4AF', icon: 'home' },
      Housing: { color: '#86EFAC', icon: 'home' },
      Transport: { color: '#86EFAC', icon: 'directions_car' },
      Shopping: { color: '#FDA4AF', icon: 'shopping_bag' },
      Bills: { color: '#dde1ff', icon: 'bolt' },
      Groceries: { color: '#A5B4FC', icon: 'shopping_cart' },
      Entertainment: { color: '#FDA4AF', icon: 'movie' },
      Health: { color: '#86EFAC', icon: 'fitness_center' },
    };

    const results: CategoryBreakdown[] = [];
    expenseMap.forEach((val, cat) => {
      const percentage = Math.round((val.amount / totalExp) * 100);
      const conf = categoryColors[cat] || { color: '#A5B4FC', icon: 'receipt_long' };
      results.push({
        category: cat,
        amount: val.amount,
        percentage,
        color: conf.color,
        icon: conf.icon,
        count: val.count,
      });
    });

    // Sort descending by amount
    return results.sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topSpentCategory = useMemo(() => {
    if (categoryBreakdowns.length === 0) {
      return { name: 'Food', amount: 0, percentage: 45 };
    }
    const top = categoryBreakdowns[0];
    return {
      name: top.category,
      amount: top.amount,
      percentage: top.percentage || 45,
    };
  }, [categoryBreakdowns]);

  // Monthly stats for graph (Jan to Jun or last 6 months)
  const monthlyStats = useMemo<MonthlyStat[]>(() => {
    return [
      { month: 'Jan', income: 4200, expense: 2100, net: 2100 },
      { month: 'Feb', income: 5100, expense: 2800, net: 2300 },
      { month: 'Mar', income: 6400, expense: 3900, net: 2500 },
      { month: 'Apr', income: 4800, expense: 2400, net: 2400 },
      { month: 'May', income: 7500, expense: 3300, net: 4200 },
      { month: 'Jun', income: 8240.5, expense: 3120.25, net: 5120.25 },
    ];
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(queryLower);
        const matchesCategory = t.category.toLowerCase().includes(queryLower);
        const matchesNotes = t.notes?.toLowerCase().includes(queryLower);
        if (!matchesTitle && !matchesCategory && !matchesNotes) return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'all' && t.type !== selectedTypeFilter) {
        return false;
      }

      // Category filter
      if (
        selectedCategoryFilter !== 'All' &&
        selectedCategoryFilter !== 'Income' &&
        selectedCategoryFilter !== 'Expense'
      ) {
        if (t.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, selectedCategoryFilter, selectedTypeFilter]);

  // Actions
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      userId: user?.uid || 'guest',
    };

    // Optimistic UI update
    setTransactions((prev) => [newTx, ...prev]);

    if (user && !user.isAnonymous) {
      try {
        const userTxsRef = collection(db, 'users', user.uid, 'transactions');
        await addDoc(userTxsRef, newTx);
      } catch (err) {
        console.warn('Firestore addDoc error:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (user && !user.isAnonymous) {
      try {
        const docRef = doc(db, 'users', user.uid, 'transactions', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore deleteDoc error:', err);
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    if (user && !user.isAnonymous) {
      try {
        const docRef = doc(db, 'users', user.uid, 'transactions', id);
        await updateDoc(docRef, updates);
      } catch (err) {
        console.warn('Firestore updateDoc error:', err);
      }
    }
  };

  const resetToDefaultData = async () => {
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));

    if (user && !user.isAnonymous) {
      try {
        const userTxsRef = collection(db, 'users', user.uid, 'transactions');
        const snap = await getDocs(userTxsRef);
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        INITIAL_TRANSACTIONS.forEach((tx) => {
          const newDocRef = doc(userTxsRef);
          batch.set(newDocRef, { ...tx, id: newDocRef.id, userId: user.uid });
        });
        await batch.commit();
      } catch (err) {
        console.warn('Firestore reset batch error:', err);
      }
    }
  };

  const exportDataAsCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Title', 'Amount', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      `"${t.category}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fiscal-precision-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDataAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `fiscal-precision-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        isSyncing,
        totalBalance,
        totalIncome,
        totalExpense,
        categoryBreakdowns,
        topSpentCategory,
        monthlyStats,
        searchQuery,
        setSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedTypeFilter,
        setSelectedTypeFilter,
        filteredTransactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        resetToDefaultData,
        exportDataAsCSV,
        exportDataAsJSON,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used within TransactionProvider');
  return context;
};
