import { CategoryInfo } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: 'Food',
    icon: 'restaurant',
    color: '#A5B4FC',
    bgClass: 'bg-[#A5B4FC]/30 text-[#4b5a9c]',
    textClass: 'text-[#4b5a9c]',
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping_bag',
    color: '#FDA4AF',
    bgClass: 'bg-[#FDA4AF]/30 text-[#8f4953]',
    textClass: 'text-[#8f4953]',
    type: 'expense',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'commute',
    color: '#86EFAC',
    bgClass: 'bg-[#86EFAC]/30 text-[#006d3e]',
    textClass: 'text-[#006d3e]',
    type: 'expense',
  },
  {
    id: 'rent',
    name: 'Housing',
    icon: 'home',
    color: '#86EFAC',
    bgClass: 'bg-[#86EFAC]/30 text-[#006d3e]',
    textClass: 'text-[#006d3e]',
    type: 'expense',
  },
  {
    id: 'bills',
    name: 'Bills',
    icon: 'bolt',
    color: '#dde1ff',
    bgClass: 'bg-[#dde1ff] text-[#334282]',
    textClass: 'text-[#334282]',
    type: 'expense',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'shopping_cart',
    color: '#A5B4FC',
    bgClass: 'bg-[#A5B4FC]/30 text-[#4b5a9c]',
    textClass: 'text-[#4b5a9c]',
    type: 'expense',
  },
  {
    id: 'salary',
    name: 'Salary',
    icon: 'work',
    color: '#86EFAC',
    bgClass: 'bg-[#86EFAC]/30 text-[#006d3e]',
    textClass: 'text-[#006d3e]',
    type: 'income',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'movie',
    color: '#FDA4AF',
    bgClass: 'bg-[#FDA4AF]/30 text-[#8f4953]',
    textClass: 'text-[#8f4953]',
    type: 'expense',
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: 'trending_up',
    color: '#8ff8b4',
    bgClass: 'bg-[#8ff8b4]/30 text-[#006d3e]',
    textClass: 'text-[#006d3e]',
    type: 'income',
  },
];

export function getCategoryInfo(categoryName: string): CategoryInfo {
  const match = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id.toLowerCase() === categoryName.toLowerCase()
  );
  if (match) return match;

  return {
    id: categoryName.toLowerCase().replace(/\s+/g, '-'),
    name: categoryName,
    icon: 'receipt_long',
    color: '#A5B4FC',
    bgClass: 'bg-[#A5B4FC]/30 text-[#4b5a9c]',
    textClass: 'text-[#4b5a9c]',
    type: 'expense',
  };
}
