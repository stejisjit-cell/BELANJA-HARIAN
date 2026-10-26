/**
 * Robust IndexedDB storage for BundaBudget with fallback support.
 */

import {
  Category,
  MonthlyBudgetConfig,
  SavingsGoal,
  ShoppingItem,
  Transaction,
} from '../types/finance';
import {
  DEFAULT_CATEGORIES,
  INITIAL_BUDGET_CONFIG,
  INITIAL_SAVINGS_GOALS,
  INITIAL_SHOPPING_LIST,
  INITIAL_TRANSACTIONS,
} from './sampleData';

const DB_NAME = 'BundaBudgetDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Transactions
      if (!db.objectStoreNames.contains('transactions')) {
        const trStore = db.createObjectStore('transactions', { keyPath: 'id' });
        trStore.createIndex('date', 'date', { unique: false });
        trStore.createIndex('categoryId', 'categoryId', { unique: false });
      }

      // Categories
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Monthly Budgets
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'yearMonth' });
      }

      // Savings Goals
      if (!db.objectStoreNames.contains('savings')) {
        db.createObjectStore('savings', { keyPath: 'id' });
      }

      // Shopping List
      if (!db.objectStoreNames.contains('shoppingList')) {
        db.createObjectStore('shoppingList', { keyPath: 'id' });
      }

      // Settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Generic helper to get all items from an object store
 */
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // LocalStorage Fallback
    const fallbackKey = `bb_fallback_${storeName}`;
    const raw = localStorage.getItem(fallbackKey);
    return raw ? JSON.parse(raw) : [];
  }
}

/**
 * Generic helper to put an item in an object store
 */
async function putInStore<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // LocalStorage Fallback
    const fallbackKey = `bb_fallback_${storeName}`;
    const current = await getAllFromStore<any>(storeName);
    const idKey = (item as any).id || (item as any).yearMonth || (item as any).key;
    const filtered = current.filter(
      (x) => ((x as any).id || (x as any).yearMonth || (x as any).key) !== idKey
    );
    filtered.push(item);
    localStorage.setItem(fallbackKey, JSON.stringify(filtered));
  }
}

/**
 * Generic helper to delete an item
 */
async function deleteFromStore(storeName: string, key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const fallbackKey = `bb_fallback_${storeName}`;
    const current = await getAllFromStore<any>(storeName);
    const filtered = current.filter(
      (x) => ((x as any).id || (x as any).yearMonth || (x as any).key) !== key
    );
    localStorage.setItem(fallbackKey, JSON.stringify(filtered));
  }
}

/**
 * Initialize starter seed data if empty
 */
export async function initializeSeedDataIfEmpty(): Promise<void> {
  try {
    const categories = await getAllFromStore<Category>('categories');
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await putInStore('categories', cat);
      }
    }

    const budgets = await getAllFromStore<MonthlyBudgetConfig>('budgets');
    if (budgets.length === 0) {
      await putInStore('budgets', INITIAL_BUDGET_CONFIG);
    }

    const transactions = await getAllFromStore<Transaction>('transactions');
    if (transactions.length === 0) {
      for (const tr of INITIAL_TRANSACTIONS) {
        await putInStore('transactions', tr);
      }
    }

    const savings = await getAllFromStore<SavingsGoal>('savings');
    if (savings.length === 0) {
      for (const s of INITIAL_SAVINGS_GOALS) {
        await putInStore('savings', s);
      }
    }

    const shopping = await getAllFromStore<ShoppingItem>('shoppingList');
    if (shopping.length === 0) {
      for (const sh of INITIAL_SHOPPING_LIST) {
        await putInStore('shoppingList', sh);
      }
    }
  } catch (e) {
    console.warn('Error during seed initialization, continuing with safe defaults:', e);
  }
}

// ----------------- CRUD API -----------------

export async function getTransactions(): Promise<Transaction[]> {
  const list = await getAllFromStore<Transaction>('transactions');
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  return putInStore('transactions', transaction);
}

export async function deleteTransaction(id: string): Promise<void> {
  return deleteFromStore('transactions', id);
}

export async function getCategories(): Promise<Category[]> {
  const list = await getAllFromStore<Category>('categories');
  if (!list || list.length === 0) {
    return DEFAULT_CATEGORIES;
  }
  return list;
}

export async function saveCategory(category: Category): Promise<void> {
  return putInStore('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
  return deleteFromStore('categories', id);
}

export async function getBudgetForMonth(yearMonth: string): Promise<MonthlyBudgetConfig | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('budgets', 'readonly');
      const store = tx.objectStore('budgets');
      const req = store.get(yearMonth);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    const list = await getAllFromStore<MonthlyBudgetConfig>('budgets');
    return list.find((b) => b.yearMonth === yearMonth) || null;
  }
}

export async function getAllBudgets(): Promise<MonthlyBudgetConfig[]> {
  return getAllFromStore<MonthlyBudgetConfig>('budgets');
}

export async function saveBudget(budget: MonthlyBudgetConfig): Promise<void> {
  return putInStore('budgets', budget);
}

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const list = await getAllFromStore<SavingsGoal>('savings');
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveSavingsGoal(goal: SavingsGoal): Promise<void> {
  return putInStore('savings', goal);
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  return deleteFromStore('savings', id);
}

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const list = await getAllFromStore<ShoppingItem>('shoppingList');
  return list.sort((a, b) => (a.isPurchased === b.isPurchased ? b.createdAt - a.createdAt : a.isPurchased ? 1 : -1));
}

export async function saveShoppingItem(item: ShoppingItem): Promise<void> {
  return putInStore('shoppingList', item);
}

export async function deleteShoppingItem(id: string): Promise<void> {
  return deleteFromStore('shoppingList', id);
}

// ----------------- BACKUP & RESTORE -----------------

export interface BackupPayload {
  version: number;
  appName: string;
  exportedAt: string;
  data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: MonthlyBudgetConfig[];
    savings: SavingsGoal[];
    shoppingList: ShoppingItem[];
  };
}

export async function exportAllData(): Promise<BackupPayload> {
  const transactions = await getAllFromStore<Transaction>('transactions');
  const categories = await getAllFromStore<Category>('categories');
  const budgets = await getAllFromStore<MonthlyBudgetConfig>('budgets');
  const savings = await getAllFromStore<SavingsGoal>('savings');
  const shoppingList = await getAllFromStore<ShoppingItem>('shoppingList');

  return {
    version: 1,
    appName: 'BundaBudget',
    exportedAt: new Date().toISOString(),
    data: {
      transactions,
      categories,
      budgets,
      savings,
      shoppingList,
    },
  };
}

export async function importAllData(payload: BackupPayload): Promise<void> {
  if (!payload || !payload.data) {
    throw new Error('Format file backup tidak valid.');
  }

  // Clear existing stores
  await clearAllData();

  if (Array.isArray(payload.data.categories)) {
    for (const c of payload.data.categories) await putInStore('categories', c);
  }
  if (Array.isArray(payload.data.budgets)) {
    for (const b of payload.data.budgets) await putInStore('budgets', b);
  }
  if (Array.isArray(payload.data.transactions)) {
    for (const t of payload.data.transactions) await putInStore('transactions', t);
  }
  if (Array.isArray(payload.data.savings)) {
    for (const s of payload.data.savings) await putInStore('savings', s);
  }
  if (Array.isArray(payload.data.shoppingList)) {
    for (const sh of payload.data.shoppingList) await putInStore('shoppingList', sh);
  }
}

export async function clearAllData(): Promise<void> {
  const stores = ['transactions', 'categories', 'budgets', 'savings', 'shoppingList'];
  try {
    const db = await openDatabase();
    for (const s of stores) {
      const tx = db.transaction(s, 'readwrite');
      tx.objectStore(s).clear();
    }
  } catch {
    for (const s of stores) {
      localStorage.removeItem(`bb_fallback_${s}`);
    }
  }
}

export async function restoreDemoData(): Promise<void> {
  await clearAllData();
  for (const c of DEFAULT_CATEGORIES) await putInStore('categories', c);
  await putInStore('budgets', INITIAL_BUDGET_CONFIG);
  for (const t of INITIAL_TRANSACTIONS) await putInStore('transactions', t);
  for (const s of INITIAL_SAVINGS_GOALS) await putInStore('savings', s);
  for (const sh of INITIAL_SHOPPING_LIST) await putInStore('shoppingList', sh);
}
