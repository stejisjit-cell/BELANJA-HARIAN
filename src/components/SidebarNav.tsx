import React from 'react';
import {
  BarChart3,
  CheckSquare,
  DollarSign,
  Heart,
  Home,
  PiggyBank,
  Receipt,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../types/finance';

interface SidebarNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Beranda Budget', icon: Home, desc: 'Ringkasan & alokasi' },
    { id: 'expenses' as ActiveTab, label: 'Riwayat Belanja', icon: Receipt, desc: 'Daftar transaksi' },
    { id: 'budget' as ActiveTab, label: 'Atur Budget', icon: SlidersHorizontal, desc: 'Batas per kategori' },
    { id: 'reports' as ActiveTab, label: 'Laporan Keuangan', icon: BarChart3, desc: 'Harian, pekan, bulan' },
    { id: 'savings' as ActiveTab, label: 'Tabungan & Impian', icon: PiggyBank, desc: 'Target dana darurat' },
    { id: 'shopping' as ActiveTab, label: 'Checklist Pasar', icon: CheckSquare, desc: 'Daftar belanja pintar' },
    { id: 'settings' as ActiveTab, label: 'Pengaturan & Backup', icon: Settings, desc: 'Cadangkan data lokal' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#FFFDFB] border-r border-[#EFE8E1] p-4 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-[#FAF0E9] text-[#55443B] font-bold shadow-xs border border-[#E8DACB]'
                  : 'text-[#78665D] hover:bg-[#FAF6F2] hover:text-[#55443B]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-[#F3D7D1] text-[#8F483D]'
                    : 'bg-[#FAF4ED] text-[#9C8C84]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#9C8C84] truncate">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Decorative Mother's Quote Card at bottom */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF5F0] to-[#F5ECE4] border border-[#EFE4D9] text-[#6A5A52] text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-[#8F483D]">
            <Heart className="w-3.5 h-3.5 fill-[#DDA29B] text-[#DDA29B]" />
            <span>Pesan Kasih Bunda</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#78665D]">
            “Uang belanja secukupnya, syukur seluas-luasnya. Setiap rupiah yang Bunda kelola adalah berkah bagi rumah tangga.”
          </p>
        </div>
      </div>
    </aside>
  );
};
