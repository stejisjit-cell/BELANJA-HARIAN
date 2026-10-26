import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Category, MonthlyBudgetConfig, Transaction } from '../types/finance';
import { formatPercent, formatRupiah, formatRupiahCompact } from '../utils/formatters';

interface BudgetAllocationCardProps {
  budgetConfig: MonthlyBudgetConfig | null;
  categories: Category[];
  monthlyTransactions: Transaction[];
  onOpenBudgetSettings: () => void;
}

export const BudgetAllocationCard: React.FC<BudgetAllocationCardProps> = ({
  budgetConfig,
  categories,
  monthlyTransactions,
  onOpenBudgetSettings,
}) => {
  const [viewMode, setViewMode] = useState<'allocation' | 'actual'>('allocation');

  const totalBudget = budgetConfig?.totalBudget ?? 5000000;
  const savingsTarget = budgetConfig?.savingsTarget ?? 1000000;

  // Group categories into 4 macro pillars:
  // 1. Kebutuhan Rumah Tangga (kitchen, bills, household, food, health, transport, kids)
  // 2. Tabungan & Investasi Masa Depan (savingsTarget or recorded savings)
  // 3. Pengembangan Diri & Perawatan (personal, education)
  // 4. Hiburan & Gaya Hidup (entertainment, social, other)

  const householdCatIds = new Set(['cat-kitchen', 'cat-food', 'cat-household', 'cat-bills', 'cat-transport', 'cat-kids', 'cat-health']);
  const personalCatIds = new Set(['cat-personal', 'cat-education']);
  const entertainmentCatIds = new Set(['cat-entertainment', 'cat-social', 'cat-other']);

  // Planned Macro Allocation
  let plannedHousehold = 0;
  let plannedPersonal = 0;
  let plannedEntertainment = 0;

  categories.forEach((c) => {
    const allocated = budgetConfig?.categoryAllocations?.[c.id] ?? c.allocatedBudget ?? 0;
    if (householdCatIds.has(c.id)) {
      plannedHousehold += allocated;
    } else if (personalCatIds.has(c.id)) {
      plannedPersonal += allocated;
    } else {
      plannedEntertainment += allocated;
    }
  });

  const plannedTotalAll = plannedHousehold + savingsTarget + plannedPersonal + plannedEntertainment || 1;

  // Actual Spending
  let actualHousehold = 0;
  let actualPersonal = 0;
  let actualEntertainment = 0;

  monthlyTransactions.forEach((t) => {
    if (householdCatIds.has(t.categoryId)) {
      actualHousehold += t.totalAmount;
    } else if (personalCatIds.has(t.categoryId)) {
      actualPersonal += t.totalAmount;
    } else {
      actualEntertainment += t.totalAmount;
    }
  });

  const actualTotalSpending = actualHousehold + actualPersonal + actualEntertainment;

  // Data for Allocation Mode
  const allocationData = [
    {
      name: 'Kebutuhan Rumah Tangga',
      value: plannedHousehold,
      color: '#A7AB98', // Sage green
      recommended: '50%',
      actual: actualHousehold,
    },
    {
      name: 'Alokasi Tabungan',
      value: savingsTarget,
      color: '#EFD7A8', // Pastel yellow
      recommended: '20%',
      actual: 0, // note: savings is not recorded as shopping expense
    },
    {
      name: 'Pengembangan & Perawatan Diri',
      value: plannedPersonal,
      color: '#F3D7D1', // Peach
      recommended: '20%',
      actual: actualPersonal,
    },
    {
      name: 'Hiburan & Sosial',
      value: plannedEntertainment,
      color: '#DDA29B', // Soft pink
      recommended: '10%',
      actual: actualEntertainment,
    },
  ];

  // Data for Actual Mode
  const actualData = [
    {
      name: 'Kebutuhan Rumah Tangga',
      value: actualHousehold || 1,
      color: '#A7AB98',
      budget: plannedHousehold,
    },
    {
      name: 'Pengembangan & Perawatan Diri',
      value: actualPersonal || 1,
      color: '#F3D7D1',
      budget: plannedPersonal,
    },
    {
      name: 'Hiburan & Sosial',
      value: actualEntertainment || 1,
      color: '#DDA29B',
      budget: plannedEntertainment,
    },
  ];

  const currentData = viewMode === 'allocation' ? allocationData : actualData;
  const currentTotal = viewMode === 'allocation' ? plannedTotalAll : (actualTotalSpending || 1);

  return (
    <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif-heading font-bold text-lg text-[#55443B]">
              Alokasi & Proporsi Budget
            </h3>
            <p className="text-xs text-[#78665D]">
              {viewMode === 'allocation'
                ? 'Rencana porsi 50/20/20/10 yang direkomendasikan'
                : 'Realisasi uang belanja aktual yang sudah terpakai'}
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-[#FAF4ED] rounded-xl border border-[#EBE1D7] self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setViewMode('allocation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'allocation'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#8C7A70] hover:text-[#55443B]'
              }`}
            >
              Rencana Porsi
            </button>
            <button
              onClick={() => setViewMode('actual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'actual'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#8C7A70] hover:text-[#55443B]'
              }`}
            >
              Realisasi Aktual
            </button>
          </div>
        </div>

        {/* Donut Chart Container */}
        <div className="relative w-full h-56 sm:h-64 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatRupiah(Number(value)),
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#FFFDFB',
                  borderColor: '#EFE8E1',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(85,68,59,0.08)',
                  fontSize: '12px',
                  color: '#55443B',
                }}
              />
              <Pie
                data={currentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                stroke="#FFF9F5"
                strokeWidth={3}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-medium text-[#8C7A70]">
              {viewMode === 'allocation' ? 'Total Pagu' : 'Total Terpakai'}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#55443B] tracking-tight">
              {formatRupiahCompact(
                viewMode === 'allocation' ? totalBudget : actualTotalSpending
              )}
            </span>
          </div>
        </div>

        {/* Pillar Legend List */}
        <div className="space-y-2.5 mt-3">
          {allocationData.map((item) => {
            const pct = Math.round((item.value / plannedTotalAll) * 100);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-[#FAF6F2] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="font-semibold text-[#55443B] block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-[#8C7A70]">
                      Saran: {item.recommended} • Terencana: {pct}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#55443B] block">
                    {formatRupiah(item.value)}
                  </span>
                  {viewMode === 'allocation' && item.actual > 0 && (
                    <span className="text-[10px] text-[#C94D3F]">
                      Aktual: {formatRupiah(item.actual)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#EFE8E1] flex items-center justify-between">
        <span className="text-[11px] text-[#8C7A70]">
          💡 Tabungan tidak dicatat sebagai belanja habis pakai.
        </span>
        <button
          onClick={onOpenBudgetSettings}
          className="text-xs font-semibold text-[#8F483D] hover:underline"
        >
          Ubah Alokasi →
        </button>
      </div>
    </div>
  );
};
