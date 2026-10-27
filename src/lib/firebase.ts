/**
 * Firebase Client Initialization & Error Handling for BundaBudget
 */

import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  databaseId?: string;
}

// 1. Read configuration from environment variables or custom localStorage config
export function getFirebaseConfig(): FirebaseClientConfig | null {
  // Check custom configuration stored in localStorage (useful if user enters keys in Settings)
  const storedConfig = typeof window !== 'undefined' ? localStorage.getItem('bb_custom_firebase_config') : null;
  if (storedConfig) {
    try {
      const parsed = JSON.parse(storedConfig);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // Check Vite environment variables
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
      databaseId: env.VITE_FIREBASE_DATABASE_ID || undefined,
    };
  }

  return null;
}

const config = getFirebaseConfig();

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const isFirebaseConfigured = Boolean(config && config.apiKey && config.projectId);

if (isFirebaseConfigured && config) {
  try {
    const existingApps = getApps();
    appInstance = existingApps.length > 0 ? existingApps[0] : initializeApp(config);
    authInstance = getAuth(appInstance);
    // If a custom databaseId is provided and non-empty, use it, else default
    dbInstance = config.databaseId ? getFirestore(appInstance, config.databaseId) : getFirestore(appInstance);
  } catch (err) {
    console.warn('Failed to initialize Firebase app:', err);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

/**
 * Save custom configuration to localStorage and reload
 */
export function saveCustomFirebaseConfig(customConfig: FirebaseClientConfig | null): void {
  if (customConfig) {
    localStorage.setItem('bb_custom_firebase_config', JSON.stringify(customConfig));
  } else {
    localStorage.removeItem('bb_custom_firebase_config');
  }
  window.location.reload();
}

/**
 * Standardized Firestore error handling adhering to FirestoreErrorInfo schema
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
