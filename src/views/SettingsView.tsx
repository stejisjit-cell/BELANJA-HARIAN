import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  HardDrive,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
} from 'lucide-react';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { Category, Transaction } from '../types/finance';
import { downloadJSONFile, exportTransactionsToCSV } from '../utils/exportData';

interface SettingsViewProps {
  transactions: Transaction[];
  categoriesMap: Map<string, Category>;
  onResetData: () => Promise<any>;
  onRestoreDemo: () => Promise<any>;
  onImportJSON: (payload: any) => Promise<any>;
  onExportAllData: () => Promise<any>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  transactions,
  categoriesMap,
  onResetData,
  onRestoreDemo,
  onImportJSON,
  onExportAllData,
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupDownload = async () => {
    setIsBusy(true);
    try {
      const payload = await onExportAllData();
      const dateStr = new Date().toISOString().split('T')[0];
      downloadJSONFile(payload, `Backup_BundaBudget_${dateStr}.json`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleExportCSVAll = () => {
    exportTransactionsToCSV(transactions, categoriesMap, 'Semua_Transaksi_BundaBudget');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsBusy(true);
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        await onImportJSON(json);
        setImportStatus('Data berhasil dipulihkan dari file!');
      } catch (err: any) {
        setImportStatus(`Gagal memulihkan file: ${err?.message || 'File tidak valid'}`);
      } finally {
        setIsBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF0E9] text-[#8F483D] border border-[#EADBCE]">
          Pengaturan & Keamanan
        </span>
        <h2 className="font-serif-heading font-extrabold text-xl sm:text-2xl text-[#55443B] mt-2">
          Penyimpanan Data & Cadangan
        </h2>
        <p className="text-xs text-[#78665D] mt-0.5">
          Data keuangan Bunda 100% tersimpan aman di browser/HP Bunda tanpa dikirim ke server luar
        </p>
      </div>

      {/* PWA Installation Card */}
      <PWAInstallBanner variant="settings" />

      {/* Local Storage Privacy Note */}
      <div className="bg-[#FAF5F0] border border-[#EFE4D9] rounded-3xl p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2.5 font-bold text-sm text-[#55443B]">
          <ShieldCheck className="w-5 h-5 text-[#8F483D]" />
          <span>Privasi & Penyimpanan Offline (IndexedDB)</span>
        </div>
        <p className="text-xs text-[#78665D] leading-relaxed">
          Aplikasi BundaBudget menggunakan database lokal <strong>IndexedDB</strong> pada perangkat Bunda.
          Seluruh data transaksi belanja, target tabungan, dan anggaran tetap tersimpan utuh meskipun halaman ditutup atau saat HP tidak memiliki koneksi internet.
        </p>
        <p className="text-[11px] text-[#8C7A70] italic">
          💡 Catatan: Karena data tersimpan di memori perangkat, data di HP dan laptop tidak otomatis saling tersinkronisasi. Bunda dapat menggunakan fitur Cadangkan (Backup JSON) di bawah untuk memindahkan data antar-perangkat dengan mudah.
        </p>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF1E8] flex items-center justify-center text-[#8F483D]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-heading font-bold text-base text-[#55443B]">
              Cadangan & Pemulihan Data (Backup & Restore)
            </h3>
            <p className="text-xs text-[#78665D]">
              Simpan salinan data Bunda ke file agar aman dari pembersihan browser
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-[#FAF6F2] border border-[#EADBCE] text-xs font-semibold text-[#55443B]">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl border border-[#EFE8E1] bg-[#FFFDFB] space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#55443B] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#8F483D]" />
              <span>Cadangkan Data (JSON)</span>
            </h4>
            <p className="text-[11px] text-[#8C7A70]">
              Download seluruh transaksi, target tabungan, dan kategori ke dalam satu file cadangan aman.
            </p>
            <button
              onClick={handleBackupDownload}
              disabled={isBusy}
              className="mt-2 w-full py-2 bg-[#55443B] hover:bg-[#43352E] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File Cadangan</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl border border-[#EFE8E1] bg-[#FFFDFB] space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#55443B] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#8F483D]" />
              <span>Pulihkan Data (Restore)</span>
            </h4>
            <p className="text-[11px] text-[#8C7A70]">
              Pilih file JSON hasil cadangan sebelumnya untuk mengembalikan seluruh catatan keuangan Bunda.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="mt-2 w-full py-2 bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-[#E8DACB] text-[#8F483D] text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File Backup JSON</span>
            </button>
          </div>
        </div>

        {/* Export CSV */}
        <div className="pt-2">
          <div className="p-4 rounded-2xl border border-[#EFE8E1] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#55443B] flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#5A634E]" />
                <span>Ekspor Seluruh Riwayat ke File Excel / CSV</span>
              </h4>
              <p className="text-[11px] text-[#8C7A70]">
                Buka di Microsoft Excel atau Google Spreadsheet ({transactions.length} baris belanja).
              </p>
            </div>
            <button
              onClick={handleExportCSVAll}
              className="px-4 py-2 bg-white hover:bg-[#F2EAE2] border border-[#E2D6CB] text-xs font-bold text-[#55443B] rounded-xl shadow-2xs flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-serif-heading font-bold text-base text-[#55443B]">
          Data Contoh & Pembersihan
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Restore Demo Data */}
          <div className="flex-1 p-4 rounded-2xl border border-[#EDF0E9] bg-[#FAFBF9] space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#55443B] flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#5A634E]" />
              <span>Muat Ulang Data Contoh Demo</span>
            </h4>
            <p className="text-[11px] text-[#8C7A70]">
              Kembalikan data contoh belanja rumah tangga lengkap dengan simulasi grafik dan tabungan.
            </p>
            <button
              onClick={() => {
                if (confirm('Muat data contoh demo BundaBudget? Data yang belum dicadangkan akan diganti data demo.')) {
                  onRestoreDemo();
                }
              }}
              className="px-4 py-2 bg-[#EDF0E9] hover:bg-[#E3E8DC] text-[#5A634E] text-xs font-bold rounded-xl transition-colors"
            >
              Muat Data Contoh Demo
            </button>
          </div>

          {/* Reset All Data */}
          <div className="flex-1 p-4 rounded-2xl border border-[#FAECEB] bg-[#FFFBFB] space-y-2">
            <h4 className="font-bold text-xs sm:text-sm text-[#C94D3F] flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>Hapus Seluruh Data</span>
            </h4>
            <p className="text-[11px] text-[#8C7A70]">
              Kosongkan semua data belanja, tabungan, dan anggaran dari nol.
            </p>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 bg-[#FAECEB] hover:bg-[#FBE4E2] text-[#C94D3F] text-xs font-bold rounded-xl transition-colors"
            >
              Bersihkan Semua Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#F5C4BF] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#C94D3F]">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-base text-[#55443B]">Konfirmasi Hapus Seluruh Data</h3>
            </div>

            <p className="text-xs text-[#78665D] leading-relaxed">
              Tindakan ini akan <strong>menghapus seluruh transaksi, budget, tabungan, dan checklist</strong> dari browser Bunda. Tindakan ini tidak dapat dibatalkan kecuali Bunda memiliki file cadangan JSON.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE8E1]">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-xs font-semibold text-[#78665D]"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await onResetData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#C94D3F] hover:bg-[#B33E31] text-white text-xs font-bold shadow-xs"
              >
                Ya, Bersihkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
