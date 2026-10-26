/**
 * BundaBudget — Keuangan Rumah Tangga
 * Main Application Component
 */

import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { CategoryDetailModal } from './components/CategoryDetailModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { Header } from './components/Header';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AddExpenseModal } from './components/AddExpenseModal';
import { SidebarNav } from './components/SidebarNav';
import { useFinanceData } from './hooks/useFinanceData';
import { ActiveTab, Category, Transaction } from './types/finance';
import { BudgetView } from './views/BudgetView';
import { DashboardView } from './views/DashboardView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SavingsView } from './views/SavingsView';
import { SettingsView } from './views/SettingsView';
import { ShoppingListView } from './views/ShoppingListView';

export default function App() {
  const {
    selectedMonth,
    setSelectedMonth,
    transactions,
    monthlyTransactions,
    categories,
    categoriesMap,
    currentBudget,
    savingsGoals,
    shoppingList,
    isLoading,
    toastMessage,
    // Metrics
    totalMonthlyExpense,
    monthlyBudgetAmount,
    savingsTarget,
    remainingBudget,
    todayExpense,
    thisWeekExpense,
    categoryBreakdown,
    // Actions
    handleSaveTransaction,
    handleDeleteTransaction,
    handleSaveBudget,
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveSavingsGoal,
    handleDeleteSavingsGoal,
    handleSaveShoppingItem,
    handleDeleteShoppingItem,
    handleConvertShoppingItemToExpense,
    handleResetData,
    handleRestoreDemo,
    handleImportJSON,
    exportAllData,
  } = useFinanceData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [addExpenseInitialCat, setAddExpenseInitialCat] = useState<string | undefined>(undefined);
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState<Transaction | null>(null);
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<Category | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const openAddExpense = (catId?: string) => {
    setAddExpenseInitialCat(catId);
    setIsAddExpenseOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#55443B] flex flex-col font-sans selection:bg-[#F3D7D1] selection:text-[#55443B]">
      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Reactive Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#55443B] text-[#FFF9F5] px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border border-[#EFE8E1] animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <Header
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenAddExpense={() => openAddExpense()}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Application Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-10 h-10 border-4 border-[#DDA29B] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-[#78665D]">
                Membuka pembukuan BundaBudget...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  monthlyBudget={monthlyBudgetAmount}
                  totalMonthlyExpense={totalMonthlyExpense}
                  savingsTarget={savingsTarget}
                  remainingBudget={remainingBudget}
                  todayExpense={todayExpense}
                  thisWeekExpense={thisWeekExpense}
                  budgetConfig={currentBudget}
                  categories={categories}
                  monthlyTransactions={monthlyTransactions}
                  categoryBreakdown={categoryBreakdown}
                  categoriesMap={categoriesMap}
                  onSelectTab={setActiveTab}
                  onOpenAddExpense={() => openAddExpense()}
                  onSelectCategory={(cat) => setSelectedCategoryForDetail(cat)}
                  onSelectTransaction={(tr) => setSelectedTransactionForEdit(tr)}
                  onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  transactions={transactions}
                  categories={categories}
                  categoriesMap={categoriesMap}
                  selectedMonth={selectedMonth}
                  onOpenAddExpense={() => openAddExpense()}
                  onSelectTransaction={(tr) => setSelectedTransactionForEdit(tr)}
                />
              )}

              {activeTab === 'budget' && (
                <BudgetView
                  selectedMonth={selectedMonth}
                  budgetConfig={currentBudget}
                  categories={categories}
                  onSaveBudget={handleSaveBudget}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  selectedMonth={selectedMonth}
                  transactions={transactions}
                  categories={categories}
                  categoriesMap={categoriesMap}
                  budgetConfig={currentBudget}
                />
              )}

              {activeTab === 'savings' && (
                <SavingsView
                  savingsGoals={savingsGoals}
                  onSaveGoal={handleSaveSavingsGoal}
                  onDeleteGoal={handleDeleteSavingsGoal}
                />
              )}

              {activeTab === 'shopping' && (
                <ShoppingListView
                  shoppingList={shoppingList}
                  categories={categories}
                  categoriesMap={categoriesMap}
                  onSaveShoppingItem={handleSaveShoppingItem}
                  onDeleteShoppingItem={handleDeleteShoppingItem}
                  onConvertItemToExpense={handleConvertShoppingItemToExpense}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  transactions={transactions}
                  categoriesMap={categoriesMap}
                  onResetData={handleResetData}
                  onRestoreDemo={handleRestoreDemo}
                  onImportJSON={handleImportJSON}
                  onExportAllData={exportAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddExpense={() => openAddExpense()}
      />

      {/* Global Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        initialCategoryId={addExpenseInitialCat}
        onSave={handleSaveTransaction}
      />

      <EditExpenseModal
        transaction={selectedTransactionForEdit}
        isOpen={Boolean(selectedTransactionForEdit)}
        onClose={() => setSelectedTransactionForEdit(null)}
        categories={categories}
        onUpdate={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />

      <CategoryDetailModal
        category={selectedCategoryForDetail}
        isOpen={Boolean(selectedCategoryForDetail)}
        onClose={() => setSelectedCategoryForDetail(null)}
        monthlyTransactions={monthlyTransactions}
        allocatedBudget={
          selectedCategoryForDetail
            ? (currentBudget?.categoryAllocations?.[selectedCategoryForDetail.id] ??
              selectedCategoryForDetail.allocatedBudget ??
              0)
            : 0
        }
        onAddInThisCategory={(catId) => openAddExpense(catId)}
        onSelectTransaction={(tr) => setSelectedTransactionForEdit(tr)}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
