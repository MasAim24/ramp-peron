import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CreditCard, 
  Banknote, 
  FileText, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Receipt, 
  User 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeighingRecord, CashTransaction } from '../types';
import { formatRupiah, formatKg, formatDateTime } from '../utils/formatters';

export const CashierView: React.FC = () => {
  const { 
    records, 
    suppliers, 
    cashTransactions, 
    companySettings, 
    processPayment, 
    addCashTransaction 
  } = useApp();

  // Pending Tickets awaiting payment
  const pendingTickets = records.filter(
    r => r.type === 'INBOUND' && r.status === 'COMPLETED' && r.paymentStatus === 'PENDING'
  );

  // Paid Tickets
  const paidTickets = records.filter(
    r => r.type === 'INBOUND' && r.status === 'COMPLETED' && r.paymentStatus !== 'PENDING'
  );

  // Active modal for payment settlement
  const [activePaymentRecord, setActivePaymentRecord] = useState<WeighingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'BON'>('CASH');
  const [loanDeductInput, setLoanDeductInput] = useState<number>(0);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Manual Cash Transaction Modal
  const [showAddCashModal, setShowAddCashModal] = useState<boolean>(false);
  const [cashTxType, setCashTxType] = useState<'IN' | 'OUT'>('IN');
  const [cashCategory, setCashCategory] = useState<CashTransaction['category']>('MODAL_KASIR');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashDesc, setCashDesc] = useState<string>('');
  const [cashSupplierId, setCashSupplierId] = useState<string>('');

  // Cashier Balance Calculation
  const totalCashIn = cashTransactions
    .filter(t => t.type === 'IN')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalCashOut = cashTransactions
    .filter(t => t.type === 'OUT')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentCashBalance = totalCashIn - totalCashOut;

  // Open Payment Modal
  const handleOpenPayment = (rec: WeighingRecord) => {
    setActivePaymentRecord(rec);
    const sup = suppliers.find(s => s.id === rec.supplierId);
    if (sup && sup.debtBalance > 0) {
      const suggested = Math.min(sup.debtBalance, Math.round(rec.grossAmount * 0.2));
      setLoanDeductInput(suggested);
    } else {
      setLoanDeductInput(0);
    }
    setPaymentMethod('CASH');
    setPaymentNotes('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentRecord) return;

    processPayment(
      activePaymentRecord.id,
      paymentMethod,
      loanDeductInput,
      paymentNotes
    );

    setActivePaymentRecord(null);
  };

  const handleAddCashTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashAmount <= 0) {
      alert('Nominal transaksi kas harus lebih besar dari 0!');
      return;
    }

    addCashTransaction({
      date: new Date().toISOString(),
      type: cashTxType,
      category: cashCategory,
      amount: cashAmount,
      description: cashDesc || `${cashTxType === 'IN' ? 'Kas Masuk' : 'Kas Keluar'} - ${cashCategory}`,
      supplierId: cashSupplierId || undefined,
      handledBy: companySettings.cashierName
    });

    setShowAddCashModal(false);
    setCashAmount(0);
    setCashDesc('');
    setCashSupplierId('');
  };

  const activeSupplier = suppliers.find(s => s.id === activePaymentRecord?.supplierId);
  const finalPayable = activePaymentRecord 
    ? Math.max(0, activePaymentRecord.grossAmount - loanDeductInput - activePaymentRecord.loadingFeeDeduction) 
    : 0;

  return (
    <div className="space-y-5">
      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kasir Fisik */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-semibold">SALDO FISIK KASIR PERON</span>
            <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {formatRupiah(currentCashBalance)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Kas tunai brankas siap bayar TBS</span>
        </div>

        {/* Card 2: Antrean Bayar Petani */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-semibold">TAGIHAN MENUNGGU BAYAR</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatRupiah(pendingTickets.reduce((acc, t) => acc + t.netPayable, 0))}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">{pendingTickets.length} Tiket Menunggu Kasir</span>
        </div>

        {/* Card 3: Total Pembayaran Hari Ini */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-semibold">TOTAL DIBAYARKAN HARI INI</span>
            <ArrowDownLeft className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-200">
            {formatRupiah(paidTickets.reduce((acc, t) => acc + t.netPayable, 0))}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">{paidTickets.length} Transaksi Selesai</span>
        </div>

        {/* Card 4: Total Kasbon Petani Aktif */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="font-semibold">TOTAL PIUTANG KASBON PETANI</span>
            <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {formatRupiah(suppliers.reduce((acc, s) => acc + s.debtBalance, 0))}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Pinjaman aktif pupuk & modal</span>
        </div>
      </div>

      {/* Main Grid: Payment Queue & Cash Flow Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Pending Ticket Payment Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
            <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  Antrean Kasir Pembayaran Tiket ({pendingTickets.length} Tiket)
                </h2>
              </div>
              <span className="text-[11px] text-zinc-500">Kasir: <strong className="text-zinc-800 dark:text-zinc-200">{companySettings.cashierName}</strong></span>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {pendingTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Semua tiket penimbangan telah dibayar lunas.
                </div>
              ) : (
                pendingTickets.map(ticket => {
                  const sup = suppliers.find(s => s.id === ticket.supplierId);
                  return (
                    <div key={ticket.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-200">{ticket.ticketNumber}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {ticket.vehiclePlate}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                            {ticket.fruitGrade}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                          {ticket.supplierName} ({ticket.driverName})
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                          <span>Netto Bersih: <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{formatKg(ticket.netCleanWeight)}</strong></span>
                          <span>&bull;</span>
                          <span>Harga: <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{formatRupiah(ticket.pricePerKg)}</strong></span>
                        </div>

                        {sup && sup.debtBalance > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5 font-medium">
                            <AlertCircle className="w-3 h-3" />
                            <span>Memiliki Saldo Kasbon: <strong>{formatRupiah(sup.debtBalance)}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800 pt-2 sm:pt-0">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-medium">Total Tagihan Bersih:</span>
                          <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(ticket.netPayable || ticket.grossAmount)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenPayment(ticket)}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Bayar Petani</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cash Ledger & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
            <div className="px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  Mutasi Arus Kas Ramp
                </h3>
              </div>

              <button
                onClick={() => setShowAddCashModal(true)}
                className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Input Kas</span>
              </button>
            </div>

            <div className="p-3 divide-y divide-zinc-200 dark:divide-zinc-800/80 max-h-[450px] overflow-y-auto">
              {cashTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Belum ada transaksi mutasi kas hari ini.
                </div>
              ) : (
                cashTransactions.map(tx => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        tx.type === 'IN' 
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                      }`}>
                        {tx.type === 'IN' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-200 block truncate max-w-[190px]">
                          {tx.description}
                        </strong>
                        <span className="text-[10px] text-zinc-500">
                          {formatDateTime(tx.date)} &bull; {tx.handledBy}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`font-bold block ${
                        tx.type === 'IN' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-200'
                      }`}>
                        {tx.type === 'IN' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase">{tx.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Process Payment Settlement */}
      {activePaymentRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                  Pelunasan Pembayaran TBS ({activePaymentRecord.ticketNumber})
                </h3>
              </div>
              <button
                onClick={() => setActivePaymentRecord(null)}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4 text-xs">
              {/* Info Header */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Petani / Penerima:</span>
                  <strong className="text-zinc-900 dark:text-zinc-200">{activePaymentRecord.supplierName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Nopol & Supir:</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-200">{activePaymentRecord.vehiclePlate} ({activePaymentRecord.driverName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">Netto Bersih Diterima:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{formatKg(activePaymentRecord.netCleanWeight)}</strong>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200">
                  <span>Subtotal Kotor Buah:</span>
                  <span className="font-mono">{formatRupiah(activePaymentRecord.grossAmount)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Tunai Kasir', icon: Banknote },
                    { id: 'TRANSFER', label: 'Transfer Bank', icon: CreditCard },
                    { id: 'BON', label: 'Bon / Tempo', icon: FileText }
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as 'CASH' | 'TRANSFER' | 'BON')}
                        className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Loan Deduction Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Potong Kasbon Petani (Rp):
                  </label>
                  {activeSupplier && activeSupplier.debtBalance > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                      Sisa Hutang: {formatRupiah(activeSupplier.debtBalance)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  max={activePaymentRecord.grossAmount}
                  value={loanDeductInput || ''}
                  onChange={(e) => setLoanDeductInput(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-amber-700 dark:text-amber-300 font-mono text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Final Payable Alert */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-700 dark:text-zinc-400 block font-medium">TOTAL BERSIH DIBAYAR KE PETANI:</span>
                  <span className="text-xs text-zinc-500">
                    {paymentMethod === 'CASH' ? 'Uang tunai diserahkan kasir' : paymentMethod === 'TRANSFER' ? 'Kirim ke rekening petani' : 'Catat nota tempo'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(finalPayable)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Catatan Kasir:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dibayarkan langsung ke Pak Syamsuddin"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentRecord(null)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Konfirmasi Pembayaran Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Cash Transaction */}
      {showAddCashModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                  Input Mutasi Kas Ramp
                </h3>
              </div>
              <button
                onClick={() => setShowAddCashModal(false)}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <form onSubmit={handleAddCashTx} className="p-5 space-y-4 text-xs">
              {/* Type: In or Out */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCashTxType('IN')}
                  className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                    cashTxType === 'IN'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  + Kas Masuk (Penerimaan)
                </button>
                <button
                  type="button"
                  onClick={() => setCashTxType('OUT')}
                  className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                    cashTxType === 'OUT'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/80 dark:border-rose-500 dark:text-rose-300'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  - Kas Keluar (Pengeluaran)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kategori:
                </label>
                <select
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value as CashTransaction['category'])}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  {cashTxType === 'IN' ? (
                    <>
                      <option value="MODAL_KASIR">Modal Tambahan Kasir dari Bank / Pemilik</option>
                      <option value="PENERIMAAN_PKS">Pencairan Pembayaran Penjualan PKS</option>
                      <option value="PELUNASAN_KASBON">Pembayaran Kasbon Tunai dari Petani</option>
                    </>
                  ) : (
                    <>
                      <option value="BBM_SOLAR">Pembelian BBM Solar Genset & Wheel Loader</option>
                      <option value="KASBON_PETANI">Pemberian Kasbon Baru ke Petani</option>
                      <option value="OPERASIONAL">Biaya Operasional Ramp / Makan Minum</option>
                      <option value="PEMBAYARAN_TBS">Pembayaran TBS Petani</option>
                    </>
                  )}
                </select>
              </div>

              {cashCategory === 'KASBON_PETANI' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Pilih Petani Penerima Pinjaman:
                  </label>
                  <select
                    required
                    value={cashSupplierId}
                    onChange={(e) => setCashSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Petani --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nominal (Rp):
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  placeholder="Contoh: 5000000"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Keterangan:
                </label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi..."
                  value={cashDesc}
                  onChange={(e) => setCashDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCashModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
