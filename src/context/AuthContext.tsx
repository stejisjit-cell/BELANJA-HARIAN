import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  isLoading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserDisplayName: (name: string) => Promise<void>;
  changeAccountPassword: (currentPass: string, newPass: string) => Promise<void>;
  deleteAccount: (currentPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userProfile: UserProfileData | null = currentUser
    ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Bunda'),
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        createdAt: currentUser.metadata.creationTime,
        lastLoginAt: currentUser.metadata.lastSignInTime,
      }
    : null;

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      throw new Error(mapAuthErrorMessage(err.code || err.message));
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      // Send verification email
      try {
        await sendEmailVerification(cred.user);
      } catch (e) {
        console.warn('Gagal mengirim email verifikasi:', e);
      }
    } catch (err: any) {
      throw new Error(mapAuthErrorMessage(err.code || err.message));
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      throw new Error(mapAuthErrorMessage(err.code || err.message));
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase belum dikonfigurasi.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      throw new Error(mapAuthErrorMessage(err.code || err.message));
    }
  };

  const resendVerificationEmail = async () => {
    if (!currentUser) throw new Error('Tidak ada pengguna aktif.');
    await sendEmailVerification(currentUser);
  };

  const updateUserDisplayName = async (name: string) => {
    if (!currentUser) throw new Error('Tidak ada pengguna aktif.');
    await updateProfile(currentUser, { displayName: name.trim() });
    setCurrentUser({ ...currentUser, displayName: name.trim() } as User);
  };

  const changeAccountPassword = async (currentPass: string, newPass: string) => {
    if (!currentUser || !currentUser.email) throw new Error('Tidak ada pengguna aktif.');
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPass);
  };

  const deleteAccount = async (currentPass: string) => {
    if (!currentUser || !currentUser.email) throw new Error('Tidak ada pengguna aktif.');
    const credential = EmailAuthProvider.credential(currentUser.email, currentPass);
    await reauthenticateWithCredential(currentUser, credential);
    await deleteUser(currentUser);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        isFirebaseReady: isFirebaseConfigured,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserDisplayName,
        changeAccountPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function mapAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi salah. Silakan coba kembali.';
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan login atau gunakan reset sandi.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat atau reset sandi.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum selesai.';
    default:
      return code || 'Terjadi kesalahan pada sistem autentikasi.';
  }
}
