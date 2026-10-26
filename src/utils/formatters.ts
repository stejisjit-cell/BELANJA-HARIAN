/**
 * Utility functions for Indonesian currency, date formatting, and date math.
 */

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DAY_NAMES_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Format integer or number to Indonesian Rupiah (e.g. 150000 -> "Rp 150.000")
 */
export function formatRupiah(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'Rp 0';
  }
  const rounded = Math.round(value);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Compact Rupiah format for charts & small badges (e.g. 1500000 -> "Rp 1,5 Jt", 50000 -> "Rp 50 Rb")
 */
export function formatRupiahCompact(value: number): string {
  if (!value || isNaN(value)) return 'Rp 0';
  if (Math.abs(value) >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} Jt`;
  }
  if (Math.abs(value) >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(value);
}

/**
 * Clean string input to numeric value (removes non-digits)
 */
export function parseRupiahInput(input: string): number {
  const digits = input.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Format date string YYYY-MM-DD to Indonesian format (e.g. "27 Oktober 2026")
 */
export function formatIndoDate(dateStr: string, withDay = false): string {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  
  const dateObj = new Date(y, m - 1, d);
  const dayName = DAY_NAMES_ID[dateObj.getDay()];
  const monthName = MONTH_NAMES_ID[m - 1];

  if (withDay) {
    return `${dayName}, ${d} ${monthName} ${y}`;
  }
  return `${d} ${monthName} ${y}`;
}

/**
 * Get current date as "YYYY-MM-DD"
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get current yearMonth as "YYYY-MM"
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Get display label for yearMonth (e.g. "2026-10" -> "Oktober 2026")
 */
export function formatYearMonth(yearMonth: string): string {
  if (!yearMonth) return '';
  const [y, m] = yearMonth.split('-').map(Number);
  if (!y || !m) return yearMonth;
  return `${MONTH_NAMES_ID[m - 1]} ${y}`;
}

/**
 * Check if dateStr belongs to the same week (Monday - Sunday) as referenceDate
 */
export function isSameWeek(dateStr: string, refDateStr = getTodayDateString()): boolean {
  const [y1, m1, d1] = dateStr.split('-').map(Number);
  const [y2, m2, d2] = refDateStr.split('-').map(Number);
  const target = new Date(y1, m1 - 1, d1);
  const ref = new Date(y2, m2 - 1, d2);

  // Monday is day 1, Sunday is day 7
  const refDay = ref.getDay() === 0 ? 7 : ref.getDay();
  const startOfWeek = new Date(ref);
  startOfWeek.setDate(ref.getDate() - (refDay - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

/**
 * Get the Monday and Sunday date strings for a given date's week
 */
export function getWeekDateRange(refDateStr = getTodayDateString()): { start: string; end: string; startLabel: string; endLabel: string } {
  const [y, m, d] = refDateStr.split('-').map(Number);
  const ref = new Date(y, m - 1, d);
  const refDay = ref.getDay() === 0 ? 7 : ref.getDay();
  
  const start = new Date(ref);
  start.setDate(ref.getDate() - (refDay - 1));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
  const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

  return {
    start: startStr,
    end: endStr,
    startLabel: `${start.getDate()} ${MONTH_NAMES_ID[start.getMonth()]}`,
    endLabel: `${end.getDate()} ${MONTH_NAMES_ID[end.getMonth()]} ${end.getFullYear()}`,
  };
}

/**
 * Number to percentage string (e.g. 0.85 -> "85%")
 */
export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
}
