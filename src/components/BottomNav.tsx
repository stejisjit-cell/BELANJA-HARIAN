import React from 'react';
import {
  BarChart3,
  CheckSquare,
  Home,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '../types/finance';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-t border-[#EFE8E1] px-2 py-1.5 md:hidden shadow-lg pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* Beranda */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#55443B] font-bold scale-105'
              : 'text-[#9C8C84] hover:text-[#55443B]'
          }`}
        >
          <Home
            className={`w-5 h-5 transition-transform ${
              activeTab === 'dashboard' ? 'text-[#8F483D] stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        {/* Riwayat Belanja */}
        <button
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeTab === 'expenses'
              ? 'text-[#55443B] font-bold scale-105'
              : 'text-[#9C8C84] hover:text-[#55443B]'
          }`}
        >
          <Receipt
            className={`w-5 h-5 transition-transform ${
              activeTab === 'expenses' ? 'text-[#8F483D] stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-0.5">Riwayat</span>
        </button>

        {/* Center Floating Plus (+) Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#DDA29B] via-[#E2AFA9] to-[#EFD7A8] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform border-4 border-[#FFF9F5]"
            title="Tambah Belanja Baru"
          >
            <Plus className="w-6 h-6 stroke-[3] text-white" />
          </button>
        </div>

        {/* Laporan */}
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeTab === 'reports'
              ? 'text-[#55443B] font-bold scale-105'
              : 'text-[#9C8C84] hover:text-[#55443B]'
          }`}
        >
          <BarChart3
            className={`w-5 h-5 transition-transform ${
              activeTab === 'reports' ? 'text-[#8F483D] stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-0.5">Laporan</span>
        </button>

        {/* Tabungan */}
        <button
          onClick={() => onSelectTab('savings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all ${
            activeTab === 'savings'
              ? 'text-[#55443B] font-bold scale-105'
              : 'text-[#9C8C84] hover:text-[#55443B]'
          }`}
        >
          <PiggyBank
            className={`w-5 h-5 transition-transform ${
              activeTab === 'savings' ? 'text-[#8F483D] stroke-[2.5]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[10px] mt-0.5">Tabungan</span>
        </button>
      </div>
    </nav>
  );
};
