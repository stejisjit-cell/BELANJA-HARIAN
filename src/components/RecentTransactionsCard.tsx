import React from 'react';
import { ArrowRight, ChevronRight, FileText, Image as ImageIcon, Plus, Store } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatIndoDate, formatRupiah } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  categoriesMap: Map<string, Category>;
  onViewAll: () => void;
  onOpenAddExpense: () => void;
  onSelectTransaction: (tr: Transaction) => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  categoriesMap,
  onViewAll,
  onOpenAddExpense,
  onSelectTransaction,
}) => {
  const recentItems = transactions.slice(0, 5);

  return (
    <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif-heading font-bold text-lg text-[#55443B]">
            Transaksi Belanja Terbaru
          </h3>
          <p className="text-xs text-[#78665D]">
            Catatan belanja harian yang baru saja dimasukkan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-[#8F483D] hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recentItems.length === 0 ? (
        <div className="text-center py-10 px-4 bg-[#FAF5F0] rounded-2xl border border-dashed border-[#E3D5C8]">
          <p className="text-sm font-semibold text-[#55443B]">Belum ada belanja yang dicatat bulan ini</p>
          <p className="text-xs text-[#8C7A70] mt-1 max-w-xs mx-auto">
            Yuk catat belanja dapur atau keperluan hari ini agar keuangan tetap rapi dan terukur!
          </p>
          <button
            onClick={onOpenAddExpense}
            className="mt-3.5 px-4 py-2 bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Belanja Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentItems.map((tr) => {
            const cat = categoriesMap.get(tr.categoryId);
            return (
              <div
                key={tr.id}
                onClick={() => onSelectTransaction(tr)}
                className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-[#EFE8E1] hover:border-[#DDCFC3] bg-[#FFFDFB] hover:bg-[#FAF6F2] transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${cat?.color || '#A7AB98'}25` }}
                  >
                    <CategoryIcon
                      name={cat?.icon || 'MoreHorizontal'}
                      color={cat?.color || '#55443B'}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-[#55443B] truncate">
                        {tr.itemName}
                      </h4>
                      {tr.receiptImage && (
                        <span className="p-0.5 rounded-md bg-[#EDF0E9] text-[#6E735F] text-[10px]" title="Ada foto struk">
                          <ImageIcon className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] flex-wrap mt-0.5">
                      <span className="font-medium text-[#78665D]">
                        {cat?.name || 'Lain-lain'}
                      </span>
                      <span>•</span>
                      <span>{formatIndoDate(tr.date)}</span>
                      {tr.storeName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <Store className="w-3 h-3 shrink-0" />
                            {tr.storeName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5 pl-2">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#55443B]">
                      {formatRupiah(tr.totalAmount)}
                    </p>
                    <p className="text-[10px] text-[#8C7A70]">
                      {tr.quantity > 1 ? `${tr.quantity}x @${formatRupiah(tr.unitPrice)}` : tr.paymentMethod}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#B5A599] group-hover:text-[#55443B] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
