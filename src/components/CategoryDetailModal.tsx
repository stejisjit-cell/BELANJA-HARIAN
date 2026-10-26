import React from 'react';
import { Plus, X } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatIndoDate, formatRupiah } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryDetailModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  monthlyTransactions: Transaction[];
  allocatedBudget: number;
  onAddInThisCategory: (catId: string) => void;
  onSelectTransaction: (tr: Transaction) => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  isOpen,
  onClose,
  monthlyTransactions,
  allocatedBudget,
  onAddInThisCategory,
  onSelectTransaction,
}) => {
  if (!isOpen || !category) return null;

  const categoryTransactions = monthlyTransactions.filter(
    (t) => t.categoryId === category.id
  );

  const totalSpent = categoryTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const remaining = allocatedBudget - totalSpent;
  const percent = allocatedBudget > 0 ? Math.round((totalSpent / allocatedBudget) * 100) : 0;
  const isOver = totalSpent > allocatedBudget;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: `${category.color}25` }}
            >
              <CategoryIcon name={category.icon} color={category.color} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-lg text-[#55443B]">
                {category.name}
              </h3>
              <p className="text-xs text-[#8C7A70]">
                Rincian transaksi belanja bulan ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C8C84] hover:text-[#55443B] hover:bg-[#FAF4ED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budget Summary Banner */}
        <div className="my-3.5 p-4 rounded-2xl bg-[#FAF5F0] border border-[#EFE4D9] space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] sm:text-xs text-[#8C7A70] block">Pagu Budget</span>
              <span className="text-xs sm:text-sm font-bold text-[#55443B]">
                {formatRupiah(allocatedBudget)}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-[#8C7A70] block">Terpakai</span>
              <span className="text-xs sm:text-sm font-bold text-[#C94D3F]">
                {formatRupiah(totalSpent)}
              </span>
            </div>
            <div>
              <span className="text-[10px] sm:text-xs text-[#8C7A70] block">Sisa / Selisih</span>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  isOver ? 'text-[#C94D3F]' : 'text-[#50664B]'
                }`}
              >
                {remaining >= 0 ? formatRupiah(remaining) : `-${formatRupiah(Math.abs(remaining))}`}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#EAE0D5] h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                isOver ? 'bg-[#DDA29B]' : percent >= 80 ? 'bg-[#EFD7A8]' : 'bg-[#A7AB98]'
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#8C7A70]">
            <span>{categoryTransactions.length} item belanja</span>
            <span>{percent}% dari budget kategori</span>
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {categoryTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8C7A70] bg-[#FAF8F5] rounded-2xl">
              Belum ada belanja yang dicatat untuk kategori ini.
            </div>
          ) : (
            categoryTransactions.map((tr) => (
              <div
                key={tr.id}
                onClick={() => {
                  onClose();
                  onSelectTransaction(tr);
                }}
                className="p-3 rounded-2xl border border-[#EFE8E1] hover:border-[#DDCFC3] bg-white hover:bg-[#FAF6F2] transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#55443B]">
                    {tr.itemName}
                  </h5>
                  <p className="text-[11px] text-[#8C7A70]">
                    {formatIndoDate(tr.date)} • {tr.storeName || tr.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm text-[#55443B]">
                    {formatRupiah(tr.totalAmount)}
                  </p>
                  <p className="text-[10px] text-[#8C7A70]">
                    {tr.quantity}x @{formatRupiah(tr.unitPrice)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-[#EFE8E1] flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-[#78665D] hover:bg-[#FAF4ED] text-xs font-semibold"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onAddInThisCategory(category.id);
            }}
            className="px-4 py-2 rounded-xl bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah di Kategori Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
