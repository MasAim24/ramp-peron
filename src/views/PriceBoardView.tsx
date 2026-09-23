import React, { useState } from 'react';
import { 
  TrendingUp, 
  Save, 
  Share2, 
  Check, 
  Calculator, 
  DollarSign, 
  Calendar, 
  Building2, 
  Copy 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah, formatDateTime, formatKg } from '../utils/formatters';

export const PriceBoardView: React.FC = () => {
  const { priceBoard, mills, companySettings, updatePriceBoard } = useApp();

  // Local form editing states
  const [priceSuper, setPriceSuper] = useState<number>(priceBoard.priceSuper);
  const [priceGradeA, setPriceGradeA] = useState<number>(priceBoard.priceGradeA);
  const [priceGradeB, setPriceGradeB] = useState<number>(priceBoard.priceGradeB);
  const [targetMillPrice, setTargetMillPrice] = useState<number>(priceBoard.targetMillPrice);
  const [updatedBy, setUpdatedBy] = useState<string>(priceBoard.updatedBy);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Profit Simulation state
  const [simulationTon, setSimulationTon] = useState<number>(85); // default 85 ton per day

  const spreadMargin = targetMillPrice - priceGradeA;
  const estimatedDailyGrossProfit = (simulationTon * 1000) * spreadMargin;

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    updatePriceBoard({
      priceSuper,
      priceGradeA,
      priceGradeB,
      targetMillPrice,
      spreadMargin,
      updatedBy,
      date: new Date().toISOString().split('T')[0]
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // WhatsApp Broadcast Template Generator
  const waBroadcastText = `📢 *PENGUMUMAN HARGA TBS SAWIT HARI INI*
🏢 *${companySettings.name}*
📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
⏰ Berlaku Mulai: 07:00 WIB s/d Selesai

Harga Pembelian TBS di Ramp / Peron Kami:
⭐ *GRADE SUPER (>10 Thn):* ${formatRupiah(priceSuper)} / Kg
🌿 *GRADE A (5-10 Thn):* ${formatRupiah(priceGradeA)} / Kg
🌱 *GRADE B (Buah Pasir 3-5 Thn):* ${formatRupiah(priceGradeB)} / Kg

⚖️ Timbangan Digital Tera Metrologi Legalitas Sah.
💵 Pembayaran *TUNAI LANGSUNG* di kasir peron tanpa antre lama.
📍 Lokasi: ${companySettings.address}
📞 Kontak: ${companySettings.phone}

_Mari bawa buah TBS Anda, dapatkan pelayanan ramah & timbangan jujur!_`;

  const handleCopyWa = () => {
    navigator.clipboard.writeText(waBroadcastText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header Notification */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Papan harga TBS harian berhasil diperbarui dan diterapkan ke seluruh modul timbangan!</span>
        </div>
      )}

      {/* Main Grid: Price Board Editor & Margin Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Price Settings Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                  Penetapan Papan Harga Harian TBS
                </h2>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Update Terakhir: {formatDateTime(priceBoard.updatedAt)}
              </span>
            </div>

            <form onSubmit={handleSavePrice} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Acuan Harga Jual Peron ke PKS:</span>
                  <span className="text-xs text-zinc-400">Harga tertinggi kontrak PKS mitra aktif</span>
                </div>
                <div className="w-44">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1000"
                      value={targetMillPrice || ''}
                      onChange={(e) => setTargetMillPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-emerald-400 font-mono text-sm font-bold text-right focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-zinc-400 font-mono">/Kg</span>
                  </div>
                </div>
              </div>

              {/* Three Grade Prices */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">
                  Harga Beli Peron dari Petani / Supplier (Rp/Kg):
                </h3>

                {/* Grade Super */}
                <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-zinc-100 text-xs block">GRADE SUPER (Usia Tanam &gt; 10 Tahun)</strong>
                    <span className="text-zinc-500 text-[11px]">TBS rendemen tinggi, tandan besar, berat &gt; 18-25 kg</span>
                  </div>
                  <div className="w-40 flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1000"
                      value={priceSuper || ''}
                      onChange={(e) => setPriceSuper(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-emerald-400 font-mono text-sm font-bold text-right focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-zinc-400 font-mono">/Kg</span>
                  </div>
                </div>

                {/* Grade A */}
                <div className="p-3.5 bg-zinc-950/70 border border-emerald-900/40 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-emerald-400 text-xs block">GRADE A (Usia Tanam 5 - 10 Tahun) &bull; Standar Utama</strong>
                    <span className="text-zinc-500 text-[11px]">TBS matang prima, buah standar peron, berat 10-18 kg</span>
                  </div>
                  <div className="w-40 flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1000"
                      value={priceGradeA || ''}
                      onChange={(e) => setPriceGradeA(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-emerald-700 rounded-lg text-emerald-400 font-mono text-sm font-bold text-right focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-zinc-400 font-mono">/Kg</span>
                  </div>
                </div>

                {/* Grade B */}
                <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-zinc-100 text-xs block">GRADE B (Buah Pasir / Usia 3 - 5 Tahun)</strong>
                    <span className="text-zinc-500 text-[11px]">TBS tanaman muda / tanaman baru, tandan kecil &lt; 5-10 kg</span>
                  </div>
                  <div className="w-40 flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1000"
                      value={priceGradeB || ''}
                      onChange={(e) => setPriceGradeB(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-sm font-bold text-right focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-zinc-400 font-mono">/Kg</span>
                  </div>
                </div>
              </div>

              {/* Spread Margin Calculated */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Target Spread Margin Kotor Peron:</span>
                  <p className="text-[11px] text-zinc-500">Selisih antara jual ke PKS vs beli Grade A</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-black font-mono text-base">
                    +{formatRupiah(spreadMargin)} / Kg
                  </span>
                </div>
              </div>

              {/* Author field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Disetujui Oleh (Penanggung Jawab / Mandor):
                </label>
                <input
                  type="text"
                  required
                  value={updatedBy}
                  onChange={(e) => setUpdatedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SIMPAN & PUBLIKASIKAN HARGA TBS HARI INI</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Profit Calculator & WhatsApp Broadcast (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Daily Profit Simulation Tool */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-zinc-200 uppercase tracking-wide">
                Simulasi Proyeksi Laba Ramp Hari Ini
              </h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-zinc-400 font-medium">Target Tonase Harian Peron:</label>
                <span className="font-mono font-bold text-emerald-400 text-sm">{simulationTon} TON ({formatKg(simulationTon * 1000)})</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={simulationTon}
                onChange={(e) => setSimulationTon(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-0.5">
                <span>10 Ton</span>
                <span>100 Ton</span>
                <span>250 Ton</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Omzet Beli Petani (Grade A):</span>
                <span className="font-mono">{formatRupiah((simulationTon * 1000) * priceGradeA)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Omzet Jual ke PKS:</span>
                <span className="font-mono">{formatRupiah((simulationTon * 1000) * targetMillPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 text-sm border-t border-zinc-800 pt-1.5">
                <span>Estimasi Gross Margin Ramp:</span>
                <span className="font-mono font-black">{formatRupiah(estimatedDailyGrossProfit)}</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              * Perhitungan di atas berdasarkan spread margin Rp {spreadMargin}/kg sebelum dikurangi operasional solar & armada angkut.
            </p>
          </div>

          {/* WhatsApp Broadcast Generator Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-zinc-200 uppercase tracking-wide">
                  Format Broadcast WhatsApp Petani
                </h3>
              </div>
              <button
                onClick={handleCopyWa}
                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-semibold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? 'Tersalin!' : 'Salin Pesan WA'}</span>
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed select-all">
              {waBroadcastText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
