import React, { useEffect, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import { Category, PaymentMethod, Transaction } from '../types/finance';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

interface EditExpenseModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: (trData: Transaction) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  transaction,
  isOpen,
  onClose,
  categories,
  onUpdate,
  onDelete,
}) => {
  const [date, setDate] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unitPriceInput, setUnitPriceInput] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [storeName, setStoreName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (transaction && isOpen) {
      setDate(transaction.date);
      setItemName(transaction.itemName);
      setCategoryId(transaction.categoryId);
      setUnitPriceInput(transaction.unitPrice.toLocaleString('id-ID'));
      setQuantity(transaction.quantity || 1);
      setStoreName(transaction.storeName || '');
      setPaymentMethod(transaction.paymentMethod || 'Tunai');
      setNotes(transaction.notes || '');
      setReceiptImage(transaction.receiptImage);
      setIsConfirmingDelete(false);
      setErrorMsg(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

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

  const handleSave = async () => {
    setErrorMsg(null);
    if (!itemName.trim()) {
      setErrorMsg('Nama barang tidak boleh kosong.');
      return;
    }
    if (unitPrice <= 0) {
      setErrorMsg('Harga satuan harus lebih dari Rp 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate({
        ...transaction,
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
      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal memperbarui transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(transaction.id);
      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message || 'Gagal menghapus transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFDFB] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#EFE4DA] my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE8E1]">
          <div>
            <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#55443B]">
              Ubah Data Belanja
            </h3>
            <p className="text-xs text-[#8C7A70]">
              Edit atau hapus rincian transaksi belanja
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9C8C84] hover:text-[#55443B] hover:bg-[#FAF4ED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto pr-1 py-3.5 space-y-3.5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FFF1F0] border border-[#F3C8C2] text-[#923429] text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {isConfirmingDelete ? (
            <div className="p-4 rounded-2xl bg-[#FFF5F4] border border-[#F5C4BF] space-y-3 text-center">
              <p className="font-bold text-sm text-[#923429]">
                Apakah Bunda yakin ingin menghapus catatan belanja ini?
              </p>
              <p className="text-xs text-[#78665D]">
                Item “<strong>{transaction.itemName}</strong>” senilai{' '}
                <strong>{formatRupiah(transaction.totalAmount)}</strong> akan dihapus permanen dari riwayat dan laporan.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-[#55443B] bg-white hover:bg-[#FAF4ED] text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-[#C94D3F] hover:bg-[#B33E31] text-white text-xs font-bold shadow-xs"
                >
                  Ya, Hapus Sekarang
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Row 1: Tanggal & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55443B] mb-1">
                    Tanggal Belanja
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] font-medium text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55443B] mb-1">
                    Kategori
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] font-medium text-xs sm:text-sm"
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
                  Nama Barang / Kebutuhan
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] text-xs sm:text-sm"
                />
              </div>

              {/* Row 3: Harga Satuan, Jumlah, Total */}
              <div className="bg-[#FAF5F0] p-3.5 rounded-2xl border border-[#EFE5DB] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#55443B] mb-1">
                      Harga Satuan (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-[#8C7A70] font-bold">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={unitPriceInput}
                        onChange={handlePriceChange}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] font-bold text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#55443B] mb-1">
                      Jumlah
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-9 rounded-l-xl bg-white border border-[#E2D6CB] text-[#55443B] font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full py-2 text-center border-t border-b border-[#E2D6CB] bg-white text-[#55443B] font-bold text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-9 rounded-r-xl bg-white border border-[#E2D6CB] text-[#55443B] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EAE0D6]">
                  <span className="text-xs text-[#78665D]">Total Belanja:</span>
                  <span className="text-sm sm:text-base font-extrabold text-[#8F483D]">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Row 4: Toko & Metode Pembayaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55443B] mb-1">
                    Toko / Pasar
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55443B] mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] text-xs sm:text-sm"
                  >
                    <option value="Tunai">Tunai (Cash)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="Kartu Debit">Kartu Debit</option>
                    <option value="E-Wallet (QRIS/GoPay/OVO/ShopeePay)">E-Wallet / QRIS</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Catatan */}
              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] text-xs sm:text-sm"
                />
              </div>

              {/* Row 6: Foto Struk */}
              <div>
                <label className="block text-xs font-semibold text-[#55443B] mb-1">
                  Foto Struk / Nota
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
                    <span>Upload Foto Struk</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isConfirmingDelete && (
          <div className="pt-3 border-t border-[#EFE8E1] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-[#78665D] hover:bg-[#FAF4ED] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
