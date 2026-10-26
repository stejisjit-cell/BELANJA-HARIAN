/**
 * CSV and JSON export utilities for BundaBudget
 */

import { Category, Transaction } from '../types/finance';
import { formatIndoDate, formatRupiah } from './formatters';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>,
  filenamePrefix = 'Riwayat_Belanja_BundaBudget'
): void {
  const headers = [
    'Tanggal',
    'Nama Barang',
    'Kategori',
    'Harga Satuan (Rp)',
    'Jumlah',
    'Total (Rp)',
    'Toko / Pasar',
    'Metode Pembayaran',
    'Catatan',
  ];

  const rows = transactions.map((t) => {
    const catName = categoriesMap.get(t.categoryId)?.name || 'Lain-lain';
    return [
      `"${t.date}"`,
      `"${(t.itemName || '').replace(/"/g, '""')}"`,
      `"${catName.replace(/"/g, '""')}"`,
      t.unitPrice,
      t.quantity,
      t.totalAmount,
      `"${(t.storeName || '').replace(/"/g, '""')}"`,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filenamePrefix}_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONFile(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
