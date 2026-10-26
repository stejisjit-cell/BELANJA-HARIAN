import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Filter,
  Image as ImageIcon,
  Plus,
  Receipt,
  Search,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { Category, Transaction } from '../types/finance';
import { exportTransactionsToCSV } from '../utils/exportData';
import {
  formatIndoDate,
  formatRupiah,
  getTodayDateString,
  isSameWeek,
} from '../utils/formatters';

interface ExpensesViewProps {
  transactions: Transaction[];
  categories: Category[];
  categoriesMap: Map<string, Category>;
  selectedMonth: string;
  onOpenAddExpense: () => void;
  onSelectTransaction: (tr: Transaction) => void;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  transactions,
  categories,
  categoriesMap,
  selectedMonth,
  onOpenAddExpense,
  onSelectTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract all unique stores for filter dropdown
  const storeList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.storeName && t.storeName.trim()) set.add(t.storeName.trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    const todayStr = getTodayDateString();
    const currentYear = selectedMonth.split('-')[0];

    return transactions
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.itemName.toLowerCase().includes(q);
          const matchStore = t.storeName ? t.storeName.toLowerCase().includes(q) : false;
          const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
          if (!matchName && !matchStore && !matchNotes) return false;
        }

        // Period filter
        if (periodFilter === 'today') {
          if (t.date !== todayStr) return false;
        } else if (periodFilter === 'week') {
          if (!isSameWeek(t.date, todayStr)) return false;
        } else if (periodFilter === 'month') {
          if (!t.date.startsWith(selectedMonth)) return false;
        } else if (periodFilter === 'year') {
          if (!t.date.startsWith(currentYear)) return false;
        }

        // Category filter
        if (selectedCategoryFilter !== 'all') {
          if (t.categoryId !== selectedCategoryFilter) return false;
        }

        // Store filter
        if (selectedStoreFilter !== 'all') {
          if (t.storeName !== selectedStoreFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === 'amount-asc') {
          return a.totalAmount - b.totalAmount;
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    periodFilter,
    selectedCategoryFilter,
    selectedStoreFilter,
    sortBy,
    selectedMonth,
  ]);

  // Total summary of filtered active data
  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  }, [filteredTransactions]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      filteredTransactions,
      categoriesMap,
      `Belanja_${periodFilter}_${selectedMonth}`
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Banner: Total Metrics matching current filter */}
      <div className="bg-gradient-to-r from-[#FAF2EC] via-[#FDF7F3] to-[#FAF2EC] border border-[#EFE4DA] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#8C7A70] uppercase tracking-wider">
            Total Sesuai Filter Aktif
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h2 className="font-serif-heading font-extrabold text-xl sm:text-2xl text-[#55443B]">
              {formatRupiah(totalFilteredAmount)}
            </h2>
            <span className="text-xs text-[#78665D]">
              ({filteredTransactions.length} transaksi belanja)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF4ED] border border-[#E2D6CB] text-xs font-semibold text-[#55443B] flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#8F483D]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Belanja</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8988E] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama barang, toko, atau catatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs sm:text-sm text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#A8988E] hover:text-[#55443B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Urutkan Transaksi Belanja"
                className="px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs font-semibold text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
              >
                <option value="date-desc">Tanggal Terbaru</option>
                <option value="date-asc">Tanggal Terlama</option>
                <option value="amount-desc">Harga Tertinggi</option>
                <option value="amount-asc">Harga Terendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Period Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8C7A70] font-semibold shrink-0">Periode:</span>
          <button
            onClick={() => {
              setPeriodFilter('month');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
              periodFilter === 'month'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => {
              setPeriodFilter('today');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
              periodFilter === 'today'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => {
              setPeriodFilter('week');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
              periodFilter === 'week'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => {
              setPeriodFilter('year');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
              periodFilter === 'year'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => {
              setPeriodFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
              periodFilter === 'all'
                ? 'bg-[#55443B] text-white shadow-xs'
                : 'bg-[#FAF4ED] text-[#78665D] hover:bg-[#F2E8DF]'
            }`}
          >
            Semua Riwayat
          </button>
        </div>

        {/* Row 3: Category & Store Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F2EAE2] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8C7A70]">Kategori:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter berdasarkan Kategori"
              className="px-2.5 py-1.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-[#55443B] font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {storeList.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#8C7A70]">Toko / Pasar:</span>
              <select
                value={selectedStoreFilter}
                onChange={(e) => {
                  setSelectedStoreFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter berdasarkan Toko atau Pasar"
                className="px-2.5 py-1.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-[#55443B] font-medium"
              >
                <option value="all">Semua Toko</option>
                {storeList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(selectedCategoryFilter !== 'all' ||
            selectedStoreFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategoryFilter('all');
                setSelectedStoreFilter('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-[#9E5D54] hover:underline font-semibold ml-auto"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Transaction List (Cards on Mobile & Clean Responsive Table on Desktop) */}
      <div className="space-y-2.5">
        {paginatedItems.length === 0 ? (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-10 text-center space-y-2 shadow-xs">
            <Receipt className="w-10 h-10 text-[#C4B5A6] mx-auto" />
            <h4 className="font-bold text-sm text-[#55443B]">Tidak ada belanja yang sesuai filter</h4>
            <p className="text-xs text-[#8C7A70]">
              Coba sesuaikan kata kunci pencarian atau ubah filter periode di atas.
            </p>
          </div>
        ) : (
          paginatedItems.map((tr) => {
            const cat = categoriesMap.get(tr.categoryId);
            return (
              <div
                key={tr.id}
                onClick={() => onSelectTransaction(tr)}
                className="group bg-white border border-[#EFE8E1] hover:border-[#DDCFC3] p-3.5 sm:p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
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
                        <span className="p-0.5 rounded-md bg-[#EDF0E9] text-[#6E735F] text-[10px]" title="Ada foto nota">
                          <ImageIcon className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#8C7A70] flex-wrap mt-0.5">
                      <span className="font-semibold text-[#78665D]">
                        {cat?.name || 'Lain-lain'}
                      </span>
                      <span>•</span>
                      <span>{formatIndoDate(tr.date)}</span>
                      {tr.storeName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <Store className="w-3 h-3 shrink-0" />
                            {tr.storeName}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-[#FAF4ED] text-[#78665D]">
                        {tr.paymentMethod}
                      </span>
                    </div>

                    {tr.notes && (
                      <p className="text-[10px] text-[#9C8C84] italic mt-0.5 line-clamp-1">
                        "{tr.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-extrabold text-xs sm:text-base text-[#55443B]">
                    {formatRupiah(tr.totalAmount)}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#8C7A70]">
                    {tr.quantity > 1 ? `${tr.quantity} × ${formatRupiah(tr.unitPrice)}` : '1 barang'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 pb-6 text-xs text-[#78665D]">
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-[#E2D6CB] bg-white disabled:opacity-40 hover:bg-[#FAF4ED]"
            >
              Sebelumnya
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-[#E2D6CB] bg-white disabled:opacity-40 hover:bg-[#FAF4ED]"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
