import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudCheck,
  CloudOff,
  Plus,
  RefreshCw,
  Settings,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SyncStatus } from '../hooks/useFinanceData';
import { ActiveTab } from '../types/finance';
import { formatYearMonth, MONTH_NAMES_ID } from '../utils/formatters';
import { PWAInstallBanner } from './PWAInstallBanner';

interface HeaderProps {
  selectedMonth: string; // "YYYY-MM"
  onMonthChange: (newMonth: string) => void;
  onOpenAddExpense: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  syncStatus: SyncStatus;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  onMonthChange,
  onOpenAddExpense,
  activeTab,
  onSelectTab,
  syncStatus,
  onOpenAuth,
}) => {
  const { currentUser, userProfile } = useAuth();

  // Indonesian greeting based on local time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const displayName = userProfile?.displayName ? `, ${userProfile.displayName}` : ' Bunda';
    if (hour >= 4 && hour < 11) return `Selamat pagi${displayName}! ☀️ Mari atur belanja hari ini dengan berkah.`;
    if (hour >= 11 && hour < 15) return `Selamat siang${displayName}! 🍲 Jangan lupa catat belanja pasar tadi pagi ya.`;
    if (hour >= 15 && hour < 18) return `Selamat sore${displayName}! ☕ Waktu santai sejenak sambil cek pengeluaran.`;
    return `Selamat malam${displayName}! 🌙 Istirahat yang cukup, keuangan keluarga tetap aman terjaga.`;
  }, [userProfile]);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(e.target.value);
  };

  // Generate selectable months (current year +- 1)
  const monthOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const options: { value: string; label: string }[] = [];
    const years = [currentYear - 1, currentYear, currentYear + 1];
    years.forEach((yr) => {
      for (let mo = 1; mo <= 12; mo++) {
        const val = `${yr}-${String(mo).padStart(2, '0')}`;
        options.push({
          value: val,
          label: `${MONTH_NAMES_ID[mo - 1]} ${yr}`,
        });
      }
    });
    return options;
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#FFF9F5]/90 backdrop-blur-md border-b border-[#EFE8E1] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={() => onSelectTab('dashboard')}
              className="cursor-pointer group flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3D7D1] to-[#DDA29B] p-0.5 shadow-xs flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/icon.svg"
                  alt="BundaBudget Logo"
                  className="w-9 h-9 rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-heading font-bold text-lg sm:text-xl text-[#55443B] tracking-tight">
                    BundaBudget
                  </h1>

                  {/* Sync Status Badge */}
                  {syncStatus === 'synced' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAuth();
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDF0E9] text-[#5A634E] border border-[#DEE3D7] cursor-pointer hover:bg-[#E3E8DC]"
                      title="Data tersinkronisasi otomatis dengan Cloud"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5A634E]" />
                      <span>Online Cloud</span>
                    </span>
                  )}

                  {syncStatus === 'syncing' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF4ED] text-[#8F483D] border border-[#EADBCE]">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Menyinkronkan...</span>
                    </span>
                  )}

                  {syncStatus === 'offline' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF3E0] text-[#B76E00] border border-[#FFE0B2]">
                      <CloudOff className="w-2.5 h-2.5" />
                      <span>Offline (Cache)</span>
                    </span>
                  )}

                  {syncStatus === 'local' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAuth();
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF0E9] text-[#8F483D] border border-[#EADBCE] cursor-pointer hover:bg-[#F5E6D8]"
                      title="Klik untuk login & aktifkan sinkronisasi antarperangkat"
                    >
                      <span>💾 Mode Lokal</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[#78665D] line-clamp-1">
                  {greeting}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Icons on Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAuth}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                currentUser
                  ? 'bg-[#EDF0E9] border-[#DCE2D3] text-[#5A634E]'
                  : 'bg-[#FAF0E9] border-[#EADBCE] text-[#8F483D]'
              }`}
              title="Akun Bunda"
            >
              <User className="w-4 h-4" />
            </button>
            <PWAInstallBanner variant="button" />
            <button
              onClick={() => onSelectTab('settings')}
              className={`p-2 rounded-xl border text-[#55443B] transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#F3D7D1] border-[#E2B7AE]'
                  : 'bg-white border-[#EFE8E1] hover:bg-[#FAF4ED]'
              }`}
              title="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section: Month Selector, User Account & Add Button */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {/* Month Navigator */}
          <div className="flex items-center bg-white border border-[#EFE8E1] rounded-2xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-[#FAF4ED] text-[#78665D] hover:text-[#55443B] transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative px-2">
              <span className="text-xs sm:text-sm font-bold text-[#55443B] cursor-pointer">
                {formatYearMonth(selectedMonth)}
              </span>
              <select
                value={selectedMonth}
                onChange={handleMonthSelect}
                aria-label="Pilih Periode Bulan dan Tahun"
                className="absolute inset-0 opacity-0 cursor-pointer w-full text-xs"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-[#FAF4ED] text-[#78665D] hover:text-[#55443B] transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop User Account Button */}
          <button
            onClick={onOpenAuth}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold shadow-2xs transition-all ${
              currentUser
                ? 'bg-[#FAF6F2] hover:bg-[#F2EAE2] border-[#E2D6CB] text-[#55443B]'
                : 'bg-[#FAF0E9] hover:bg-[#F5E6D8] border-[#E8DACB] text-[#8F483D]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? userProfile?.displayName || 'Profil' : 'Masuk / Daftar'}</span>
          </button>

          {/* Desktop Install App Button */}
          <div className="hidden sm:block">
            <PWAInstallBanner variant="button" />
          </div>

          {/* Add Expense Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Catat Belanja</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
