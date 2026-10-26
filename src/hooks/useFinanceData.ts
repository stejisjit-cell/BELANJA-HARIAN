import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearAllData,
  deleteCategory as dbDeleteCategory,
  deleteSavingsGoal as dbDeleteSavingsGoal,
  deleteShoppingItem as dbDeleteShoppingItem,
  deleteTransaction as dbDeleteTransaction,
  exportAllData,
  getBudgetForMonth,
  getCategories,
  getSavingsGoals,
  getShoppingList,
  getTransactions,
  importAllData,
  initializeSeedDataIfEmpty,
  restoreDemoData,
  saveBudget as dbSaveBudget,
  saveCategory as dbSaveCategory,
  saveSavingsGoal as dbSaveSavingsGoal,
  saveShoppingItem as dbSaveShoppingItem,
  saveTransaction as dbSaveTransaction,
} from '../db/indexedDB';
import {
  Category,
  MonthlyBudgetConfig,
  SavingsGoal,
  ShoppingItem,
  Transaction,
} from '../types/finance';
import {
  getCurrentYearMonth,
  getTodayDateString,
  isSameWeek,
} from '../utils/formatters';

export function useFinanceData() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentYearMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudgetConfig | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Reload all data
  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await initializeSeedDataIfEmpty();

      const [tr, cat, sav, shop] = await Promise.all([
        getTransactions(),
        getCategories(),
        getSavingsGoals(),
        getShoppingList(),
      ]);

      setTransactions(tr);
      setCategories(cat);
      setSavingsGoals(sav);
      setShoppingList(shop);

      // Load budget for selected month
      let bg = await getBudgetForMonth(selectedMonth);
      if (!bg) {
        // Create baseline default for the new month without altering past months
        const initialAllocations: Record<string, number> = {};
        cat.forEach((c) => {
          initialAllocations[c.id] = c.allocatedBudget || 300000;
        });
        const total = Object.values(initialAllocations).reduce((a, b) => a + b, 0);

        bg = {
          yearMonth: selectedMonth,
          totalBudget: total > 0 ? total : 5000000,
          savingsTarget: 1000000,
          categoryAllocations: initialAllocations,
          notes: `Rencana anggaran belanja bulan ${selectedMonth}`,
          updatedAt: Date.now(),
        };
        await dbSaveBudget(bg);
      }
      setCurrentBudget(bg);
    } catch (e) {
      console.error('Failed to load finance data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Categories Map for fast lookup
  const categoriesMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filter transactions for the selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Summary Metrics
  const totalMonthlyExpense = useMemo(() => {
    return monthlyTransactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  }, [monthlyTransactions]);

  const monthlyBudgetAmount = currentBudget?.totalBudget ?? 5000000;
  const savingsTarget = currentBudget?.savingsTarget ?? 1000000;
  const remainingBudget = monthlyBudgetAmount - totalMonthlyExpense;
  const budgetUsagePercent = monthlyBudgetAmount > 0 ? (totalMonthlyExpense / monthlyBudgetAmount) * 100 : 0;

  // Today & This Week Expenses
  const todayStr = getTodayDateString();
  const todayExpense = useMemo(() => {
    return transactions
      .filter((t) => t.date === todayStr)
      .reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  }, [transactions, todayStr]);

  const thisWeekExpense = useMemo(() => {
    return transactions
      .filter((t) => isSameWeek(t.date, todayStr))
      .reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  }, [transactions, todayStr]);

  // Category Breakdown for the current month
  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const allocated =
        currentBudget?.categoryAllocations?.[cat.id] ?? cat.allocatedBudget ?? 0;
      const spent = monthlyTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      const remaining = allocated - spent;
      const percent = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      
      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (spent > allocated) {
        status = 'danger';
      } else if (percent >= 80) {
        status = 'warning';
      }

      return {
        ...cat,
        allocatedBudget: allocated,
        spent,
        remaining,
        percent,
        status,
        txCount: monthlyTransactions.filter((t) => t.categoryId === cat.id).length,
      };
    });
  }, [categories, currentBudget, monthlyTransactions]);

  // Actions
  const handleSaveTransaction = async (trData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => {
    const id = trData.id || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTr: Transaction = {
      ...trData,
      id,
      createdAt: Date.now(),
    };
    await dbSaveTransaction(newTr);
    await loadAll();
    showToast(trData.id ? 'Belanja berhasil diperbarui! ✨' : 'Belanja baru berhasil dicatat! 🛍️');
    return newTr;
  };

  const handleDeleteTransaction = async (id: string) => {
    await dbDeleteTransaction(id);
    await loadAll();
    showToast('Transaksi berhasil dihapus.');
  };

  const handleSaveBudget = async (config: MonthlyBudgetConfig) => {
    await dbSaveBudget(config);
    setCurrentBudget(config);
    showToast('Pengaturan budget bulan ini tersimpan rapi! 📝');
  };

  const handleSaveCategory = async (cat: Category) => {
    await dbSaveCategory(cat);
    await loadAll();
    showToast('Kategori belanja berhasil disimpan!');
  };

  const handleDeleteCategory = async (id: string) => {
    await dbDeleteCategory(id);
    await loadAll();
    showToast('Kategori telah dihapus.');
  };

  const handleSaveSavingsGoal = async (goal: SavingsGoal) => {
    await dbSaveSavingsGoal(goal);
    await loadAll();
    showToast('Target tabungan diperbarui! 🌸');
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    await dbDeleteSavingsGoal(id);
    await loadAll();
    showToast('Target tabungan dihapus.');
  };

  const handleSaveShoppingItem = async (item: ShoppingItem) => {
    await dbSaveShoppingItem(item);
    await loadAll();
    showToast('Daftar belanja diperbarui! 📋');
  };

  const handleDeleteShoppingItem = async (id: string) => {
    await dbDeleteShoppingItem(id);
    await loadAll();
    showToast('Barang dihapus dari daftar belanja.');
  };

  const handleConvertShoppingItemToExpense = async (item: ShoppingItem) => {
    const newTr: Transaction = {
      id: `tr-${Date.now()}`,
      date: getTodayDateString(),
      itemName: item.name,
      categoryId: item.categoryId || 'cat-kitchen',
      unitPrice: item.estimatedPrice || 0,
      quantity: item.quantity || 1,
      totalAmount: (item.estimatedPrice || 0) * (item.quantity || 1),
      storeName: 'Pasar / Toko',
      paymentMethod: 'Tunai',
      notes: `Dibeli dari checklist: ${item.notes || '-'}`,
      createdAt: Date.now(),
    };
    await dbSaveTransaction(newTr);
    await dbDeleteShoppingItem(item.id);
    await loadAll();
    showToast(`"${item.name}" berhasil dicatat sebagai transaksi belanja! ✨`);
  };

  const handleResetData = async () => {
    await clearAllData();
    await loadAll();
    showToast('Semua data berhasil dibersihkan.');
  };

  const handleRestoreDemo = async () => {
    await restoreDemoData();
    await loadAll();
    showToast('Data contoh BundaBudget berhasil dimuat kembali! 💖');
  };

  const handleImportJSON = async (payload: any) => {
    await importAllData(payload);
    await loadAll();
    showToast('Data berhasil dipulihkan dari file backup! 🎉');
  };

  return {
    selectedMonth,
    setSelectedMonth,
    transactions,
    monthlyTransactions,
    categories,
    categoriesMap,
    currentBudget,
    savingsGoals,
    shoppingList,
    isLoading,
    toastMessage,
    // Metrics
    totalMonthlyExpense,
    monthlyBudgetAmount,
    savingsTarget,
    remainingBudget,
    budgetUsagePercent,
    todayExpense,
    thisWeekExpense,
    categoryBreakdown,
    // Actions
    handleSaveTransaction,
    handleDeleteTransaction,
    handleSaveBudget,
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveSavingsGoal,
    handleDeleteSavingsGoal,
    handleSaveShoppingItem,
    handleDeleteShoppingItem,
    handleConvertShoppingItemToExpense,
    handleResetData,
    handleRestoreDemo,
    handleImportJSON,
    exportAllData,
  };
}
