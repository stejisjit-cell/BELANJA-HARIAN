import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Download,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { batchImportLocalDataToCloud } from '../services/firestoreSync';
import { Category, MonthlyBudgetConfig, SavingsGoal, ShoppingItem, Transaction } from '../types/finance';
import { downloadJSONFile } from '../utils/exportData';

interface LocalDataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  localData: {
    transactions: Transaction[];
    categories: Category[];
    budgets: MonthlyBudgetConfig[];
    savingsGoals: SavingsGoal[];
    shoppingList: ShoppingItem[];
  };
  onMigrationSuccess: () => void;
}

export const LocalDataMigrationModal: React.FC<LocalDataMigrationModalProps> = ({
  isOpen,
  onClose,
  uid,
  localData,
  onMigrationSuccess,
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalItems =
    localData.transactions.length +
    localData.categories.length +
    localData.budgets.length +
    localData.savingsGoals.length +
    localData.shoppingList.length;

  const handleBackupDownload = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSONFile(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: localData,
      },
      `Backup_Pra_Migrasi_BundaBudget_${dateStr}.json`
    );
  };

  const handleStartMigration = async () => {
    setErrorMsg(null);
    setIsMigrating(true);
    setProgress(10);
    setProgressMessage('Menghubungkan ke database Cloud...');

    try {
      const res = await batchImportLocalDataToCloud(uid, localData, (pct, msg) => {
        setProgress(pct);
        setProgressMessage(msg);
      });
      setResult({ imported: res.importedCount, skipped: res.skippedCount });
      onMigrationSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memindahkan data ke cloud.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF0E9] flex items-center justify-center text-[#5A634E] shadow-2xs">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
                Migrasi Data Versi 1 ke Akun Cloud
              </h3>
              <p className="text-xs text-[#8C7A70]">
                Sinkronkan catatan lokal Bunda agar bisa dibuka di HP & Laptop
              </p>
            </div>
          </div>
          {!isMigrating && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-[#9C8C84] hover:text-[#55443B]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs sm:text-sm text-[#55443B]">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="p-4 bg-[#F2F6ED] border border-[#DEE7D6] rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#5A634E] mx-auto" />
              <h4 className="font-bold text-base text-[#4F5943]">
                Migrasi Data Berhasil! 🎉
              </h4>
              <p className="text-xs text-[#6A785B]">
                Sebanyak <strong>{result.imported}</strong> transaksi dan pengaturan baru berhasil
                disimpan di akun cloud Bunda.
                {result.skipped > 0 && ` (${result.skipped} item yang sudah ada dilewati agar tidak dobel).`}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#5A634E] text-white font-bold rounded-xl text-xs"
              >
                Tutup & Mulai Gunakan
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-[#78665D]">
                Kami menemukan data pencatatan keuangan tersimpan di HP/perangkat ini. Bunda dapat
                memindahkannya ke akun cloud secara otomatis agar riwayat belanja tetap utuh dan
                tersinkron di perangkat lain.
              </p>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#FAF5F0] p-3.5 rounded-2xl border border-[#EFE5DB] text-xs">
                <div>
                  <span className="text-[#8C7A70] block">Transaksi Belanja</span>
                  <span className="font-bold text-[#55443B]">
                    {localData.transactions.length} baris
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Pagu Budget</span>
                  <span className="font-bold text-[#55443B]">
                    {localData.budgets.length} periode
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Kategori Belanja</span>
                  <span className="font-bold text-[#55443B]">
                    {localData.categories.length} pos
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Target Tabungan</span>
                  <span className="font-bold text-[#55443B]">
                    {localData.savingsGoals.length} tujuan
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Checklist Pasar</span>
                  <span className="font-bold text-[#55443B]">
                    {localData.shoppingList.length} item
                  </span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Total Catatan</span>
                  <span className="font-bold text-[#8F483D]">{totalItems} data</span>
                </div>
              </div>

              {/* Safe Backup First */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-[#EFE8E1] bg-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8F483D]" />
                  <span className="text-xs font-semibold text-[#55443B]">
                    Unduh file cadangan dulu agar lebih tenang
                  </span>
                </div>
                <button
                  onClick={handleBackupDownload}
                  className="px-3 py-1.5 bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-[#E8DACB] text-[#8F483D] text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup JSON</span>
                </button>
              </div>

              {/* Progress Indicator if running */}
              {isMigrating && (
                <div className="space-y-2 p-3 bg-[#FAF7F4] rounded-2xl border border-[#EFE6DC]">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-[#55443B]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8F483D]" />
                      <span>{progressMessage}</span>
                    </span>
                    <span className="text-[#8F483D]">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#EAE0D5] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DDA29B] to-[#A7AB98] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!result && (
          <div className="pt-3.5 border-t border-[#EFE8E1] flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isMigrating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2D6CB] text-[#78665D] hover:bg-[#FAF4ED] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleStartMigration}
              disabled={isMigrating || totalItems === 0}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Impor Data Lama ke Akun Saya</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
