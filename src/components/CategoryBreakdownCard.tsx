import React, { useState } from 'react';
import { ChevronRight, Filter, Plus, Tag } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBreakdownCardProps {
  categories: Category[];
  monthlyTransactions: Transaction[];
  categoryBreakdown: Array<
    Category & {
      spent: number;
      remaining: number;
      percent: number;
      status: 'safe' | 'warning' | 'danger';
      txCount: number;
    }
  >;
  onSelectCategory: (category: Category) => void;
  onOpenManageCategories: () => void;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  categoryBreakdown,
  onSelectCategory,
  onOpenManageCategories,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'over' | 'warning'>('all');

  const filteredCategories = categoryBreakdown.filter((cat) => {
    if (filterMode === 'over') return cat.status === 'danger';
    if (filterMode === 'warning') return cat.status === 'warning';
    return true;
  });

  return (
    <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif-heading font-bold text-lg text-[#55443B]">
              Rincian Pengeluaran Kategori
            </h3>
            <p className="text-xs text-[#78665D]">
              Klik salah satu kategori untuk melihat daftar belanja detailnya
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenManageCategories}
              className="px-3 py-1.5 bg-[#FAF4ED] hover:bg-[#F5ECE3] text-[#78665D] hover:text-[#55443B] text-xs font-semibold rounded-xl border border-[#EBE1D7] transition-colors flex items-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-[#8F483D]" />
              <span>Kelola Kategori</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Semua ({categoryBreakdown.length})
          </button>
          <button
            onClick={() => setFilterMode('over')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === 'over'
                ? 'bg-[#DDA29B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#A05B54] hover:bg-[#FBECEB]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#C94D3F]" />
            Lebih Budget ({categoryBreakdown.filter((c) => c.status === 'danger').length})
          </button>
          <button
            onClick={() => setFilterMode('warning')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === 'warning'
                ? 'bg-[#EFD7A8] text-[#55443B] shadow-xs'
                : 'bg-[#FAF4ED] text-[#8C7335] hover:bg-[#FDF6E2]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4A334]" />
            Waspada 80%+ ({categoryBreakdown.filter((c) => c.status === 'warning').length})
          </button>
        </div>

        {/* Category List / Table representation */}
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredCategories.map((cat) => {
            const isDanger = cat.status === 'danger';
            const isWarning = cat.status === 'warning';

            // Status color config
            const badgeBg = isDanger
              ? 'bg-[#FAECEB] text-[#C94D3F] border-[#F5C4BF]'
              : isWarning
              ? 'bg-[#FDF7E7] text-[#9E7B28] border-[#F5E2A8]'
              : 'bg-[#EDF0E9] text-[#5A634E] border-[#DCE2D3]';

            const progressBarColor = isDanger
              ? 'bg-[#DDA29B]'
              : isWarning
              ? 'bg-[#EFD7A8]'
              : 'bg-[#A7AB98]';

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="group p-3.5 rounded-2xl border border-[#EFE8E1] hover:border-[#DDCFC3] bg-[#FFFDFB] hover:bg-[#FAF6F2] transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-[#55443B] truncate">
                          {cat.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}
                        >
                          {cat.percent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C7A70]">
                        {cat.txCount} transaksi tercatat
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#55443B]">
                        {formatRupiah(cat.spent)}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#8C7A70]">
                        Budget: {formatRupiah(cat.allocatedBudget)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#B5A599] group-hover:text-[#55443B] transition-colors" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#EFE8E1] h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                    style={{ width: `${Math.min(cat.percent, 100)}%` }}
                  />
                </div>

                {/* Sisa or Over-budget footer */}
                <div className="flex justify-between items-center text-[10px] text-[#8C7A70] mt-1.5">
                  <span>
                    {isDanger
                      ? '⚠️ Over-budget'
                      : isWarning
                      ? '⚡ Mendekati batas'
                      : '✓ Masih aman'}
                  </span>
                  <span className={isDanger ? 'font-bold text-[#C94D3F]' : 'font-medium text-[#5A634E]'}>
                    {cat.remaining >= 0
                      ? `Sisa: ${formatRupiah(cat.remaining)}`
                      : `Lebih: ${formatRupiah(Math.abs(cat.remaining))}`}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-xs text-[#8C7A70] bg-[#FAF6F2] rounded-2xl">
              Tidak ada kategori yang sesuai filter ini.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#EFE8E1] flex items-center justify-between text-[11px] text-[#8C7A70]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#A7AB98]" /> Aman (&lt;80%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#EFD7A8]" /> Waspada
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#DDA29B]" /> Melebihi
          </span>
        </div>
      </div>
    </div>
  );
};
