/**
 * BundaBudget Types and Interfaces
 */

export type PaymentMethod = 'Tunai' | 'Transfer Bank' | 'Kartu Debit' | 'E-Wallet (QRIS/GoPay/OVO/ShopeePay)';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color code
  allocatedBudget: number; // in Rupiah
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  itemName: string;
  categoryId: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number; // unitPrice * quantity
  storeName?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  receiptImage?: string; // base64 / dataUrl
  createdAt: number;
}

export interface MonthlyBudgetConfig {
  yearMonth: string; // "YYYY-MM", e.g. "2026-10"
  totalBudget: number;
  savingsTarget: number;
  categoryAllocations: Record<string, number>; // categoryId -> allocated nominal Rp
  notes?: string;
  updatedAt: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  color: string;
  category: string;
  history: {
    id: string;
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    notes?: string;
  }[];
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: number;
  quantity: number;
  categoryId: string;
  isPurchased: boolean;
  notes?: string;
  createdAt: number;
}

export interface DailySavingTip {
  id: string;
  title: string;
  tip: string;
  tag: string;
}

export type ActiveTab = 'dashboard' | 'expenses' | 'budget' | 'reports' | 'savings' | 'shopping' | 'settings';
