import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { BudgetAllocationCard } from '../components/BudgetAllocationCard';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { FinancialSummaryCards } from '../components/FinancialSummaryCards';
import { PWAInstallBanner } from '../components/PWAInstallBanner';
import { RecentTransactionsCard } from '../components/RecentTransactionsCard';
import { DAILY_TIPS } from '../db/sampleData';
import { ActiveTab, Category, MonthlyBudgetConfig, Transaction } from '../types/finance';

interface DashboardViewProps {
  monthlyBudget: number;
  totalMonthlyExpense: number;
  savingsTarget: number;
  remainingBudget: number;
  todayExpense: number;
  thisWeekExpense: number;
  budgetConfig: MonthlyBudgetConfig | null;
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
  categoriesMap: Map<string, Category>;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onSelectCategory: (cat: Category) => void;
  onSelectTransaction: (tr: Transaction) => void;
  onOpenManageCategories: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  monthlyBudget,
  totalMonthlyExpense,
  savingsTarget,
  remainingBudget,
  todayExpense,
  thisWeekExpense,
  budgetConfig,
  categories,
  monthlyTransactions,
  categoryBreakdown,
  categoriesMap,
  onSelectTab,
  onOpenAddExpense,
  onSelectCategory,
  onSelectTransaction,
  onOpenManageCategories,
}) => {
  // Random or daily tip
  const [tipIndex, setTipIndex] = useState(0);
  const activeTip = DAILY_TIPS[tipIndex % DAILY_TIPS.length];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner: PWA Install prompt if eligible */}
      <PWAInstallBanner variant="banner" />

      {/* Financial Summary 6 Cards */}
      <FinancialSummaryCards
        monthlyBudget={monthlyBudget}
        totalExpense={totalMonthlyExpense}
        savingsTarget={savingsTarget}
        remainingBudget={remainingBudget}
        todayExpense={todayExpense}
        thisWeekExpense={thisWeekExpense}
      />

      {/* Mother's Budgeting Tip Card */}
      <div className="bg-[#FAF4ED] border border-[#EBE1D7] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#EFD7A8] flex items-center justify-center text-[#8C7335] shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EADCCB] text-[#55443B]">
                {activeTip.tag}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#55443B] truncate">
                {activeTip.title}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-[#78665D] mt-0.5 line-clamp-1">
              {activeTip.tip}
            </p>
          </div>
        </div>

        <button
          onClick={() => setTipIndex((prev) => prev + 1)}
          className="text-xs font-semibold text-[#8F483D] hover:underline shrink-0 pl-2"
        >
          Tip Lain →
        </button>
      </div>

      {/* Two Column Layout on Desktop (Matching Reference Image Inspiration) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Left Column: Donut Allocation + Recent Transactions */}
        <div className="space-y-5 sm:space-y-6">
          <BudgetAllocationCard
            budgetConfig={budgetConfig}
            categories={categories}
            monthlyTransactions={monthlyTransactions}
            onOpenBudgetSettings={() => onSelectTab('budget')}
          />

          <RecentTransactionsCard
            transactions={monthlyTransactions}
            categoriesMap={categoriesMap}
            onViewAll={() => onSelectTab('expenses')}
            onOpenAddExpense={onOpenAddExpense}
            onSelectTransaction={onSelectTransaction}
          />
        </div>

        {/* Right Column: Detailed Category Breakdown Table */}
        <div className="space-y-5 sm:space-y-6">
          <CategoryBreakdownCard
            categories={categories}
            monthlyTransactions={monthlyTransactions}
            categoryBreakdown={categoryBreakdown}
            onSelectCategory={onSelectCategory}
            onOpenManageCategories={onOpenManageCategories}
          />
        </div>
      </div>
    </div>
  );
};
