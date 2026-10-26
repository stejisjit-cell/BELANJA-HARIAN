import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Camera,
  Coins,
  Package,
  Plus,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { Category, PaymentMethod, Transaction } from '../types/finance';
import {
  formatRupiah,
  getTodayDateString,
  parseRupiahInput,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategoryId?: string;
  onSave: (trData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<any>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onSave,
}) => {
  const [date, setDate] = useState<string>(getTodayDateString());
  const [itemName, setItemName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [storeName, setStoreName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(getTodayDateString());
      setItemName('');
      setCategoryId(initialCategoryId || (categories[0]?.id ?? ''));
      setUnitPriceInput('');
      setQuantity(1);
      setStoreName('');
      setPaymentMethod('Tunai');
      setNotes('');
      setReceiptImage(undefined);
      setErrorMsg(null);
    }
  }, [isOpen, initialCategoryId, categories]);

  if (!isOpen) return null;

  const unitPrice = parseRupiahInput(unitPriceInput);
  const totalAmount = unitPrice * (quantity || 1);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseRupiahInput(raw);
    setUnitPriceInput(num > 0 ? num.toLocaleString('id-ID') : '');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg('Ukuran foto terlalu besar (maksimal 2.5 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (keepOpen = false) => {
    setErrorMsg(null);

    if (!itemName.trim()) {
      setErrorMsg('Nama barang atau belanjaan wajib diisi ya Bunda.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Pilih kategori belanja terlebih dahulu.');
      return;
    }
    if (unitPrice <= 0) {
      setErrorMsg('Harga satuan belanja harus lebih dari Rp 0.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Jumlah barang minimal 1.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        date,
        itemName: itemName.trim(),
        categoryId,
        unitPrice,
        quantity,
        totalAmount,
        storeName: storeName.trim() || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptImage,
      });

      if (keepOpen) {
        // Reset item name and price for next entry while retaining date, store, payment
        setItemName('');
        setUnitPriceInput('');
        setQuantity(1);
        setNotes('');
        setReceiptImage(undefined);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F3D7D1] to-[#DDA29B] flex items-center justify-center text-white shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
                Catat Belanja Baru
              </h3>
              <p className="text-xs text-[#8C7A70]">
                Masukkan rincian kebutuhan belanja Bunda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C8C84] hover:text-[#55443B] hover:bg-[#FAF4ED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 py-3.5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FFF1F0] border border-[#F3C8C2] text-[#923429] text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Row 1: Tanggal & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Tanggal Belanja *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 font-medium text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Kategori Belanja *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 font-medium text-xs sm:text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Nama Barang */}
          <div>
            <label className="block text-xs font-semibold text-[#55443B] mb-1">
              Nama Barang / Kebutuhan *
            </label>
            <input
              type="text"
              placeholder="Contoh: Beras Ramos 5 kg, Ayam Kampung, Minyak Goreng"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] placeholder-[#B5A8A0] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 text-xs sm:text-sm"
            />
          </div>

          {/* Row 3: Harga Satuan, Jumlah, dan Total Otomatis */}
          <div className="bg-[#FAF5F0] p-3.5 rounded-2xl border border-[#EFE5DB] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Harga Satuan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8C7A70] font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={unitPriceInput}
                    onChange={handlePriceChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Jumlah Barang
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-9 rounded-l-xl bg-white border border-[#E2D6CB] text-[#55443B] font-bold hover:bg-[#FAF4ED] transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full py-2 text-center border-t border-b border-[#E2D6CB] bg-white text-[#55443B] font-bold text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-9 rounded-r-xl bg-white border border-[#E2D6CB] text-[#55443B] font-bold hover:bg-[#FAF4ED] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Kalkulasi Otomatis */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EAE0D6]">
              <span className="text-xs text-[#78665D]">
                Total Belanja (Harga × Jumlah):
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#8F483D]">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          {/* Row 4: Toko / Pasar & Metode Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Toko / Pasar / Tempat Belanja
              </label>
              <input
                type="text"
                placeholder="Pasar Pagi, Supermarket, dll."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] placeholder-[#B5A8A0] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#55443B] mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 text-xs sm:text-sm"
              >
                <option value="Tunai">Tunai (Cash)</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Kartu Debit">Kartu Debit</option>
                <option value="E-Wallet (QRIS/GoPay/OVO/ShopeePay)">E-Wallet / QRIS</option>
              </select>
            </div>
          </div>

          {/* Row 5: Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-[#55443B] mb-1">
              Catatan Belanja (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Stok untuk 2 minggu, diskon toko 10%"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] placeholder-[#B5A8A0] focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50 text-xs sm:text-sm"
            />
          </div>

          {/* Row 6: Foto Struk / Nota Belanja */}
          <div>
            <label className="block text-xs font-semibold text-[#55443B] mb-1">
              Foto Struk / Nota (Opsional)
            </label>
            {receiptImage ? (
              <div className="relative inline-block border border-[#E2D6CB] rounded-2xl overflow-hidden shadow-xs">
                <img
                  src={receiptImage}
                  alt="Preview Nota"
                  className="w-28 h-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Hapus foto struk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-[#CFC0B4] bg-[#FAF5F0] hover:bg-[#F5ECE3] cursor-pointer text-xs text-[#78665D] transition-colors">
                <Camera className="w-4 h-4 text-[#8F483D]" />
                <span>Ambil Foto atau Pilih Gambar Struk</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#EFE8E1] flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2D6CB] text-[#78665D] hover:bg-[#FAF4ED] text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FAF0E8] hover:bg-[#F5E6D8] border border-[#E8DACB] text-[#8F483D] text-xs font-bold transition-colors disabled:opacity-50"
          >
            Simpan & Tambah Lagi
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
          >
            Simpan Belanja
          </button>
        </div>
      </div>
    </div>
  );
};
