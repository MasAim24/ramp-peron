import React from 'react';
import { 
  Printer, 
  X, 
  Download, 
  CheckCircle, 
  Building2, 
  Share2 
} from 'lucide-react';
import { WeighingRecord } from '../types';
import { useApp } from '../context/AppContext';
import { 
  formatRupiah, 
  formatKg, 
  formatPercent, 
  formatDateTime 
} from '../utils/formatters';

interface TicketPrintModalProps {
  record: WeighingRecord | null;
  onClose: () => void;
}

export const TicketPrintModal: React.FC<TicketPrintModalProps> = ({ record, onClose }) => {
  const { companySettings } = useApp();

  if (!record) return null;

  const handlePrint = () => {
    // If running in Electron with electronAPI
    const electronAPI = (window as unknown as { electronAPI?: { printTicket: (opts: { silent: boolean }) => Promise<unknown> } }).electronAPI;
    if (electronAPI && electronAPI.printTicket) {
      electronAPI.printTicket({ silent: false });
    } else {
      window.print();
    }
  };

  const isInbound = record.type === 'INBOUND';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8">
        {/* Modal Action Header */}
        <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm text-zinc-200">
              Slip Tiket Timbang Resmi ({record.ticketNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt Canvas (Format Kertas Thermal 80mm & Bukti Timbang) */}
        <div className="p-6 overflow-y-auto max-h-[75vh] bg-zinc-950/60 flex justify-center">
          <div 
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-zinc-900 font-mono text-[12px] p-5 rounded shadow-md border border-zinc-200 leading-tight"
          >
            {/* Header Perusahaan */}
            <div className="text-center pb-3 border-b-2 border-dashed border-zinc-400">
              <h2 className="font-extrabold text-[15px] tracking-tight uppercase leading-snug">{companySettings.name}</h2>
              <p className="text-[10px] text-zinc-700">{companySettings.tagline}</p>
              <p className="text-[9px] text-zinc-600 mt-1">{companySettings.address}</p>
              <p className="text-[9px] text-zinc-600">{companySettings.district}, {companySettings.regency}</p>
              <p className="text-[9px] text-zinc-600">Telp: {companySettings.phone}</p>
              <p className="text-[8px] text-zinc-500 font-semibold mt-0.5">{companySettings.licenseNumber}</p>
            </div>

            {/* Judul & Nomor Tiket */}
            <div className="py-2.5 text-center border-b border-dashed border-zinc-300">
              <span className="font-black text-[13px] tracking-wider uppercase block">
                {isInbound ? 'TIKET TIMBANG TBS PETANI' : 'SURAT PENGANTAR BUAH (SPB)'}
              </span>
              <span className="font-bold text-[13px] tracking-wider bg-zinc-100 px-2 py-0.5 rounded inline-block mt-0.5">
                NO: {record.ticketNumber}
              </span>
              {record.spbNumber && (
                <div className="text-[11px] font-semibold text-zinc-700 mt-0.5">
                  NO SPB: {record.spbNumber}
                </div>
              )}
            </div>

            {/* Metadata Transaksi */}
            <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-600">Tanggal/Jam 1 (Bruto):</span>
                <span className="font-semibold">{formatDateTime(record.timestampGross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Tanggal/Jam 2 (Tara):</span>
                <span className="font-semibold">{formatDateTime(record.timestampTare) || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Nomor Polisi:</span>
                <span className="font-bold uppercase tracking-wider">{record.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Nama Supir:</span>
                <span className="font-semibold">{record.driverName}</span>
              </div>

              {isInbound ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Petani / Supplier:</span>
                    <span className="font-bold truncate max-w-[170px]">{record.supplierName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Mutu / Fraksi:</span>
                    <span className="font-semibold">{record.fruitGrade}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-zinc-600">PKS Tujuan:</span>
                  <span className="font-bold truncate max-w-[170px]">{record.millName || '-'}</span>
                </div>
              )}
            </div>

            {/* Rincian Berat Timbangan */}
            <div className="py-2.5 space-y-1 text-[11px] border-b-2 border-dashed border-zinc-400">
              <div className="flex justify-between font-semibold">
                <span>1. Timbang Bruto (Masuk):</span>
                <span className="font-mono">{formatKg(record.grossWeight)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>2. Timbang Tara (Kosong):</span>
                <span className="font-mono">{formatKg(record.tareWeight)}</span>
              </div>
              <div className="flex justify-between font-bold text-[12px] pt-1 border-t border-zinc-200">
                <span>Netto Kotor (1 - 2):</span>
                <span className="font-mono">{formatKg(record.netGrossWeight)}</span>
              </div>
            </div>

            {/* Rincian Sortasi & Potongan (Khusus Inbound) */}
            {isInbound && (
              <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-zinc-300">
                <div className="font-bold text-zinc-700">Rincian Sortasi & Mutu Buah:</div>
                {record.sortation.waterPercent > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>- Basah/Hujan:</span>
                    <span>{formatPercent(record.sortation.waterPercent)}</span>
                  </div>
                )}
                {record.sortation.longStalkPercent > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>- Tangkai Panjang (&gt;2.5cm):</span>
                    <span>{formatPercent(record.sortation.longStalkPercent)}</span>
                  </div>
                )}
                {record.sortation.unripePercent > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>- Buah Mentah (Fraksi 0):</span>
                    <span>{formatPercent(record.sortation.unripePercent)}</span>
                  </div>
                )}
                {record.sortation.dirtKg > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>- Sampah/Pasir:</span>
                    <span>{formatKg(record.sortation.dirtKg)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-zinc-800 pt-0.5">
                  <span>Total Potongan Mutu:</span>
                  <span>- {formatKg(record.totalDeductionKg)} ({formatPercent(record.totalDeductionPercent)})</span>
                </div>
                <div className="flex justify-between font-extrabold text-[12px] text-black pt-1 border-t border-zinc-200">
                  <span>NETTO BERSIH DITERIMA:</span>
                  <span className="font-mono">{formatKg(record.netCleanWeight)}</span>
                </div>
              </div>
            )}

            {/* Perhitungan Pembayaran */}
            <div className="py-2.5 space-y-1 text-[11px] border-b-2 border-dashed border-zinc-400">
              <div className="flex justify-between">
                <span className="text-zinc-600">Harga TBS ({isInbound ? 'Beli' : 'Jual'}):</span>
                <span className="font-mono font-semibold">{formatRupiah(record.pricePerKg)} / kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal Kotor:</span>
                <span className="font-mono font-semibold">{formatRupiah(record.grossAmount)}</span>
              </div>

              {record.loanDeduction > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Potongan Kasbon Petani:</span>
                  <span className="font-mono font-semibold">- {formatRupiah(record.loanDeduction)}</span>
                </div>
              )}

              {record.loadingFeeDeduction > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Biaya Bongkar Muat:</span>
                  <span className="font-mono font-semibold">- {formatRupiah(record.loadingFeeDeduction)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-[13px] pt-1 border-t border-zinc-300 text-black">
                <span>TOTAL DITERIMA:</span>
                <span className="font-mono">{formatRupiah(record.netPayable)}</span>
              </div>

              <div className="text-center pt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  record.paymentStatus.includes('PAID') 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  STATUS: {record.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Catatan Kaki */}
            <p className="text-[8px] text-zinc-500 text-center py-2 leading-tight">
              {companySettings.ticketFooterNote}
            </p>

            {/* Kolom Tanda Tangan */}
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-4 pb-2 border-t border-zinc-300">
              <div>
                <p className="text-zinc-600 mb-10">{isInbound ? 'Petani / Supir' : 'Supir Pengantar'}</p>
                <div className="border-b border-zinc-400 mx-3"></div>
                <p className="font-semibold mt-1">({record.driverName || record.supplierName || 'Penerima'})</p>
              </div>

              <div>
                <p className="text-zinc-600 mb-10">Operator Timbang</p>
                <div className="border-b border-zinc-400 mx-3"></div>
                <p className="font-semibold mt-1">({record.weighmaster})</p>
              </div>
            </div>

            <div className="text-[8px] text-zinc-400 text-center mt-2 font-mono">
              Printed by AGROSCALE ERP - System ID: {companySettings.weighbridgeCode}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center text-xs text-zinc-400 no-print">
          Mendukung pencetakan ke Mini Printer Thermal POS-80 (80mm) dan Printer Dot Matrix LX-310.
        </div>
      </div>
    </div>
  );
};
