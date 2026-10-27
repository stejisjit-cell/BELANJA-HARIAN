/**
 * Cloud Firestore Real-time Synchronization & Batch Migration Service
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Category,
  MonthlyBudgetConfig,
  SavingsGoal,
  ShoppingItem,
  Transaction,
} from '../types/finance';

export interface CloudUserData {
  transactions: Transaction[];
  categories: Category[];
  budgets: MonthlyBudgetConfig[];
  savingsGoals: SavingsGoal[];
  shoppingList: ShoppingItem[];
}

/**
 * Set up real-time listener for a logged-in user's entire data scope.
 * Returns a cleanup unsubscribe function.
 */
export function subscribeToCloudUserData(
  uid: string,
  onUpdate: (data: Partial<CloudUserData>) => void,
  onError: (err: any) => void
): () => void {
  if (!db || !uid) return () => {};

  const unsubscribes: (() => void)[] = [];

  // 1. Transactions
  const trPath = `users/${uid}/transactions`;
  try {
    const trCol = collection(db, 'users', uid, 'transactions');
    const unsubTr = onSnapshot(
      trCol,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Transaction);
        });
        list.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            b.createdAt - a.createdAt
        );
        onUpdate({ transactions: list });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, trPath);
      }
    );
    unsubscribes.push(unsubTr);
  } catch (err) {
    onError(err);
  }

  // 2. Categories
  const catPath = `users/${uid}/categories`;
  try {
    const catCol = collection(db, 'users', uid, 'categories');
    const unsubCat = onSnapshot(
      catCol,
      (snapshot) => {
        const list: Category[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Category);
        });
        onUpdate({ categories: list });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, catPath);
      }
    );
    unsubscribes.push(unsubCat);
  } catch (err) {
    onError(err);
  }

  // 3. Budgets
  const bgPath = `users/${uid}/budgets`;
  try {
    const bgCol = collection(db, 'users', uid, 'budgets');
    const unsubBg = onSnapshot(
      bgCol,
      (snapshot) => {
        const list: MonthlyBudgetConfig[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as MonthlyBudgetConfig);
        });
        onUpdate({ budgets: list });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, bgPath);
      }
    );
    unsubscribes.push(unsubBg);
  } catch (err) {
    onError(err);
  }

  // 4. Savings Goals
  const savPath = `users/${uid}/savingsGoals`;
  try {
    const savCol = collection(db, 'users', uid, 'savingsGoals');
    const unsubSav = onSnapshot(
      savCol,
      (snapshot) => {
        const list: SavingsGoal[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SavingsGoal);
        });
        onUpdate({ savingsGoals: list });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, savPath);
      }
    );
    unsubscribes.push(unsubSav);
  } catch (err) {
    onError(err);
  }

  // 5. Shopping Lists
  const shopPath = `users/${uid}/shoppingLists`;
  try {
    const shopCol = collection(db, 'users', uid, 'shoppingLists');
    const unsubShop = onSnapshot(
      shopCol,
      (snapshot) => {
        const list: ShoppingItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ShoppingItem);
        });
        onUpdate({ shoppingList: list });
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, shopPath);
      }
    );
    unsubscribes.push(unsubShop);
  } catch (err) {
    onError(err);
  }

  return () => {
    unsubscribes.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // ignore
      }
    });
  };
}

// Single mutations
export async function saveTransactionCloud(uid: string, tr: Transaction): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/transactions/${tr.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'transactions', tr.id);
    await setDoc(docRef, { ...tr, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteTransactionCloud(uid: string, id: string): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/transactions/${id}`;
  try {
    const docRef = doc(db, 'users', uid, 'transactions', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveCategoryCloud(uid: string, cat: Category): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/categories/${cat.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'categories', cat.id);
    await setDoc(docRef, { ...cat, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteCategoryCloud(uid: string, id: string): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/categories/${id}`;
  try {
    const docRef = doc(db, 'users', uid, 'categories', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveBudgetCloud(uid: string, bg: MonthlyBudgetConfig): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/budgets/${bg.yearMonth}`;
  try {
    const docRef = doc(db, 'users', uid, 'budgets', bg.yearMonth);
    await setDoc(docRef, { ...bg, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveSavingsGoalCloud(uid: string, goal: SavingsGoal): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/savingsGoals/${goal.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'savingsGoals', goal.id);
    await setDoc(docRef, { ...goal, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSavingsGoalCloud(uid: string, id: string): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/savingsGoals/${id}`;
  try {
    const docRef = doc(db, 'users', uid, 'savingsGoals', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveShoppingItemCloud(uid: string, item: ShoppingItem): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/shoppingLists/${item.id}`;
  try {
    const docRef = doc(db, 'users', uid, 'shoppingLists', item.id);
    await setDoc(docRef, { ...item, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteShoppingItemCloud(uid: string, id: string): Promise<void> {
  if (!db) return;
  const path = `users/${uid}/shoppingLists/${id}`;
  try {
    const docRef = doc(db, 'users', uid, 'shoppingLists', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Check if the cloud database already has any data for this UID
 */
export async function checkCloudDataCount(uid: string): Promise<number> {
  if (!db) return 0;
  try {
    const trCol = collection(db, 'users', uid, 'transactions');
    const snap = await getDocs(query(trCol));
    return snap.size;
  } catch {
    return 0;
  }
}

/**
 * Batch import local data to cloud with deduplication and chunking (< 400 operations per batch)
 */
export async function batchImportLocalDataToCloud(
  uid: string,
  data: {
    transactions: Transaction[];
    categories: Category[];
    budgets: MonthlyBudgetConfig[];
    savingsGoals: SavingsGoal[];
    shoppingList: ShoppingItem[];
  },
  onProgress?: (progress: number, message: string) => void
): Promise<{ importedCount: number; skippedCount: number }> {
  if (!db) throw new Error('Database Firebase tidak tersedia.');

  onProgress?.(5, 'Memeriksa data yang ada di cloud...');

  // Fetch existing IDs to avoid duplicates
  const existingTrSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
  const existingTrIds = new Set<string>();
  existingTrSnap.forEach((d) => existingTrIds.add(d.id));

  let importedCount = 0;
  let skippedCount = 0;

  // Flatten all items into doc writes
  const writeOps: Array<{ ref: any; data: any }> = [];

  // 1. Categories
  for (const c of data.categories) {
    writeOps.push({
      ref: doc(db, 'users', uid, 'categories', c.id),
      data: { ...c, updatedAt: Date.now() },
    });
  }

  // 2. Budgets
  for (const b of data.budgets) {
    writeOps.push({
      ref: doc(db, 'users', uid, 'budgets', b.yearMonth),
      data: { ...b, updatedAt: Date.now() },
    });
  }

  // 3. Transactions (deduplicated)
  for (const t of data.transactions) {
    if (existingTrIds.has(t.id)) {
      skippedCount++;
    } else {
      writeOps.push({
        ref: doc(db, 'users', uid, 'transactions', t.id),
        data: { ...t, updatedAt: Date.now() },
      });
      importedCount++;
    }
  }

  // 4. Savings Goals
  for (const s of data.savingsGoals) {
    writeOps.push({
      ref: doc(db, 'users', uid, 'savingsGoals', s.id),
      data: { ...s, updatedAt: Date.now() },
    });
  }

  // 5. Shopping Items
  for (const sh of data.shoppingList) {
    writeOps.push({
      ref: doc(db, 'users', uid, 'shoppingLists', sh.id),
      data: { ...sh, updatedAt: Date.now() },
    });
  }

  // Execute in chunks of 350
  const CHUNK_SIZE = 350;
  for (let i = 0; i < writeOps.length; i += CHUNK_SIZE) {
    const chunk = writeOps.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const op of chunk) {
      batch.set(op.ref, op.data, { merge: true });
    }
    await batch.commit();

    const percent = Math.min(95, Math.round(((i + chunk.length) / writeOps.length) * 100));
    onProgress?.(percent, `Mengimpor ${i + chunk.length} dari ${writeOps.length} catatan...`);
  }

  onProgress?.(100, 'Impor data selesai dengan sukses!');
  return { importedCount, skippedCount };
}
