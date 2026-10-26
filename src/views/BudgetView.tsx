import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Percent,
  PiggyBank,
  Save,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { Category, MonthlyBudgetConfig } from '../types/finance';
import {
  formatRupiah,
  formatYearMonth,
  parseRupiahInput,
} from '../utils/formatters';

interface BudgetViewProps {
  selectedMonth: string;
  budgetConfig: MonthlyBudgetConfig | null;
  categories: Category[];
  onSaveBudget: (config: MonthlyBudgetConfig) => Promise<any>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  selectedMonth,
  budgetConfig,
  categories,
  onSaveBudget,
}) => {
  const [totalBudgetInput, setTotalBudgetInput] = useState<string>('5000000');
  const [savingsTargetInput, setSavingsTargetInput] = useState<string>('1000000');
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');
  const [inputMode, setInputMode] = useState<'nominal' | 'percent'>('nominal');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (budgetConfig) {
      setTotalBudgetInput(budgetConfig.totalBudget.toLocaleString('id-ID'));
      setSavingsTargetInput(budgetConfig.savingsTarget.toLocaleString('id-ID'));
      setAllocations({ ...(budgetConfig.categoryAllocations || {}) });
      setNotes(budgetConfig.notes || '');
    } else {
      const initial: Record<string, number> = {};
      categories.forEach((c) => {
        initial[c.id] = c.allocatedBudget || 300000;
      });
      setAllocations(initial);
    }
  }, [budgetConfig, categories]);

  const totalBudget = parseRupiahInput(totalBudgetInput);
  const savingsTarget = parseRupiahInput(savingsTargetInput);

  // Calculate sum of category allocations
  const sumAllocations = Object.values(allocations).reduce((a, b) => a + (b || 0), 0);
  const remainingUnallocated = totalBudget - sumAllocations;
  const isOverAllocated = remainingUnallocated < 0;

  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseRupiahInput(e.target.value);
    setTotalBudgetInput(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleSavingsTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseRupiahInput(e.target.value);
    setSavingsTargetInput(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleCategoryNominalChange = (catId: string, value: string) => {
    const num = parseRupiahInput(value);
    setAllocations((prev) => ({
      ...prev,
      [catId]: num,
    }));
  };

  const handleCategoryPercentChange = (catId: string, percentStr: string) => {
    const pct = parseFloat(percentStr) || 0;
    const nominal = Math.round((pct / 100) * totalBudget);
    setAllocations((prev) => ({
      ...prev,
      [catId]: nominal,
    }));
  };

  const handleAutoDistribute = () => {
    // Proportional auto distribute
    if (categories.length === 0 || totalBudget <= 0) return;
    const perCat = Math.floor(totalBudget / categories.length);
    const newAlloc: Record<string, number> = {};
    categories.forEach((c) => {
      newAlloc[c.id] = perCat;
    });
    setAllocations(newAlloc);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveBudget({
        yearMonth: selectedMonth,
        totalBudget,
        savingsTarget,
        categoryAllocations: allocations,
        notes,
        updatedAt: Date.now(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF0E9] text-[#8F483D] border border-[#EADBCE]">
            Periode: {formatYearMonth(selectedMonth)}
          </span>
          <h2 className="font-serif-heading font-extrabold text-xl sm:text-2xl text-[#55443B] mt-2">
            Atur Pagu Anggaran Bulanan
          </h2>
          <p className="text-xs text-[#78665D] mt-0.5">
            Tentukan batas belanja tiap pos kebutuhan agar kas rumah tangga seimbang
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Monthly Budget */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF1E8] flex items-center justify-center text-[#8F483D]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#55443B]">
                Total Budget Belanja Bulanan
              </h3>
              <p className="text-[11px] text-[#8C7A70]">
                Uang belanja operasional rumah tangga
              </p>
            </div>
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3.5 top-2.5 font-bold text-[#8C7A70] text-sm">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={totalBudgetInput}
              onChange={handleTotalBudgetChange}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#E2D6CB] bg-[#FFFDFB] text-[#55443B] font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
            />
          </div>
          <p className="text-[11px] text-[#8C7A70]">
            Contoh: Rp5.000.000 untuk kebutuhan satu bulan penuh.
          </p>
        </div>

        {/* Target Tabungan */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#8C7335]">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#55443B]">
                Target Alokasi Tabungan Bulanan
              </h3>
              <p className="text-[11px] text-[#8C7A70]">
                Disisihkan terpisah (bukan uang belanja habis)
              </p>
            </div>
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3.5 top-2.5 font-bold text-[#8C7A70] text-sm">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={savingsTargetInput}
              onChange={handleSavingsTargetChange}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-[#E2D6CB] bg-[#FFFDFB] text-[#8C7335] font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-[#EFD7A8]"
            />
          </div>
          <p className="text-[11px] text-[#8C7A70]">
            Disimpan untuk dana darurat, qurban, atau pendidikan anak.
          </p>
        </div>
      </div>

      {/* Allocation Status Indicator */}
      <div
        className={`p-4 rounded-3xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
          isOverAllocated
            ? 'bg-[#FFF3F1] border-[#F5C7C1] text-[#923429]'
            : 'bg-[#F6F8F3] border-[#DEE5D6] text-[#4F5943]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isOverAllocated ? (
            <AlertCircle className="w-5 h-5 text-[#C94D3F] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#5A634E] shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isOverAllocated
                ? 'Total alokasi melebihi budget bulanan!'
                : 'Alokasi budget seimbang dan aman.'}
            </span>
            <p className="text-xs opacity-90 mt-0.5">
              Dialokasikan: <strong>{formatRupiah(sumAllocations)}</strong> dari budget{' '}
              <strong>{formatRupiah(totalBudget)}</strong>.
              {isOverAllocated ? (
                <span> Kelebihan: {formatRupiah(Math.abs(remainingUnallocated))}.</span>
              ) : (
                <span> Belum teralokasi: {formatRupiah(remainingUnallocated)}.</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleAutoDistribute}
          className="text-xs px-3 py-1.5 bg-white border border-current rounded-xl font-bold shadow-2xs hover:bg-[#FAF6F2] transition-colors shrink-0"
        >
          Bagi Rata
        </button>
      </div>

      {/* Category Allocations List */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
              Alokasi Per Kategori Belanja
            </h3>
            <p className="text-xs text-[#78665D]">
              Atur batas maksimal belanja per pos kebutuhan
            </p>
          </div>

          {/* Toggle between Nominal Rp and Percentage % */}
          <div className="flex items-center p-1 bg-[#FAF4ED] rounded-xl border border-[#EBE1D7] text-xs font-semibold">
            <button
              onClick={() => setInputMode('nominal')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                inputMode === 'nominal'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#8C7A70]'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Rupiah (Rp)</span>
            </button>
            <button
              onClick={() => setInputMode('percent')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                inputMode === 'percent'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#8C7A70]'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Persen (%)</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {categories.map((c) => {
            const currentAlloc = allocations[c.id] ?? c.allocatedBudget ?? 0;
            const percentVal = totalBudget > 0 ? Math.round((currentAlloc / totalBudget) * 100) : 0;

            return (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#EFE8E1] bg-[#FFFDFB] hover:bg-[#FAF6F2] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${c.color}25` }}
                  >
                    <CategoryIcon name={c.icon} color={c.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#55443B]">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-[#8C7A70]">
                      Porsi dari budget: <strong>{percentVal}%</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {inputMode === 'nominal' ? (
                    <div className="relative w-40">
                      <span className="absolute left-3 top-2 text-xs font-bold text-[#8C7A70]">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentAlloc > 0 ? currentAlloc.toLocaleString('id-ID') : ''}
                        onChange={(e) => handleCategoryNominalChange(c.id, e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm font-bold text-[#55443B] text-right focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                      />
                    </div>
                  ) : (
                    <div className="relative w-28">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentVal}
                        onChange={(e) => handleCategoryPercentChange(c.id, e.target.value)}
                        className="w-full pr-7 pl-3 py-1.5 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm font-bold text-[#55443B] text-right focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-[#8C7A70]">
                        %
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Notes */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
        <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
          Catatan Keuangan Bulan Ini
        </h3>
        <p className="text-xs text-[#78665D]">
          Pengingat penting seperti persiapan arisan, belanja awal semester, atau diskon tahunan
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis rencana atau pengingat keuangan Bunda di sini..."
          className="w-full p-3.5 rounded-2xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs sm:text-sm text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
        />
      </div>

      {/* Bottom Save Action Button */}
      <div className="text-right pb-10">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>Simpan Seluruh Pengaturan Budget</span>
        </button>
      </div>
    </div>
  );
};
