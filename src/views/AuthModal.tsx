import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Shield,
  Smartphone,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'profile';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    currentUser,
    userProfile,
    isFirebaseReady,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserDisplayName,
    changeAccountPassword,
    deleteAccount,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'profile'>(
    currentUser ? 'profile' : initialMode
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Silakan masukkan email dan kata sandi Bunda.');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter demi keamanan akun Bunda.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password, name);
      setSuccessMsg('Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftar akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login dengan akun Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email Bunda terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSuccessMsg('Tautan pemulihan kata sandi telah dikirim ke email Bunda.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim email reset sandi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!currentPassword || !newPassword) {
      setErrorMsg('Masukkan kata sandi lama dan kata sandi baru.');
      return;
    }
    setIsSubmitting(true);
    try {
      await changeAccountPassword(currentPassword, newPassword);
      setSuccessMsg('Kata sandi berhasil diperbarui! ✨');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengubah kata sandi. Pastikan sandi lama benar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setErrorMsg(null);
    if (!currentPassword) {
      setErrorMsg('Masukkan kata sandi untuk mengonfirmasi penghapusan akun.');
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteAccount(currentPassword);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menghapus akun. Periksa kembali kata sandi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3D7D1] to-[#DDA29B] flex items-center justify-center text-white shadow-2xs">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
                {currentUser
                  ? 'Profil Bunda'
                  : mode === 'register'
                  ? 'Daftar Akun BundaBudget'
                  : mode === 'forgot'
                  ? 'Reset Kata Sandi'
                  : 'Masuk ke Akun'}
              </h3>
              <p className="text-[11px] text-[#8C7A70]">
                {currentUser
                  ? 'Kelola data akun dan sinkronisasi online'
                  : 'Satu akun untuk HP, tablet, dan laptop'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#9C8C84] hover:text-[#55443B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#F2F6ED] border border-[#DEE7D6] rounded-2xl text-[#4F5943] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isFirebaseReady && (
            <div className="p-3 bg-[#FAF4ED] border border-[#EBE1D7] rounded-2xl text-[#78665D] text-xs space-y-1">
              <span className="font-bold text-[#8F483D] block">
                ⚡ Konfigurasi Firebase Diperlukan
              </span>
              <p>
                Konfigurasi Firebase belum diisi di berkas lingkungan (.env) atau Pengaturan. Anda
                tetap dapat menggunakan mode lokal IndexedDB, atau memasukkan kredensial Firebase di
                menu <strong>Pengaturan → Konfigurasi Firebase</strong>.
              </p>
            </div>
          )}

          {/* VIEW: LOGGED IN USER PROFILE */}
          {currentUser && userProfile && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF5F0] border border-[#EFE5DB] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#55443B]">
                      {userProfile.displayName || 'Bunda'}
                    </span>
                    <p className="text-xs text-[#78665D]">{userProfile.email}</p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      userProfile.emailVerified
                        ? 'bg-[#EDF0E9] text-[#5A634E]'
                        : 'bg-[#FFF3E0] text-[#B76E00]'
                    }`}
                  >
                    {userProfile.emailVerified ? '✓ Terverifikasi' : 'Belum Verifikasi'}
                  </span>
                </div>

                {!userProfile.emailVerified && (
                  <button
                    onClick={resendVerificationEmail}
                    className="text-[11px] text-[#8F483D] underline font-semibold mt-1"
                  >
                    Kirim ulang email verifikasi
                  </button>
                )}

                <div className="pt-2 border-t border-[#EAE0D6] text-[10px] text-[#8C7A70] flex justify-between">
                  <span>Terdaftar: {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('id-ID') : '-'}</span>
                  <span>UID: {userProfile.uid.substring(0, 8)}...</span>
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-2.5 pt-1">
                <span className="font-bold text-xs text-[#55443B] block">
                  Ubah Kata Sandi Akun
                </span>
                <input
                  type="password"
                  placeholder="Kata sandi saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs text-[#55443B]"
                />
                <input
                  type="password"
                  placeholder="Kata sandi baru (minimal 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs text-[#55443B]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-[#E8DACB] text-[#8F483D] font-bold text-xs rounded-xl"
                >
                  Perbarui Kata Sandi
                </button>
              </form>

              {/* Delete Account or Logout */}
              <div className="pt-3 border-t border-[#EFE8E1] space-y-2">
                <button
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#55443B] hover:bg-[#43352E] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun (Logout)</span>
                </button>

                {isConfirmingDelete ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                    <p className="text-[11px] text-red-700 font-semibold">
                      Masukkan kata sandi untuk konfirmasi hapus akun:
                    </p>
                    <input
                      type="password"
                      placeholder="Kata sandi"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-red-300 bg-white text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsConfirmingDelete(false)}
                        className="flex-1 py-1.5 text-xs text-gray-600 bg-white border rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleDeleteAccountConfirm}
                        className="flex-1 py-1.5 text-xs text-white bg-red-600 font-bold rounded-lg"
                      >
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="w-full text-center text-[11px] text-red-500 hover:underline pt-1"
                  >
                    Hapus Akun Permanen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW: LOGIN FORM */}
          {!currentUser && mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#55443B]">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#8F483D] hover:underline"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk ke BundaBudget'}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#EFE8E1]"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#A8988E]">atau</span>
                <div className="flex-grow border-t border-[#EFE8E1]"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white hover:bg-[#FAF4ED] border border-[#E2D6CB] text-[#55443B] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-[#78665D]">Belum memiliki akun? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-[11px] font-bold text-[#8F483D] hover:underline"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER FORM */}
          {!currentUser && mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Nama Tampilan
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Contoh: Bunda Sarah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Ketik ulang kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Membuat Akun...' : 'Daftar Akun Baru'}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-[#78665D]">Sudah punya akun? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[11px] font-bold text-[#8F483D] hover:underline"
                >
                  Masuk di Sini
                </button>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {!currentUser && mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-xs text-[#78665D] leading-relaxed">
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur
                ulang kata sandi Anda.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A8988E] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#55443B] hover:bg-[#43352E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Tautan Reset Sandi'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[11px] font-bold text-[#8F483D] hover:underline"
                >
                  ← Kembali ke Halaman Masuk
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
