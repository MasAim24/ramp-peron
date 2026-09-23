import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  FileCheck, 
  Calendar, 
  Building2, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeighingRecord, OutboundMillResult } from '../types';
import { 
  formatRupiah, 
  formatKg, 
  formatPercent, 
  formatDateTime 
} from '../utils/formatters';

export const MillReconciliationView: React.FC = () => {
  const { records, mills, settleOutboundAtMill } = useApp();

  const outboundRecords = records.filter(r => r.type === 'OUTBOUND');

  // Selected Record to input PKS return data
  const [activeRecord, setActiveRecord] = useState<WeighingRecord | null>(null);

  // Form states for PKS result input
  const [millGrossInput, setMillGrossInput] = useState<number>(0);
  const [millTareInput, setMillTareInput] = useState<number>(0);
  const [millSortPercent, setMillSortPercent] = useState<number>(1.5);
  const [transportFeePerKg, setTransportFeePerKg] = useState<number>(50);
  const [notes, setNotes] = useState<string>('');

  // Handle open modal/form
  const handleOpenForm = (rec: WeighingRecord) => {
    setActiveRecord(rec);
    if (rec.millResult) {
      setMillGrossInput(rec.millResult.millGrossKg);
      setMillTareInput(rec.millResult.millTareKg);
      setMillSortPercent(rec.millResult.millDeductionPercent);
      setTransportFeePerKg(rec.millResult.transportFeePerKg);
      setNotes(rec.millResult.notes || '');
    } else {
      setMillGrossInput(rec.grossWeight);
      setMillTareInput(rec.tareWeight);
      setMillSortPercent(1.5);
      setTransportFeePerKg(50);
      setNotes('');
    }
  };

  // Calculations for live preview
  const millNet = Math.max(0, millGrossInput - millTareInput);
  const millDeductionKg = Math.round(millNet * (millSortPercent / 100));
  const millAcceptedNet = Math.max(0, millNet - millDeductionKg);

  const rampNet = activeRecord ? activeRecord.netCleanWeight : 0;
  const shrinkageKg = Math.max(0, rampNet - millNet);
  const shrinkagePercent = rampNet > 0 ? (shrinkageKg / rampNet) * 100 : 0;

  const millPrice = activeRecord ? activeRecord.pricePerKg : 0;
  const grossIncome = millAcceptedNet * millPrice;
  const totalTransportFee = Math.round(millAcceptedNet * transportFeePerKg);
  const estimatedCost = Math.round(rampNet * (millPrice - 230));
  const netMargin = grossIncome - (estimatedCost + totalTransportFee);

  const targetMill = mills.find(m => m.id === activeRecord?.millId);
  const tolerance = targetMill ? targetMill.toleranceShrinkPercent : 0.6;
  const isHighShrinkage = shrinkagePercent > tolerance;

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    const result: OutboundMillResult = {
      millGrossKg: millGrossInput,
      millTareKg: millTareInput,
      millNetKg: millNet,
      millDeductionPercent: millSortPercent,
      millDeductionKg,
      millAcceptedNetKg: millAcceptedNet,
      millPricePerKg: millPrice,
      shrinkageKg,
      shrinkagePercent,
      transportFeePerKg,
      totalTransportFee,
      grossIncome,
      estimatedCostOfGoods: estimatedCost,
      netMargin,
      isSettled: true,
      notes
    };

    settleOutboundAtMill(activeRecord.id, result);
    setActiveRecord(null);
  };

  // Overall Statistics for Outbound
  const totalOutboundKg = outboundRecords.reduce((acc, r) => acc + r.netCleanWeight, 0);
  const totalReconciled = outboundRecords.filter(r => r.millResult?.isSettled);
  const avgShrinkage = totalReconciled.length > 0
    ? totalReconciled.reduce((acc, r) => acc + (r.millResult?.shrinkagePercent || 0), 0) / totalReconciled.length
    : 0;
  const totalMargin = totalReconciled.reduce((acc, r) => acc + (r.millResult?.netMargin || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <span className="text-zinc-500 text-xs font-semibold block mb-1">TOTAL TBS TERKIRIM KE PKS</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{formatKg(totalOutboundKg)}</span>
            <span className="text-xs text-zinc-500 font-mono">({(totalOutboundKg / 1000).toFixed(1)} Ton)</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">{outboundRecords.length} Truk Armada SPB</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <span className="text-zinc-500 text-xs font-semibold block mb-1">REKONSILIASI SELESAI</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {totalReconciled.length} / {outboundRecords.length}
            </span>
            <span className="text-xs text-zinc-500">SPB Valid</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Telah cocok faktur PKS</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <span className="text-zinc-500 text-xs font-semibold block mb-1">RATA-RATA SUSUT PERJALANAN</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${avgShrinkage > 0.6 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {formatPercent(avgShrinkage)}
            </span>
            <span className="text-xs text-zinc-500">Toleransi &le; 0.6%</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Netto Ramp vs Netto PKS</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs transition-colors">
          <span className="text-zinc-500 text-xs font-semibold block mb-1">ESTIMASI MARGIN LABA PERON</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatRupiah(totalMargin)}</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-500 font-semibold">Net Profit</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Setelah beban solar & armada</span>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Daftar Surat Pengantar Buah (SPB) & Pengiriman ke PKS
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono text-[11px]">
                <th className="py-2.5 px-3">NO SPB & TIKET</th>
                <th className="py-2.5 px-3">TANGGAL</th>
                <th className="py-2.5 px-3">PKS TUJUAN</th>
                <th className="py-2.5 px-3">ARMADA & SUPIR</th>
                <th className="py-2.5 px-3 text-right">NETTO RAMP</th>
                <th className="py-2.5 px-3 text-right">NETTO PKS</th>
                <th className="py-2.5 px-3 text-right">SUSUT (KG / %)</th>
                <th className="py-2.5 px-3 text-right">MARGIN PERON</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
              {outboundRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500">
                    Belum ada pengiriman TBS ke PKS. Gunakan menu Jembatan Timbang &gt; Timbang Keluar.
                  </td>
                </tr>
              ) : (
                outboundRecords.map(rec => {
                  const res = rec.millResult;
                  const hasResult = !!res?.isSettled;
                  return (
                    <tr key={rec.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors">
                      <td className="py-3 px-3 font-mono">
                        <strong className="text-zinc-900 dark:text-zinc-200 block">{rec.spbNumber || rec.ticketNumber}</strong>
                        <span className="text-[10px] text-zinc-500">{rec.ticketNumber}</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateTime(rec.timestampGross)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200 block truncate max-w-[160px]">
                          {rec.millName}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          Kontrak: {formatRupiah(rec.pricePerKg)}/kg
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200 block">{rec.vehiclePlate}</span>
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{rec.driverName}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                        {formatKg(rec.netCleanWeight)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {hasResult ? (
                          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{formatKg(res.millNetKg)}</span>
                        ) : (
                          <span className="text-zinc-500 italic">Menunggu Faktur PKS</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {hasResult ? (
                          <div>
                            <span className={`font-bold block ${res.shrinkagePercent > 0.6 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              {res.shrinkageKg} kg ({formatPercent(res.shrinkagePercent)})
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {res.shrinkagePercent > 0.6 ? 'Susut Tinggi' : 'Toleransi Aman'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {hasResult ? (
                          <span className="text-emerald-700 dark:text-emerald-400">{formatRupiah(res.netMargin)}</span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasResult 
                            ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}>
                          {hasResult ? 'COCOK' : 'MENUNGGU PKS'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenForm(rec)}
                          className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700 shadow-2xs"
                        >
                          {hasResult ? 'Edit Faktur PKS' : 'Input Hasil PKS'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog for PKS Result Input */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                  Input Rekonsiliasi Timbangan PKS ({activeRecord.spbNumber || activeRecord.ticketNumber})
                </h3>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="p-5 space-y-4">
              {/* Baseline Ramp Data Summary */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500 block">PKS Tujuan:</span>
                  <strong className="text-zinc-900 dark:text-zinc-200 truncate block">{activeRecord.millName}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Nopol Armada:</span>
                  <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{activeRecord.vehiclePlate}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Netto Ramp:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{formatKg(activeRecord.netCleanWeight)}</strong>
                </div>
              </div>

              {/* Form Input: Mill Ticket Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Bruto di Pabrik PKS (Kg):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={millGrossInput || ''}
                    onChange={(e) => setMillGrossInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tara di Pabrik PKS (Kg):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={millTareInput || ''}
                    onChange={(e) => setMillTareInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Sortasi Potongan PKS (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={millSortPercent}
                    onChange={(e) => setMillSortPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Potong: {millDeductionKg} kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ongkos Angkut Truk (Rp/Kg):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transportFeePerKg}
                    onChange={(e) => setTransportFeePerKg(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Total Ongkos: {formatRupiah(totalTransportFee)}
                  </span>
                </div>
              </div>

              {/* Shrinkage & Margin Alert Preview */}
              <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                isHighShrinkage
                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-200'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200'
              }`}>
                <div className="flex justify-between font-semibold">
                  <span>Netto Diterima Pabrik (PKS):</span>
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatKg(millAcceptedNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Susut Pengiriman (Netto Ramp - Netto PKS):</span>
                  <span className="font-mono font-bold">
                    {shrinkageKg} kg ({formatPercent(shrinkagePercent)})
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Status Toleransi Susut:</span>
                  <strong className={isHighShrinkage ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-emerald-700 dark:text-emerald-400'}>
                    {isHighShrinkage ? `SUSUT TINGGI (> Toleransi ${tolerance}%)` : `AMAN (≤ Toleransi ${tolerance}%)`}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800/40 pt-1 text-zinc-900 dark:text-zinc-100 font-bold">
                  <span>Estimasi Laba Bersih Peron dari Truk Ini:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">{formatRupiah(netMargin)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Catatan Faktur PKS:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No Faktur PKS: INV-PKS-9912, Sortasi fraksi 0: 1.5%"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRecord(null)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Simpan Hasil Timbang PKS & Kunci Margin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
