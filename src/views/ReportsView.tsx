import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { Category, MonthlyBudgetConfig, Transaction } from '../types/finance';
import { exportTransactionsToCSV } from '../utils/exportData';
import {
  DAY_NAMES_ID,
  formatIndoDate,
  formatRupiah,
  formatRupiahCompact,
  formatYearMonth,
  getTodayDateString,
  getWeekDateRange,
  isSameWeek,
  MONTH_NAMES_ID,
} from '../utils/formatters';

interface ReportsViewProps {
  selectedMonth: string;
  transactions: Transaction[];
  categories: Category[];
  categoriesMap: Map<string, Category>;
  budgetConfig: MonthlyBudgetConfig | null;
}

type ReportTab = 'daily' | 'weekly' | 'monthly';

export const ReportsView: React.FC<ReportsViewProps> = ({
  selectedMonth,
  transactions,
  categories,
  categoriesMap,
  budgetConfig,
}) => {
  const [reportTab, setReportTab] = useState<ReportTab>('monthly');
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDateString());

  const totalMonthlyBudget = budgetConfig?.totalBudget ?? 5000000;
  const savingsTarget = budgetConfig?.savingsTarget ?? 1000000;

  // Monthly Transactions
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalMonthlyExpense = useMemo(() => {
    return monthlyTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  }, [monthlyTransactions]);

  const remainingMonthlyBudget = totalMonthlyBudget - totalMonthlyExpense;
  const percentMonthlyUsed = totalMonthlyBudget > 0 ? Math.round((totalMonthlyExpense / totalMonthlyBudget) * 100) : 0;

  // --- A. HARIAN ---
  const dailyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDay);
  }, [transactions, selectedDay]);

  const totalDailyExpense = useMemo(() => {
    return dailyTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  }, [dailyTransactions]);

  // Daily budget reference: total monthly budget / days in month (approx 30)
  const daysInMonth = 30;
  const dailyBudgetAllowance = Math.round(totalMonthlyBudget / daysInMonth);
  const dailyRemaining = dailyBudgetAllowance - totalDailyExpense;

  const dailyCategoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    dailyTransactions.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.totalAmount);
    });
    return Array.from(map.entries())
      .map(([catId, amount]) => ({
        category: categoriesMap.get(catId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [dailyTransactions, categoriesMap]);

  // --- B. MINGGUAN (Senin - Minggu) ---
  const weekInfo = useMemo(() => getWeekDateRange(selectedDay), [selectedDay]);

  const weeklyTransactions = useMemo(() => {
    return transactions.filter((t) => isSameWeek(t.date, selectedDay));
  }, [transactions, selectedDay]);

  const totalWeeklyExpense = useMemo(() => {
    return weeklyTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  }, [weeklyTransactions]);

  // Daily breakdown for the 7 days (Senin to Minggu)
  const weekDaysChartData = useMemo(() => {
    const [y, m, d] = weekInfo.start.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);

    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return days.map((dayLabel, idx) => {
      const cur = new Date(startDate);
      cur.setDate(startDate.getDate() + idx);
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      
      const dayTransactions = weeklyTransactions.filter((t) => t.date === dateStr);
      const amount = dayTransactions.reduce((acc, t) => acc + t.totalAmount, 0);

      return {
        day: dayLabel,
        date: dateStr,
        total: amount,
      };
    });
  }, [weekInfo, weeklyTransactions]);

  const weeklyTopCategory = useMemo(() => {
    const map = new Map<string, number>();
    weeklyTransactions.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.totalAmount);
    });
    let maxCat: Category | undefined;
    let maxAmount = 0;
    map.forEach((amount, catId) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCat = categoriesMap.get(catId);
      }
    });
    return { category: maxCat, amount: maxAmount };
  }, [weeklyTransactions, categoriesMap]);

  // --- C. BULANAN ---
  // Trend chart data (cumulative spending by day of the month)
  const monthlyTrendData = useMemo(() => {
    const map = new Map<number, number>();
    for (let day = 1; day <= 31; day++) map.set(day, 0);

    monthlyTransactions.forEach((t) => {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (dayNum) map.set(dayNum, (map.get(dayNum) || 0) + t.totalAmount);
    });

    let cumulative = 0;
    return Array.from(map.entries())
      .filter(([day]) => day <= 31)
      .map(([day, amount]) => {
        cumulative += amount;
        return {
          day: `Tgl ${day}`,
          harian: amount,
          kumulatif: cumulative,
        };
      });
  }, [monthlyTransactions]);

  // Category breakdown for whole month
  const monthlyCategoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    monthlyTransactions.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.totalAmount);
    });
    return categories
      .map((cat) => ({
        ...cat,
        spent: map.get(cat.id) || 0,
      }))
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [monthlyTransactions, categories]);

  // Export functions
  const handleExportCSV = () => {
    const targetTransactions =
      reportTab === 'daily'
        ? dailyTransactions
        : reportTab === 'weekly'
        ? weeklyTransactions
        : monthlyTransactions;

    exportTransactionsToCSV(
      targetTransactions,
      categoriesMap,
      `Laporan_${reportTab.toUpperCase()}_BundaBudget`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto print:p-0">
      {/* Header & Tabs */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF0E9] text-[#8F483D] border border-[#EADBCE]">
            Laporan Keuangan
          </span>
          <h2 className="font-serif-heading font-extrabold text-xl sm:text-2xl text-[#55443B] mt-2">
            Evaluasi Belanja Rumah Tangga
          </h2>
          <p className="text-xs text-[#78665D] mt-0.5">
            Analisis akurat berdasarkan catatan belanja harian, pekanan, dan bulanan
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF4ED] border border-[#E2D6CB] text-xs font-semibold text-[#55443B] flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#8F483D]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-[#E8DACB] text-xs font-semibold text-[#8F483D] flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Cetak Laporan / PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Period Tabs: Harian, Mingguan, Bulanan */}
      <div className="flex items-center p-1.5 bg-[#FAF4ED] rounded-2xl border border-[#EBE1D7] text-xs sm:text-sm font-bold print:hidden">
        <button
          onClick={() => setReportTab('daily')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            reportTab === 'daily'
              ? 'bg-white text-[#55443B] shadow-xs'
              : 'text-[#8C7A70] hover:text-[#55443B]'
          }`}
        >
          Laporan Harian
        </button>
        <button
          onClick={() => setReportTab('weekly')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            reportTab === 'weekly'
              ? 'bg-white text-[#55443B] shadow-xs'
              : 'text-[#8C7A70] hover:text-[#55443B]'
          }`}
        >
          Laporan Mingguan (Pekan)
        </button>
        <button
          onClick={() => setReportTab('monthly')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            reportTab === 'monthly'
              ? 'bg-white text-[#55443B] shadow-xs'
              : 'text-[#8C7A70] hover:text-[#55443B]'
          }`}
        >
          Laporan Bulanan Penuh
        </button>
      </div>

      {/* ================= A. LAPORAN HARIAN ================= */}
      {reportTab === 'daily' && (
        <div className="space-y-4">
          {/* Date Picker Bar */}
          <div className="bg-white border border-[#EFE8E1] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8F483D]" />
              <span className="text-xs font-semibold text-[#55443B]">Pilih Tanggal:</span>
            </div>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs font-bold text-[#55443B]"
            />
          </div>

          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Total Belanja Hari Ini</span>
              <p className="text-base sm:text-lg font-bold text-[#C94D3F] mt-1">
                {formatRupiah(totalDailyExpense)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">
                {formatIndoDate(selectedDay, true)}
              </span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Jumlah Transaksi</span>
              <p className="text-base sm:text-lg font-bold text-[#55443B] mt-1">
                {dailyTransactions.length} Item
              </p>
              <span className="text-[10px] text-[#8C7A70]">Tercatat di sistem</span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Pagu Harian Ideal</span>
              <p className="text-base sm:text-lg font-bold text-[#55443B] mt-1">
                {formatRupiah(dailyBudgetAllowance)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">Budget / 30 hari</span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Sisa Pagu Harian</span>
              <p
                className={`text-base sm:text-lg font-bold mt-1 ${
                  dailyRemaining >= 0 ? 'text-[#50664B]' : 'text-[#C94D3F]'
                }`}
              >
                {formatRupiah(dailyRemaining)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">
                {dailyRemaining >= 0 ? 'Terkendali' : 'Melebihi jatah rata-rata'}
              </span>
            </div>
          </div>

          {/* Daily Category Breakdown */}
          {dailyCategoryTotals.length > 0 && (
            <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="font-serif-heading font-bold text-sm text-[#55443B]">
                Pengeluaran Hari Ini Per Kategori
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {dailyCategoryTotals.map((item) => (
                  <div
                    key={item.category?.id}
                    className="p-3 rounded-2xl border border-[#EFE8E1] bg-[#FFFDFB] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.category?.color || '#A7AB98'}25` }}
                      >
                        <CategoryIcon
                          name={item.category?.icon || 'MoreHorizontal'}
                          color={item.category?.color}
                          className="w-4 h-4"
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#55443B]">
                        {item.category?.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#55443B]">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Item List */}
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="font-serif-heading font-bold text-sm text-[#55443B]">
              Daftar Belanja pada {formatIndoDate(selectedDay, true)}
            </h4>
            {dailyTransactions.length === 0 ? (
              <p className="text-xs text-[#8C7A70] py-6 text-center">
                Tidak ada belanja yang dicatat pada tanggal ini.
              </p>
            ) : (
              <div className="space-y-2">
                {dailyTransactions.map((tr) => (
                  <div
                    key={tr.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#EFE8E1] bg-[#FFFDFB] text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-[#55443B]">{tr.itemName}</h5>
                      <p className="text-[11px] text-[#8C7A70]">
                        {categoriesMap.get(tr.categoryId)?.name || 'Lain-lain'} • {tr.storeName || tr.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#55443B]">
                        {formatRupiah(tr.totalAmount)}
                      </span>
                      <p className="text-[10px] text-[#8C7A70]">
                        {tr.quantity}x @{formatRupiah(tr.unitPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= B. LAPORAN MINGGUAN ================= */}
      {reportTab === 'weekly' && (
        <div className="space-y-4">
          {/* Week Info Banner */}
          <div className="bg-gradient-to-r from-[#FAF2EC] via-[#FDF7F3] to-[#FAF2EC] border border-[#EFE4DA] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#8C7A70]">
                Periode Pekan Berjalan (Senin – Minggu)
              </span>
              <h3 className="font-serif-heading font-extrabold text-lg sm:text-xl text-[#55443B] mt-0.5">
                {weekInfo.startLabel} – {weekInfo.endLabel}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#8C7A70] block">Total Belanja Minggu Ini</span>
              <span className="text-lg sm:text-xl font-extrabold text-[#C94D3F]">
                {formatRupiah(totalWeeklyExpense)}
              </span>
            </div>
          </div>

          {/* Bar Chart: Daily Expenses in the Week */}
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-serif-heading font-bold text-base text-[#55443B]">
                Grafik Belanja Harian (Senin – Minggu)
              </h4>
              <p className="text-xs text-[#78665D]">
                Pola pengeluaran harian selama sepekan
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekDaysChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE8E1" />
                  <XAxis dataKey="day" tick={{ fill: '#78665D', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#78665D', fontSize: 10 }}
                    tickFormatter={(v) => formatRupiahCompact(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val)), 'Total Belanja']}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.date ? formatIndoDate(item.date, true) : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#FFFDFB',
                      borderColor: '#EFE8E1',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(85,68,59,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#DDA29B" radius={[8, 8, 0, 0]}>
                    {weekDaysChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.total > 150000 ? '#DDA29B' : '#A7AB98'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Kategori Belanja Terbesar Pekan Ini</span>
              {weeklyTopCategory.category ? (
                <div className="flex items-center gap-3 mt-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${weeklyTopCategory.category.color}25` }}
                  >
                    <CategoryIcon
                      name={weeklyTopCategory.category.icon}
                      color={weeklyTopCategory.category.color}
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#55443B]">
                      {weeklyTopCategory.category.name}
                    </h5>
                    <p className="text-xs font-bold text-[#C94D3F]">
                      {formatRupiah(weeklyTopCategory.amount)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8C7A70] mt-2">Belum ada transaksi di pekan ini</p>
              )}
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Rata-rata Belanja Per Hari</span>
              <p className="text-lg font-bold text-[#55443B] mt-2">
                {formatRupiah(Math.round(totalWeeklyExpense / 7))}
              </p>
              <p className="text-xs text-[#8C7A70] mt-0.5">
                Dihitung dari total pengeluaran dibagi 7 hari
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= C. LAPORAN BULANAN ================= */}
      {reportTab === 'monthly' && (
        <div className="space-y-4">
          {/* Monthly KPI Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Pagu Budget Awal</span>
              <p className="text-base sm:text-lg font-bold text-[#55443B] mt-1">
                {formatRupiah(totalMonthlyBudget)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">Periode {formatYearMonth(selectedMonth)}</span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Total Pengeluaran</span>
              <p className="text-base sm:text-lg font-bold text-[#C94D3F] mt-1">
                {formatRupiah(totalMonthlyExpense)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">{percentMonthlyUsed}% terpakai</span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Alokasi Tabungan</span>
              <p className="text-base sm:text-lg font-bold text-[#8C7335] mt-1">
                {formatRupiah(savingsTarget)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">Target simpanan</span>
            </div>

            <div className="bg-white border border-[#EFE8E1] rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-[#8C7A70] block">Sisa Anggaran</span>
              <p
                className={`text-base sm:text-lg font-bold mt-1 ${
                  remainingMonthlyBudget >= 0 ? 'text-[#50664B]' : 'text-[#C94D3F]'
                }`}
              >
                {formatRupiah(remainingMonthlyBudget)}
              </p>
              <span className="text-[10px] text-[#8C7A70]">
                {remainingMonthlyBudget >= 0 ? 'Sisa surplus' : 'Defisit'}
              </span>
            </div>
          </div>

          {/* Cumulative Spending Trend Area Chart */}
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h4 className="font-serif-heading font-bold text-base text-[#55443B]">
                Tren Akumulasi Pengeluaran Harian
              </h4>
              <p className="text-xs text-[#78665D]">
                Grafik kenaikan pengeluaran sepanjang bulan {formatYearMonth(selectedMonth)}
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="kumulatifGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stop-color="#DDA29B" stop-opacity={0.5} />
                      <stop offset="95%" stop-color="#DDA29B" stop-opacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE8E1" />
                  <XAxis dataKey="day" tick={{ fill: '#78665D', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#78665D', fontSize: 10 }}
                    tickFormatter={(v) => formatRupiahCompact(v)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatRupiah(Number(val)),
                      name === 'kumulatif' ? 'Total Kumulatif' : 'Belanja Hari Ini',
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFDFB',
                      borderColor: '#EFE8E1',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(85,68,59,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kumulatif"
                    stroke="#DDA29B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#kumulatifGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking of Categories in the Month */}
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h4 className="font-serif-heading font-bold text-base text-[#55443B]">
              Total Belanja Per Kategori Bulan Ini
            </h4>

            <div className="space-y-2.5">
              {monthlyCategoryBreakdown.map((cat, idx) => {
                const pct = totalMonthlyExpense > 0 ? Math.round((cat.spent / totalMonthlyExpense) * 100) : 0;
                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl border border-[#EFE8E1] bg-[#FFFDFB] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-[#8C7A70]">
                        #{idx + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}25` }}
                      >
                        <CategoryIcon name={cat.icon} color={cat.color} className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-[#55443B]">{cat.name}</h5>
                        <p className="text-[10px] text-[#8C7A70]">{pct}% dari seluruh belanja</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#55443B]">
                        {formatRupiah(cat.spent)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
