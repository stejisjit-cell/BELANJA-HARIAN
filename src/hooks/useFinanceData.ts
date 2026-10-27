import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  checkCloudDataCount,
  deleteCategoryCloud,
  deleteSavingsGoalCloud,
  deleteShoppingItemCloud,
  deleteTransactionCloud,
  saveBudgetCloud,
  saveCategoryCloud,
  saveSavingsGoalCloud,
  saveShoppingItemCloud,
  saveTransactionCloud,
  subscribeToCloudUserData,
} from '../services/firestoreSync';
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

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local';

export function useFinanceData() {
  const { currentUser } = useAuth();
  const isOnline = useOnlineStatus();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentYearMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allBudgets, setAllBudgets] = useState<MonthlyBudgetConfig[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [isMigrationPromptOpen, setIsMigrationPromptOpen] = useState(false);
  const [localDataForMigration, setLocalDataForMigration] = useState<{
    transactions: Transaction[];
    categories: Category[];
    budgets: MonthlyBudgetConfig[];
    savingsGoals: SavingsGoal[];
    shoppingList: ShoppingItem[];
  }>({
    transactions: [],
    categories: [],
    budgets: [],
    savingsGoals: [],
    shoppingList: [],
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // 1. Local Data Loader (Used when not logged in or as offline cache)
  const loadFromLocalDB = useCallback(async () => {
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

      let bg = await getBudgetForMonth(selectedMonth);
      if (!bg) {
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
      setAllBudgets([bg]);
      setSyncStatus('local');
    } catch (e) {
      console.error('Failed to load local finance data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  // 2. Real-time Cloud Subscription (Used when logged in)
  useEffect(() => {
    if (!currentUser) {
      // User is logged out or anonymous -> use local IndexedDB
      loadFromLocalDB();
      return;
    }

    // User is logged in -> connect to Firestore
    setSyncStatus(isOnline ? 'syncing' : 'offline');
    setIsLoading(true);

    // Check if cloud data is empty and local data exists -> prompt migration
    (async () => {
      try {
        const cloudCount = await checkCloudDataCount(currentUser.uid);
        if (cloudCount === 0) {
          const [localTr, localCat, localSav, localShop] = await Promise.all([
            getTransactions(),
            getCategories(),
            getSavingsGoals(),
            getShoppingList(),
          ]);
          if (localTr.length > 0) {
            setLocalDataForMigration({
              transactions: localTr,
              categories: localCat,
              budgets: [],
              savingsGoals: localSav,
              shoppingList: localShop,
            });
            setIsMigrationPromptOpen(true);
          }
        }
      } catch (e) {
        console.warn('Migration check error:', e);
      }
    })();

    const unsubscribe = subscribeToCloudUserData(
      currentUser.uid,
      (cloudData) => {
        if (cloudData.transactions !== undefined) {
          setTransactions(cloudData.transactions);
        }
        if (cloudData.categories !== undefined && cloudData.categories.length > 0) {
          setCategories(cloudData.categories);
        }
        if (cloudData.budgets !== undefined) {
          setAllBudgets(cloudData.budgets);
        }
        if (cloudData.savingsGoals !== undefined) {
          setSavingsGoals(cloudData.savingsGoals);
        }
        if (cloudData.shoppingList !== undefined) {
          setShoppingList(cloudData.shoppingList);
        }
        setSyncStatus('synced');
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setSyncStatus(isOnline ? 'error' : 'offline');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, isOnline, loadFromLocalDB]);

  // Update offline status reactively
  useEffect(() => {
    if (!isOnline && currentUser) {
      setSyncStatus('offline');
    } else if (isOnline && currentUser && syncStatus === 'offline') {
      setSyncStatus('synced');
    }
  }, [isOnline, currentUser, syncStatus]);

  // Find active budget for selected month
  const currentBudget = useMemo(() => {
    const found = allBudgets.find((b) => b.yearMonth === selectedMonth);
    if (found) return found;

    // Fallback baseline
    const initialAllocations: Record<string, number> = {};
    categories.forEach((c) => {
      initialAllocations[c.id] = c.allocatedBudget || 300000;
    });
    const total = Object.values(initialAllocations).reduce((a, b) => a + b, 0);

    return {
      yearMonth: selectedMonth,
      totalBudget: total > 0 ? total : 5000000,
      savingsTarget: 1000000,
      categoryAllocations: initialAllocations,
      notes: `Rencana anggaran belanja bulan ${selectedMonth}`,
      updatedAt: Date.now(),
    };
  }, [allBudgets, selectedMonth, categories]);

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
  const budgetUsagePercent =
    monthlyBudgetAmount > 0 ? (totalMonthlyExpense / monthlyBudgetAmount) * 100 : 0;

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

  // ------------------- ACTIONS (Dual write: Cloud Firestore + Local Cache) -------------------

  const handleSaveTransaction = async (
    trData: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    const id = trData.id || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTr: Transaction = {
      ...trData,
      id,
      createdAt: Date.now(),
    };

    // Always update local cache
    await dbSaveTransaction(newTr);

    // If logged in, write to Cloud Firestore
    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await saveTransactionCloud(currentUser.uid, newTr);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Failed to sync transaction to cloud:', err);
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      // Local mode
      setTransactions((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return [newTr, ...filtered].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
        );
      });
    }

    showToast(trData.id ? 'Belanja berhasil diperbarui! ✨' : 'Belanja baru berhasil dicatat! 🛍️');
    return newTr;
  };

  const handleDeleteTransaction = async (id: string) => {
    await dbDeleteTransaction(id);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await deleteTransactionCloud(currentUser.uid, id);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Failed to delete transaction from cloud:', err);
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }

    showToast('Transaksi berhasil dihapus.');
  };

  const handleSaveBudget = async (config: MonthlyBudgetConfig) => {
    await dbSaveBudget(config);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await saveBudgetCloud(currentUser.uid, config);
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Failed to sync budget to cloud:', err);
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setAllBudgets((prev) => {
        const filtered = prev.filter((b) => b.yearMonth !== config.yearMonth);
        return [...filtered, config];
      });
    }

    showToast('Pengaturan budget bulan ini tersimpan rapi! 📝');
  };

  const handleSaveCategory = async (cat: Category) => {
    await dbSaveCategory(cat);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await saveCategoryCloud(currentUser.uid, cat);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setCategories((prev) => {
        const filtered = prev.filter((c) => c.id !== cat.id);
        return [...filtered, cat];
      });
    }

    showToast('Kategori belanja berhasil disimpan!');
  };

  const handleDeleteCategory = async (id: string) => {
    await dbDeleteCategory(id);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await deleteCategoryCloud(currentUser.uid, id);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }

    showToast('Kategori telah dihapus.');
  };

  const handleSaveSavingsGoal = async (goal: SavingsGoal) => {
    await dbSaveSavingsGoal(goal);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await saveSavingsGoalCloud(currentUser.uid, goal);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setSavingsGoals((prev) => {
        const filtered = prev.filter((g) => g.id !== goal.id);
        return [goal, ...filtered];
      });
    }

    showToast('Target tabungan diperbarui! 🌸');
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    await dbDeleteSavingsGoal(id);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await deleteSavingsGoalCloud(currentUser.uid, id);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    }

    showToast('Target tabungan dihapus.');
  };

  const handleSaveShoppingItem = async (item: ShoppingItem) => {
    await dbSaveShoppingItem(item);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await saveShoppingItemCloud(currentUser.uid, item);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setShoppingList((prev) => {
        const filtered = prev.filter((s) => s.id !== item.id);
        return [item, ...filtered];
      });
    }

    showToast('Daftar belanja diperbarui! 📋');
  };

  const handleDeleteShoppingItem = async (id: string) => {
    await dbDeleteShoppingItem(id);

    if (currentUser) {
      setSyncStatus('syncing');
      try {
        await deleteShoppingItemCloud(currentUser.uid, id);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus(isOnline ? 'error' : 'offline');
      }
    } else {
      setShoppingList((prev) => prev.filter((s) => s.id !== id));
    }

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

    await handleSaveTransaction(newTr);
    await handleDeleteShoppingItem(item.id);
    showToast(`"${item.name}" berhasil dicatat sebagai transaksi belanja! ✨`);
  };

  const handleResetData = async () => {
    await clearAllData();
    if (!currentUser) {
      await loadFromLocalDB();
    }
    showToast('Semua data lokal berhasil dibersihkan.');
  };

  const handleRestoreDemo = async () => {
    await restoreDemoData();
    if (!currentUser) {
      await loadFromLocalDB();
    }
    showToast('Data contoh BundaBudget berhasil dimuat kembali! 💖');
  };

  const handleImportJSON = async (payload: any) => {
    await importAllData(payload);
    if (!currentUser) {
      await loadFromLocalDB();
    }
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
    // Sync state
    syncStatus,
    isMigrationPromptOpen,
    setIsMigrationPromptOpen,
    localDataForMigration,
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
