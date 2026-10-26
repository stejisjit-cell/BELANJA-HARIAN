import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Flame,
  Lightbulb,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { Category, ShoppingItem } from '../types/finance';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

interface ShoppingListViewProps {
  shoppingList: ShoppingItem[];
  categories: Category[];
  categoriesMap: Map<string, Category>;
  onSaveShoppingItem: (item: ShoppingItem) => Promise<any>;
  onDeleteShoppingItem: (id: string) => Promise<any>;
  onConvertItemToExpense: (item: ShoppingItem) => Promise<any>;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  categories,
  categoriesMap,
  onSaveShoppingItem,
  onDeleteShoppingItem,
  onConvertItemToExpense,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newPriceInput, setNewPriceInput] = useState('25000');
  const [newCategoryId, setNewCategoryId] = useState('cat-kitchen');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newNotes, setNewNotes] = useState('');

  const purchasedCount = shoppingList.filter((s) => s.isPurchased).length;
  const unpurchasedItems = shoppingList.filter((s) => !s.isPurchased);
  const purchasedItems = shoppingList.filter((s) => s.isPurchased);

  const totalEstimated = shoppingList.reduce(
    (acc, s) => acc + s.estimatedPrice * (s.quantity || 1),
    0
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: newItemName.trim(),
      estimatedPrice: parseRupiahInput(newPriceInput),
      quantity: newQuantity || 1,
      categoryId: newCategoryId || categories[0]?.id || 'cat-kitchen',
      isPurchased: false,
      notes: newNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    await onSaveShoppingItem(item);
    setNewItemName('');
    setNewNotes('');
    setNewPriceInput('25000');
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    await onSaveShoppingItem({
      ...item,
      isPurchased: !item.isPurchased,
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FAF2EC] via-[#FDF7F3] to-[#FAF2EC] border border-[#EFE4DA] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#8F483D] border border-[#EADBCE]">
            Daftar Belanja Pasar Pintar
          </span>
          <h2 className="font-serif-heading font-extrabold text-xl sm:text-2xl text-[#55443B] mt-2">
            Checklist Belanja Sebelum ke Pasar
          </h2>
          <p className="text-xs text-[#78665D] mt-0.5">
            Beli hanya yang dicatat di daftar agar terhindar dari belanja berlebih dan mubazir!
          </p>
        </div>

        <div className="text-left sm:text-right bg-white p-3.5 rounded-2xl border border-[#EFE8E1] shadow-2xs">
          <span className="text-[11px] text-[#8C7A70] block">Estimasi Anggaran Dibawa:</span>
          <span className="text-base sm:text-lg font-bold text-[#55443B]">
            {formatRupiah(totalEstimated)}
          </span>
          <span className="text-[10px] text-[#78665D] block mt-0.5">
            {purchasedCount} dari {shoppingList.length} barang terbeli
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-white border border-[#EFE8E1] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <h4 className="font-serif-heading font-bold text-sm text-[#55443B]">
          + Tambah Barang ke Checklist Belanja
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Nama barang (misal: Tempe 2 papan, Telur 1 kg)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs sm:text-sm text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              aria-label="Kategori Barang Belanja"
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs sm:text-sm text-[#55443B]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-xs text-[#8C7A70]">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Perkiraan"
                value={newPriceInput}
                onChange={(e) => {
                  const num = parseRupiahInput(e.target.value);
                  setNewPriceInput(num > 0 ? num.toLocaleString('id-ID') : '');
                }}
                className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border border-[#E2D6CB] bg-[#FFFDFB] text-xs sm:text-sm font-bold text-[#55443B]"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </form>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {/* Unpurchased List */}
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-heading font-bold text-sm sm:text-base text-[#55443B]">
              Belum Dibeli ({unpurchasedItems.length})
            </h4>
            <span className="text-[11px] text-[#8C7A70]">
              Centang item saat Bunda belanja di pasar
            </span>
          </div>

          {unpurchasedItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8C7A70] bg-[#FAF8F5] rounded-2xl">
              Semua barang sudah dibeli! Hebat sekali Bunda 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {unpurchasedItems.map((item) => {
                const cat = categoriesMap.get(item.categoryId);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-[#EFE8E1] hover:border-[#DDCFC3] bg-[#FFFDFB] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleTogglePurchased(item)}
                        className="w-6 h-6 rounded-lg border-2 border-[#D4C3B5] hover:border-[#8F483D] flex items-center justify-center shrink-0 transition-colors"
                        title="Tandai sudah dibeli"
                      >
                        {item.isPurchased && <Check className="w-4 h-4 text-[#8F483D]" />}
                      </button>

                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#55443B] block truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-[#8C7A70]">
                          <span>{cat?.name || 'Kebutuhan Dapur'}</span>
                          <span>•</span>
                          <span>Est: {formatRupiah(item.estimatedPrice * (item.quantity || 1))}</span>
                          {item.notes && <span>• {item.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onDeleteShoppingItem(item.id)}
                        className="p-1.5 text-[#B5A599] hover:text-[#C94D3F] rounded-lg"
                        title="Hapus item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchased List (With Conversion to Actual Expense) */}
        {purchasedItems.length > 0 && (
          <div className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-heading font-bold text-sm sm:text-base text-[#5A634E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sudah Dibeli ({purchasedItems.length})</span>
              </h4>
              <span className="text-[11px] text-[#8C7A70]">
                Klik “Pindahkan ke Belanja” untuk otomatis dicatat di pengeluaran
              </span>
            </div>

            <div className="space-y-2">
              {purchasedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-[#EDF0E9] bg-[#FAFBF9] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      className="w-6 h-6 rounded-lg bg-[#A7AB98] text-white flex items-center justify-center shrink-0"
                      title="Batalkan tanda sudah dibeli"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <div className="min-w-0">
                      <span className="font-semibold text-[#78665D] line-through block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#9C8C84]">
                        {formatRupiah(item.estimatedPrice * (item.quantity || 1))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onConvertItemToExpense(item)}
                      className="px-3 py-1.5 bg-[#FAF0E9] hover:bg-[#F5E6D8] border border-[#E8DACB] text-[#8F483D] font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                      title="Pindahkan ke transaksi pengeluaran aktual"
                    >
                      <span>Pindahkan ke Belanja</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteShoppingItem(item.id)}
                      className="p-1.5 text-[#B5A599] hover:text-[#C94D3F] rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
