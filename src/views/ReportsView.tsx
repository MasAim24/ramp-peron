import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Scale, 
  Truck, 
  DollarSign, 
  Receipt 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatRupiah, 
  formatKg, 
  formatPercent, 
  formatDateTime, 
  exportToCSV 
} from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { records, companySettings } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'INBOUND' | 'OUTBOUND'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Filtered Records
  const filtered = records.filter(r => {
    if (filterType !== 'ALL' && r.type !== filterType) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  // Analytics Metrics
  const inboundRecords = records.filter(r => r.type === 'INBOUND' && r.status === 'COMPLETED');
  const outboundRecords = records.filter(r => r.type === 'OUTBOUND' && r.status === 'COMPLETED');

  const totalInboundKg = inboundRecords.reduce((acc, r) => acc + r.netCleanWeight, 0);
  const totalInboundPayment = inboundRecords.reduce((acc, r) => acc + r.netPayable, 0);

  const totalOutboundKg = outboundRecords.reduce((acc, r) => acc + r.netCleanWeight, 0);
  const totalOutboundIncome = outboundRecords.reduce((acc, r) => acc + (r.millResult?.grossIncome || r.grossAmount), 0);

  // Ramp Floor Stock (TBS di peron yang belum dimuat ke truk pabrik)
  const currentRampStockKg = Math.max(0, totalInboundKg - totalOutboundKg);

  // Overall Sortation Cut Average
  const totalGrossInbound = inboundRecords.reduce((acc, r) => acc + r.netGrossWeight, 0);
  const totalDeductedKg = inboundRecords.reduce((acc, r) => acc + r.totalDeductionKg, 0);
  const avgDeductionPercent = totalGrossInbound > 0 ? (totalDeductedKg / totalGrossInbound) * 100 : 0;

  // Handle Export to CSV
  const handleExportCSV = () => {
    const rows = filtered.map(r => ({
      'No Tiket': r.ticketNumber,
      'Jenis Transaksi': r.type === 'INBOUND' ? 'TBS Masuk (Petani)' : 'TBS Keluar (PKS)',
      'Nopol Truk': r.vehiclePlate,
      'Nama Supir': r.driverName,
      'Mitra / Petani / PKS': r.supplierName || r.millName || '-',
      'Grade Mutu': r.fruitGrade,
      'Berat Bruto (Kg)': r.grossWeight,
      'Berat Tara (Kg)': r.tareWeight,
      'Netto Kotor (Kg)': r.netGrossWeight,
      'Potongan Mutu (Kg)': r.totalDeductionKg,
      'Potongan Mutu (%)': r.totalDeductionPercent,
      'Netto Bersih Diterima (Kg)': r.netCleanWeight,
      'Harga Satuan (Rp)': r.pricePerKg,
      'Total Kotor (Rp)': r.grossAmount,
      'Potong Kasbon (Rp)': r.loanDeduction,
      'Total Bersih (Rp)': r.netPayable,
      'Waktu Timbang 1': r.timestampGross,
      'Waktu Timbang 2': r.timestampTare || '',
      'Status Transaksi': r.status,
      'Status Bayar': r.paymentStatus
    }));

    exportToCSV(`Laporan_Ramp_Sawit_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Analytical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total TBS Masuk */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-semibold">TOTAL TBS MASUK (PETANI)</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {formatKg(totalInboundKg)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {(totalInboundKg / 1000).toFixed(1)} Ton &bull; Nilai Beli: {formatRupiah(totalInboundPayment)}
          </span>
        </div>

        {/* Card 2: Total TBS Keluar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-semibold">TOTAL TBS KIRIM KE PKS</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {formatKg(totalOutboundKg)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {(totalOutboundKg / 1000).toFixed(1)} Ton &bull; Estimasi Jual: {formatRupiah(totalOutboundIncome)}
          </span>
        </div>

        {/* Card 3: Stok TBS di Lantai Ramp */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-semibold">ESTIMASI STOK DI LANTAI RAMP</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {formatKg(currentRampStockKg)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {(currentRampStockKg / 1000).toFixed(1)} Ton TBS menunggu armada muat
          </span>
        </div>

        {/* Card 4: Rata-rata Potongan Mutu */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-semibold">RATA-RATA POTONGAN SORTASI</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatPercent(avgDeductionPercent)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Total dipotong: {formatKg(totalDeductedKg)}
          </span>
        </div>
      </div>

      {/* Filter and Export Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Transaksi:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ALL' | 'INBOUND' | 'OUTBOUND')}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Jenis Transaksi</option>
            <option value="INBOUND">TBS Masuk (Beli Petani)</option>
            <option value="OUTBOUND">TBS Keluar (Kirim PKS)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="COMPLETED">Selesai (Completed)</option>
            <option value="TARA_PENDING">Menunggu Tara (Pending)</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ke Excel / CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Main Audit Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
              Rekapitulasi Buku Timbangan & Audit Finansial Peron ({filtered.length} Data)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-semibold font-mono text-[11px]">
                <th className="py-2.5 px-3">NO TIKET</th>
                <th className="py-2.5 px-3">WAKTU TIMBANG</th>
                <th className="py-2.5 px-3">TIPE</th>
                <th className="py-2.5 px-3">NOPOL & SUPIR</th>
                <th className="py-2.5 px-3">PETANI / PKS</th>
                <th className="py-2.5 px-3 text-right">BRUTO</th>
                <th className="py-2.5 px-3 text-right">TARA</th>
                <th className="py-2.5 px-3 text-right">NETTO BERSIH</th>
                <th className="py-2.5 px-3 text-right">HARGA (RP)</th>
                <th className="py-2.5 px-3 text-right">TOTAL (RP)</th>
                <th className="py-2.5 px-3 text-center">BAYAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-zinc-200">
                    {rec.ticketNumber}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap text-[11px]">
                    {formatDateTime(rec.timestampGross)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.type === 'INBOUND'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {rec.type === 'INBOUND' ? 'MASUK' : 'KELUAR'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-zinc-200 block">{rec.vehiclePlate}</span>
                    <span className="text-[11px] text-zinc-400">{rec.driverName}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-zinc-200 block truncate max-w-[150px]">
                      {rec.type === 'INBOUND' ? rec.supplierName : rec.millName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                    {formatKg(rec.grossWeight)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-400">
                    {rec.tareWeight > 0 ? formatKg(rec.tareWeight) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                    {rec.netCleanWeight > 0 ? formatKg(rec.netCleanWeight) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-300">
                    {formatRupiah(rec.pricePerKg)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-100">
                    {rec.netPayable > 0 ? formatRupiah(rec.netPayable) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      rec.paymentStatus.includes('PAID')
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {rec.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
