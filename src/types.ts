export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 02:45 PM
  notes?: string;
  createdAt: number;
  userId?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string; // Material symbol or Lucide
  color: string; // Hex or CSS color
  bgClass: string;
  textClass: string;
  type: TransactionType | 'both';
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  monthlyBudget: number;
  currency: string;
  isAnonymous?: boolean;
}
