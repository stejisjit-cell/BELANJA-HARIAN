import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  History,
  PiggyBank,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { SavingsGoal } from '../types/finance';
import {
  formatIndoDate,
  formatRupiah,
  getTodayDateString,
  parseRupiahInput,
} from '../utils/formatters';

interface SavingsViewProps {
  savingsGoals: SavingsGoal[];
  onSaveGoal: (goal: SavingsGoal) => Promise<any>;
  onDeleteGoal: (id: string) => Promise<any>;
}

const PRESET_GOALS = [
  { title: 'Dana Darurat Keluarga (3 Bulan)', category: 'Darurat', color: '#A7AB98' },
  { title: 'Biaya Masuk TK / SD Si Kecil', category: 'Pendidikan', color: '#DDA29B' },
  { title: 'Liburan Akhir Tahun & Mudik', category: 'Liburan', color: '#EFD7A8' },
  { title: 'Pembelian Kulkas / Mesin Cuci Baru', category: 'Rumah Tangga', color: '#F3D7D1' },
  { title: 'Tabungan Qurban / Hari Raya', category: 'Sosial', color: '#8CA595' },
];

export const SavingsView: React.FC<SavingsViewProps> = ({
  savingsGoals,
  onSaveGoal,
  onDeleteGoal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmountInput, setActionAmountInput] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [historyModalGoal, setHistoryModalGoal] = useState<SavingsGoal | null>(null);

  // New Goal State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pendidikan');
  const [newTargetInput, setNewTargetInput] = useState('5000000');
  const [newInitialInput, setNewInitialInput] = useState('0');
  const [newDeadline, setNewDeadline] = useState('');
  const [newColor, setNewColor] = useState('#DDA29B');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalSavedAll = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetAll = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);

  const handleOpenAdd = (preset?: typeof PRESET_GOALS[0]) => {
    setNewTitle(preset ? preset.title : '');
    setNewCategory(preset ? preset.category : 'Lain-lain');
    setNewColor(preset ? preset.color : '#DDA29B');
    setNewTargetInput('5000000');
    setNewInitialInput('0');
    setNewDeadline('');
    setErrorMsg(null);
    setIsAddModalOpen(true);
  };

  const handleSaveNewGoal = async () => {
    setErrorMsg(null);
    if (!newTitle.trim()) {
      setErrorMsg('Nama tujuan tabungan wajib diisi.');
      return;
    }
    const targetAmount = parseRupiahInput(newTargetInput);
    const initialAmount = parseRupiahInput(newInitialInput);
    if (targetAmount <= 0) {
      setErrorMsg('Target nominal tabungan harus lebih dari Rp 0.');
      return;
    }

    const newGoal: SavingsGoal = {
      id: `save-${Date.now()}`,
      title: newTitle.trim(),
      targetAmount,
      currentAmount: initialAmount,
      deadline: newDeadline || undefined,
      color: newColor,
      category: newCategory,
      history:
        initialAmount > 0
          ? [
              {
                id: `h-${Date.now()}`,
                date: getTodayDateString(),
                amount: initialAmount,
                type: 'deposit',
                notes: 'Saldo awal tabungan',
              },
            ]
          : [],
      createdAt: Date.now(),
    };

    await onSaveGoal(newGoal);
    setIsAddModalOpen(false);
  };

  const handleExecuteAction = async () => {
    if (!selectedGoalForAction) return;
    const amount = parseRupiahInput(actionAmountInput);
    if (amount <= 0) return;

    let updatedCurrent = selectedGoalForAction.currentAmount;
    if (actionType === 'deposit') {
      updatedCurrent += amount;
    } else {
      updatedCurrent = Math.max(0, updatedCurrent - amount);
    }

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      date: getTodayDateString(),
      amount,
      type: actionType,
      notes: actionNotes.trim() || (actionType === 'deposit' ? 'Setor tabungan' : 'Tarik tabungan'),
    };

    const updatedGoal: SavingsGoal = {
      ...selectedGoalForAction,
      currentAmount: updatedCurrent,
      history: [newHistoryItem, ...(selectedGoalForAction.history || [])],
    };

    await onSaveGoal(updatedGoal);
    setSelectedGoalForAction(null);
    setActionAmountInput('');
    setActionNotes('');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Total Savings Accumulated */}
      <div className="bg-gradient-to-r from-[#FAF2EC] via-[#FDF7F3] to-[#FAF2EC] border border-[#EFE4DA] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#8F483D] border border-[#EADBCE]">
            Simpanan Mandiri Keluarga
          </span>
          <div className="mt-2">
            <span className="text-xs text-[#78665D]">Total Uang Tabungan Terkumpul:</span>
            <h2 className="font-serif-heading font-extrabold text-2xl sm:text-3xl text-[#55443B]">
              {formatRupiah(totalSavedAll)}
            </h2>
          </div>
          <p className="text-[11px] text-[#8C7A70] mt-1">
            Dari total rencana impian: <strong>{formatRupiah(totalTargetAll)}</strong> ({savingsGoals.length} target aktif)
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#DDA29B] to-[#C98B84] hover:from-[#D1928B] hover:to-[#BD7F78] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Recommended Quick Presets */}
      <div className="bg-white border border-[#EFE8E1] rounded-3xl p-4 sm:p-5 shadow-xs">
        <h4 className="text-xs font-bold text-[#55443B] mb-2.5">
          💡 Rekomendasi Target Keuangan Bunda:
        </h4>
        <div className="flex flex-wrap gap-2">
          {PRESET_GOALS.map((pr) => (
            <button
              key={pr.title}
              onClick={() => handleOpenAdd(pr)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF5F0] hover:bg-[#F5ECE3] border border-[#EAE0D6] text-xs text-[#55443B] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pr.color }} />
              <span>+ {pr.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {savingsGoals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="bg-white border border-[#EFE8E1] hover:border-[#DDCFC3] rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${goal.color}25` }}
                    >
                      <PiggyBank className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#78665D]">
                        {goal.category}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-[#55443B] mt-0.5">
                        {goal.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus target "${goal.title}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className="p-1.5 text-[#B5A599] hover:text-[#C94D3F] rounded-lg transition-colors"
                    title="Hapus Target Tabungan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Stats */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-[#8C7A70]">Terkumpul:</span>
                    <span className="font-extrabold text-sm sm:text-base text-[#55443B]">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs text-[#8C7A70]">
                    <span>Target:</span>
                    <span>{formatRupiah(goal.targetAmount)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#EFE8E1] h-3 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#8C7A70] pt-0.5">
                    <span className="font-bold" style={{ color: goal.color }}>
                      {percent}% tercapai {isComplete && '🎉 Tercapai!'}
                    </span>
                    <span>Sisa: {formatRupiah(remaining)}</span>
                  </div>
                </div>

                {goal.deadline && (
                  <p className="text-[11px] text-[#8C7A70] flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#8F483D]" />
                    <span>Target batas waktu: {formatIndoDate(goal.deadline)}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons: Setor, Tarik, Riwayat */}
              <div className="mt-4 pt-3 border-t border-[#EFE8E1] flex items-center justify-between gap-2">
                <button
                  onClick={() => setHistoryModalGoal(goal)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#78665D] hover:bg-[#FAF4ED] flex items-center gap-1 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Riwayat ({goal.history?.length || 0})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedGoalForAction(goal);
                      setActionType('withdraw');
                      setActionAmountInput('');
                      setActionNotes('');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E2D6CB] text-xs font-semibold text-[#78665D] hover:bg-[#FAF4ED] transition-colors"
                  >
                    Tarik
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGoalForAction(goal);
                      setActionType('deposit');
                      setActionAmountInput('');
                      setActionNotes('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#55443B] hover:bg-[#43352E] text-white text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Setor</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {savingsGoals.length === 0 && (
        <div className="bg-white border border-[#EFE8E1] rounded-3xl p-10 text-center space-y-3">
          <PiggyBank className="w-12 h-12 text-[#C4B5A6] mx-auto" />
          <h4 className="font-bold text-base text-[#55443B]">Belum ada target tabungan</h4>
          <p className="text-xs text-[#8C7A70] max-w-sm mx-auto">
            Mulai rencanakan dana darurat atau impian keluarga Bunda hari ini. Uang tabungan disimpan terpisah dan tidak tercampur belanja.
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="px-5 py-2.5 bg-[#DDA29B] text-white text-xs font-bold rounded-2xl shadow-xs"
          >
            + Buat Target Tabungan
          </button>
        </div>
      )}

      {/* Modal: Setor / Tarik Tabungan */}
      {selectedGoalForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDFB] rounded-3xl p-6 shadow-2xl border border-[#EFE4DA] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8E1]">
              <div>
                <h3 className="font-serif-heading font-bold text-base text-[#55443B]">
                  {actionType === 'deposit' ? 'Setor Uang Tabungan' : 'Tarik Uang Tabungan'}
                </h3>
                <p className="text-xs text-[#8C7A70]">{selectedGoalForAction.title}</p>
              </div>
              <button
                onClick={() => setSelectedGoalForAction(null)}
                className="p-1 rounded-xl text-[#9C8C84] hover:text-[#55443B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#55443B] mb-1">
                  Nominal {actionType === 'deposit' ? 'Setoran' : 'Penarikan'} (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-[#8C7A70]">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={actionAmountInput}
                    onChange={(e) => {
                      const num = parseRupiahInput(e.target.value);
                      setActionAmountInput(num > 0 ? num.toLocaleString('id-ID') : '');
                    }}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E2D6CB] bg-white font-extrabold text-[#55443B] text-sm focus:outline-none focus:ring-2 focus:ring-[#DDA29B]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#55443B] mb-1">
                  Catatan / Sumber Dana
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sisa nafkah belanja, arisan, penjualan kue"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE8E1]">
              <button
                onClick={() => setSelectedGoalForAction(null)}
                className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-[#78665D] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteAction}
                className="px-5 py-2 rounded-xl bg-[#55443B] text-white text-xs font-bold shadow-xs hover:bg-[#43352E]"
              >
                Simpan Transaksi Tabungan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Riwayat Tabungan */}
      {historyModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDFB] rounded-3xl p-6 shadow-2xl border border-[#EFE4DA] space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8E1]">
              <div>
                <h3 className="font-serif-heading font-bold text-base text-[#55443B]">
                  Riwayat Tabungan
                </h3>
                <p className="text-xs text-[#8C7A70]">{historyModalGoal.title}</p>
              </div>
              <button
                onClick={() => setHistoryModalGoal(null)}
                className="p-1 rounded-xl text-[#9C8C84] hover:text-[#55443B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {(!historyModalGoal.history || historyModalGoal.history.length === 0) ? (
                <p className="text-center py-6 text-[#8C7A70]">Belum ada riwayat penambahan tabungan.</p>
              ) : (
                historyModalGoal.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl border border-[#EFE8E1] bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          h.type === 'deposit' ? 'bg-[#EDF0E9] text-[#5A634E]' : 'bg-[#FAECEB] text-[#C94D3F]'
                        }`}
                      >
                        {h.type === 'deposit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#55443B]">
                          {h.type === 'deposit' ? 'Setoran Tabungan' : 'Penarikan'}
                        </p>
                        <p className="text-[10px] text-[#8C7A70]">
                          {formatIndoDate(h.date)} {h.notes ? `• ${h.notes}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        h.type === 'deposit' ? 'text-[#5A634E]' : 'text-[#C94D3F]'
                      }`}
                    >
                      {h.type === 'deposit' ? '+' : '-'} {formatRupiah(h.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#EFE8E1] text-right">
              <button
                onClick={() => setHistoryModalGoal(null)}
                className="px-4 py-2 rounded-xl bg-[#55443B] text-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buat Target Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDFB] rounded-3xl p-6 shadow-2xl border border-[#EFE4DA] space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8E1]">
              <h3 className="font-serif-heading font-bold text-base text-[#55443B]">
                Buat Target Tabungan Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-[#9C8C84] hover:text-[#55443B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">⚠️ {errorMsg}</p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#55443B] mb-1">
                  Nama Target Tabungan *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dana Darurat 3 Bulan, Liburan Akhir Tahun"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#55443B] mb-1">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B]"
                  >
                    <option value="Darurat">Dana Darurat</option>
                    <option value="Pendidikan">Pendidikan Anak</option>
                    <option value="Liburan">Liburan & Mudik</option>
                    <option value="Rumah Tangga">Alat / Rumah</option>
                    <option value="Sosial">Qurban & Sosial</option>
                    <option value="Lain-lain">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#55443B] mb-1">
                    Target Batas Waktu
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#55443B] mb-1">
                  Target Nominal Akhir (Rp) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newTargetInput}
                  onChange={(e) => {
                    const num = parseRupiahInput(e.target.value);
                    setNewTargetInput(num > 0 ? num.toLocaleString('id-ID') : '');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B] font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#55443B] mb-1">
                  Saldo Awal Saat Ini (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newInitialInput}
                  onChange={(e) => {
                    const num = parseRupiahInput(e.target.value);
                    setNewInitialInput(num > 0 ? num.toLocaleString('id-ID') : '');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2D6CB] bg-white text-[#55443B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE8E1]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E2D6CB] text-[#78665D] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNewGoal}
                className="px-5 py-2 rounded-xl bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-bold shadow-xs"
              >
                Simpan Target Tabungan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
