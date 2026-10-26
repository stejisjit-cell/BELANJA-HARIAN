import React, { useState } from 'react';
import { Palette, Plus, Trash2, X } from 'lucide-react';
import { Category } from '../types/finance';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (cat: Category) => Promise<any>;
  onDeleteCategory: (id: string) => Promise<any>;
}

const AVAILABLE_ICONS = [
  'UtensilsCrossed',
  'Coffee',
  'Home',
  'Zap',
  'Car',
  'Baby',
  'HeartPulse',
  'Sparkles',
  'Smile',
  'Heart',
  'GraduationCap',
  'Shirt',
  'Smartphone',
  'ShoppingBag',
  'Wallet',
  'MoreHorizontal',
];

const PRESET_COLORS = [
  '#DDA29B', // Soft pink
  '#EFD7A8', // Pastel yellow
  '#A7AB98', // Sage green
  '#F3D7D1', // Peach
  '#BA7A71', // Deep peach
  '#8CA595', // Forest sage
  '#C6B2A3', // Warm taupe
  '#DFC795', // Warm gold
  '#9FA8A3', // Muted sage
  '#89A0B5', // Soft dusty blue
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('UtensilsCrossed');
  const [color, setColor] = useState('#DDA29B');
  const [budgetInput, setBudgetInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingCategory({});
    setName('');
    setIcon('ShoppingBag');
    setColor('#DDA29B');
    setBudgetInput('300000');
    setErrorMsg(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudgetInput(cat.allocatedBudget.toLocaleString('id-ID'));
    setErrorMsg(null);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }
    const allocatedBudget = parseRupiahInput(budgetInput);

    const newCat: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      allocatedBudget,
      isDefault: editingCategory?.isDefault,
    };

    await onSaveCategory(newCat);
    setEditingCategory(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div>
            <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
              Kelola Kategori Belanja
            </h3>
            <p className="text-xs text-[#8C7A70]">
              Tambah, sesuaikan ikon, warna, atau hapus kategori
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C8C84] hover:text-[#55443B] hover:bg-[#FAF4ED]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form if Editing / Adding */}
        {editingCategory ? (
          <div className="my-3.5 p-4 bg-[#FAF5F0] rounded-2xl border border-[#EFE4D9] space-y-3.5">
            <h4 className="font-bold text-xs sm:text-sm text-[#55443B]">
              {editingCategory.id ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
            </h4>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">⚠️ {errorMsg}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Nama Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Belanja Pasar, Skincare, Token Listrik"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Alokasi Pagu Awal (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={budgetInput}
                onChange={(e) => {
                  const num = parseRupiahInput(e.target.value);
                  setBudgetInput(num > 0 ? num.toLocaleString('id-ID') : '');
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-xs sm:text-sm text-[#55443B] font-bold"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1.5">
                Pilih Ikon
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-[#E2D6CB]">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-lg transition-all ${
                      icon === ic
                        ? 'bg-[#F3D7D1] text-[#8F483D] ring-2 ring-[#DDA29B]'
                        : 'text-[#8C7A70] hover:bg-[#FAF4ED]'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1.5">
                Warna Label
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full shadow-xs transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-[#55443B]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-3.5 py-1.5 text-xs text-[#78665D] hover:bg-white rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Kategori
              </button>
            </div>
          </div>
        ) : (
          <div className="my-3">
            <button
              onClick={handleStartAdd}
              className="w-full py-2.5 px-4 bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-dashed border-[#DECEBE] rounded-2xl text-xs font-bold text-[#8F483D] flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>
        )}

        {/* Category List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-[#EFE8E1] bg-white hover:bg-[#FAF6F2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${c.color}25` }}
                >
                  <CategoryIcon name={c.icon} color={c.color} className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs sm:text-sm text-[#55443B]">{c.name}</h5>
                  <p className="text-[10px] text-[#8C7A70]">
                    Pagu: {formatRupiah(c.allocatedBudget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStartEdit(c)}
                  className="px-2.5 py-1 text-xs text-[#78665D] hover:text-[#55443B] hover:bg-[#FAF4ED] rounded-lg"
                >
                  Ubah
                </button>
                {categories.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kategori "${c.name}"?`)) {
                        onDeleteCategory(c.id);
                      }
                    }}
                    className="p-1.5 text-[#C94D3F] hover:bg-red-50 rounded-lg"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#EFE8E1] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#55443B] text-white text-xs font-semibold"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
