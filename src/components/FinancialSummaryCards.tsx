import React from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface FinancialSummaryCardsProps {
  monthlyBudget: number;
  totalExpense: number;
  savingsTarget: number;
  remainingBudget: number;
  todayExpense: number;
  thisWeekExpense: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  monthlyBudget,
  totalExpense,
  savingsTarget,
  remainingBudget,
  todayExpense,
  thisWeekExpense,
}) => {
  const isOverBudget = remainingBudget < 0;
  const isNearLimit = !isOverBudget && monthlyBudget > 0 && remainingBudget <= monthlyBudget * 0.2;
  const percentUsed = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Friendly Budget Health Notification if Over or Near Limit */}
      {isOverBudget && (
        <div className="bg-[#FFF1F0] border border-[#F3C8C2] rounded-2xl p-3.5 flex items-start gap-3 text-xs sm:text-sm text-[#923429] shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#C94D3F] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Pengeluaran melebihi budget bulanan!</span>
            <p className="mt-0.5 text-xs text-[#A1473C]">
              Bunda sudah melebihi budget sebesar{' '}
              <strong className="underline">{formatRupiah(Math.abs(remainingBudget))}</strong>. Tenang
              Bunda, yuk evaluasi pos belanja non-primer atau sesuaikan budget di menu Atur Budget.
            </p>
          </div>
        </div>
      )}

      {isNearLimit && !isOverBudget && (
        <div className="bg-[#FFFBEB] border border-[#F8E3A9] rounded-2xl p-3.5 flex items-start gap-3 text-xs sm:text-sm text-[#876214] shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#C9911C] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Budget mendekati batas aman ({percentUsed}% terpakai)</span>
            <p className="mt-0.5 text-xs text-[#9B7322]">
              Sisa budget tinggal <strong className="underline">{formatRupiah(remainingBudget)}</strong>.
              Yuk prioritaskan belanja bahan pokok dulu sampai akhir bulan ya Bunda.
            </p>
          </div>
        </div>
      )}

      {/* Grid of 6 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* 1. Budget Bulanan */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#DFCFC0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Budget Bulan Ini
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#FAF1E8] flex items-center justify-center text-[#8F483D]">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#55443B] truncate tracking-tight">
            {formatRupiah(monthlyBudget)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70] flex items-center gap-1">
            <span>Target pagu belanja</span>
          </div>
        </div>

        {/* 2. Total Pengeluaran */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#DFCFC0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Total Belanja
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#FAECEB] flex items-center justify-center text-[#C94D3F]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#C94D3F] truncate tracking-tight">
            {formatRupiah(totalExpense)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70]">
            <span className="font-semibold text-[#55443B]">{percentUsed}%</span> dari budget
          </div>
        </div>

        {/* 3. Sisa Budget */}
        <div
          className={`border rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden transition-colors ${
            isOverBudget
              ? 'bg-[#FFF5F4] border-[#F2CAC4]'
              : 'bg-white border-[#EFE8E1] hover:border-[#DFCFC0]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Sisa Budget
            </span>
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                isOverBudget
                  ? 'bg-[#FBE4E1] text-[#C94D3F]'
                  : 'bg-[#EDF0E9] text-[#6E735F]'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p
            className={`text-base sm:text-lg font-bold truncate tracking-tight ${
              isOverBudget ? 'text-[#C94D3F]' : 'text-[#50664B]'
            }`}
          >
            {formatRupiah(remainingBudget)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70]">
            {isOverBudget ? '⚠️ Defisit anggaran' : 'Bisa dibelanjakan'}
          </div>
        </div>

        {/* 4. Alokasi Tabungan */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#DFCFC0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Target Tabungan
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#8C7335]">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#8C7335] truncate tracking-tight">
            {formatRupiah(savingsTarget)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70]">
            Simpanan mandiri
          </div>
        </div>

        {/* 5. Pengeluaran Hari Ini */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#DFCFC0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Belanja Hari Ini
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#FAF4ED] flex items-center justify-center text-[#8F483D]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#55443B] truncate tracking-tight">
            {formatRupiah(todayExpense)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70]">
            Total transaksi hari ini
          </div>
        </div>

        {/* 6. Pengeluaran Minggu Ini */}
        <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#DFCFC0] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-medium text-[#78665D]">
              Minggu Ini (Sen-Min)
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#FAF4ED] flex items-center justify-center text-[#8F483D]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#55443B] truncate tracking-tight">
            {formatRupiah(thisWeekExpense)}
          </p>
          <div className="mt-2 text-[10px] sm:text-[11px] text-[#8C7A70]">
            Pekan berjalan
          </div>
        </div>
      </div>
    </div>
  );
};
