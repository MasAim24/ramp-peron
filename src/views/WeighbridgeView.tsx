import React, { useState } from 'react';
import { 
  Scale, 
  Truck, 
  User, 
  Clock, 
  ArrowRight, 
  Save, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Search, 
  ChevronRight,
  TrendingDown,
  Info,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DigitalScaleDisplay } from '../components/DigitalScaleDisplay';
import { TicketPrintModal } from '../components/TicketPrintModal';
import { 
  formatRupiah, 
  formatKg, 
  formatPercent, 
  formatDateTime,
  calculateInboundWeighing 
} from '../utils/formatters';
import { FruitGrade, SortationDeductions, WeighingRecord } from '../types';

export const WeighbridgeView: React.FC = () => {
  const { 
    records, 
    suppliers, 
    mills, 
    vehicles, 
    priceBoard, 
    companySettings, 
    liveWeight,
    createInboundRecord, 
    completeInboundTare, 
    createOutboundRecord,
    cancelRecord 
  } = useApp();

  // Mode: Inbound vs Outbound
  const [activeMode, setActiveMode] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');

  // Inbound Form States
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [fruitGrade, setFruitGrade] = useState<FruitGrade>('GRADE_A');
  const [priceOverride, setPriceOverride] = useState<number>(priceBoard.priceGradeA);
  const [grossInput, setGrossInput] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Pending Tara Selection & Form
  const [activePendingRecord, setActivePendingRecord] = useState<WeighingRecord | null>(null);
  const [tareInput, setTareInput] = useState<number>(0);
  const [sortation, setSortation] = useState<SortationDeductions>({
    waterPercent: 0,
    longStalkPercent: 0,
    unripePercent: 0,
    rottenPercent: 0,
    abnormalPercent: 0,
    dirtKg: 0
  });
  const [loanDeductInput, setLoanDeductInput] = useState<number>(0);

  // Outbound Form States
  const [selectedMillId, setSelectedMillId] = useState<string>('');
  const [outboundTareInput, setOutboundTareInput] = useState<number>(0);
  const [outboundGrossInput, setOutboundGrossInput] = useState<number>(0);
  const [outboundPriceInput, setOutboundPriceInput] = useState<number>(priceBoard.targetMillPrice);

  // Modals & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<WeighingRecord | null>(null);

  // Find currently selected supplier object
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Handle supplier change: auto-fill grade & price & suggest vehicle if known
  const handleSupplierChange = (id: string) => {
    setSelectedSupplierId(id);
    const sup = suppliers.find(s => s.id === id);
    if (sup) {
      setFruitGrade(sup.defaultGrade);
      const gradePrices: Record<FruitGrade, number> = {
        SUPER: priceBoard.priceSuper,
        GRADE_A: priceBoard.priceGradeA,
        GRADE_B: priceBoard.priceGradeB
      };
      setPriceOverride(gradePrices[sup.defaultGrade]);
    }
  };

  const handleGradeChange = (grade: FruitGrade) => {
    setFruitGrade(grade);
    const gradePrices: Record<FruitGrade, number> = {
      SUPER: priceBoard.priceSuper,
      GRADE_A: priceBoard.priceGradeA,
      GRADE_B: priceBoard.priceGradeB
    };
    setPriceOverride(gradePrices[grade]);
  };

  // Quick vehicle selection handler
  const handleVehicleSelect = (plate: string) => {
    setVehiclePlate(plate);
    const veh = vehicles.find(v => v.plateNumber === plate);
    if (veh) {
      setDriverName(veh.driverName);
      if (activePendingRecord) {
        setTareInput(veh.tareAverageKg);
      }
    }
  };

  // Submit Inbound Weighing 1 (Bruto)
  const handleSubmitGrossInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) {
      alert('Nomor Polisi Truk wajib diisi!');
      return;
    }
    if (grossInput <= 0) {
      alert('Nilai timbangan Bruto harus lebih besar dari 0!');
      return;
    }

    const newRecord = createInboundRecord({
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      driverName: driverName.trim() || 'Supir Petani',
      supplierId: selectedSupplier?.id,
      supplierName: selectedSupplier?.name || 'Petani Umum / Non-Mitra',
      supplierCode: selectedSupplier?.code || 'UMUM',
      fruitGrade,
      grossWeight: grossInput,
      tareWeight: 0,
      pricePerKg: priceOverride,
      notes
    });

    // Reset Form
    setGrossInput(0);
    setVehiclePlate('');
    setDriverName('');
    setSelectedSupplierId('');
    setNotes('');

    setSelectedRecordForPrint(newRecord);
  };

  // Submit Inbound Weighing 2 (Tara & Sortasi)
  const handleCompleteTara = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePendingRecord) return;
    if (tareInput <= 0) {
      alert('Nilai timbangan Tara harus lebih besar dari 0!');
      return;
    }
    if (tareInput >= activePendingRecord.grossWeight) {
      alert('Berat Tara tidak boleh lebih besar atau sama dengan berat Bruto!');
      return;
    }

    completeInboundTare(
      activePendingRecord.id,
      tareInput,
      sortation,
      loanDeductInput,
      0,
      notes || activePendingRecord.notes
    );

    const updated = {
      ...activePendingRecord,
      tareWeight: tareInput,
      netGrossWeight: activePendingRecord.grossWeight - tareInput,
      sortation,
      loanDeduction: loanDeductInput
    };
    setSelectedRecordForPrint(updated);
    setActivePendingRecord(null);
    setTareInput(0);
    setLoanDeductInput(0);
  };

  // Submit Outbound SPB (Kirim ke PKS)
  const handleSubmitOutbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMillId) {
      alert('Pilih PKS Tujuan pengiriman!');
      return;
    }
    if (!vehiclePlate) {
      alert('Pilih / masukkan Nopol Armada Truk Ramp!');
      return;
    }
    if (outboundGrossInput <= outboundTareInput) {
      alert('Timbangan Bruto muatan harus lebih besar dari Tara kosong!');
      return;
    }

    const mill = mills.find(m => m.id === selectedMillId);

    const rec = createOutboundRecord({
      vehiclePlate: vehiclePlate.toUpperCase().trim(),
      driverName: driverName || 'Supir Armada Peron',
      millId: mill?.id,
      millName: mill?.name,
      millCode: mill?.code,
      grossWeight: outboundGrossInput,
      tareWeight: outboundTareInput,
      pricePerKg: outboundPriceInput,
      notes: notes || `Pengiriman ke ${mill?.name}`
    });

    setSelectedRecordForPrint(rec);
    setOutboundGrossInput(0);
    setOutboundTareInput(0);
    setVehiclePlate('');
    setDriverName('');
    setSelectedMillId('');
  };

  // Pending Tara Queue
  const pendingRecords = records.filter(r => r.status === 'TARA_PENDING');

  // Filtered Records for Table
  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      r.ticketNumber.toLowerCase().includes(q) ||
      r.vehiclePlate.toLowerCase().includes(q) ||
      (r.supplierName && r.supplierName.toLowerCase().includes(q)) ||
      (r.millName && r.millName.toLowerCase().includes(q)) ||
      r.driverName.toLowerCase().includes(q);
    return matchQuery;
  });

  // Calculate live preview for Tara completion
  const taraCalcPreview = activePendingRecord ? calculateInboundWeighing(
    activePendingRecord.grossWeight,
    tareInput,
    sortation,
    activePendingRecord.pricePerKg,
    loanDeductInput,
    0
  ) : null;

  return (
    <div className="space-y-5">
      {/* Top Digital Indicator Display */}
      <DigitalScaleDisplay
        onCaptureWeight={(kg) => {
          if (activePendingRecord) {
            setTareInput(kg);
          } else if (activeMode === 'INBOUND') {
            setGrossInput(kg);
          } else {
            if (outboundTareInput === 0) {
              setOutboundTareInput(kg);
            } else {
              setOutboundGrossInput(kg);
            }
          }
        }}
        targetInputLabel={
          activePendingRecord 
            ? `TARA TRUK ${activePendingRecord.vehiclePlate}` 
            : activeMode === 'INBOUND' 
              ? 'BRUTO (MASUK)' 
              : outboundTareInput === 0 
                ? 'TARA KOSONG RAMP' 
                : 'BRUTO MUATAN RAMP'
        }
      />

      {/* Main Section: Operations Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Weighing Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Operation Mode Selector Header */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 flex items-center gap-2 shadow-2xs transition-colors">
            <button
              onClick={() => { setActiveMode('INBOUND'); setActivePendingRecord(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'INBOUND'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>TIMBANG MASUK (BELI TBS PETANI)</span>
            </button>

            <button
              onClick={() => { setActiveMode('OUTBOUND'); setActivePendingRecord(null); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'OUTBOUND'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>TIMBANG KELUAR (KIRIM KE PKS)</span>
            </button>
          </div>

          {/* ACTIVE FORM: INBOUND WEIGHING */}
          {activeMode === 'INBOUND' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    {activePendingRecord 
                      ? `Penimbangan 2 (Tara & Sortasi) - ${activePendingRecord.ticketNumber}` 
                      : 'Penimbangan 1 (Bruto / Muatan Masuk)'}
                  </h2>
                </div>
                {activePendingRecord && (
                  <button
                    onClick={() => setActivePendingRecord(null)}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Batal Timbang Tara
                  </button>
                )}
              </div>

              {/* FORM 1: BRUTO ENTRY */}
              {!activePendingRecord ? (
                <form onSubmit={handleSubmitGrossInbound} className="p-5 space-y-4">
                  {/* Row 1: Supplier & Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Pilih Petani / Kelompok Tani:
                      </label>
                      <select
                        value={selectedSupplierId}
                        onChange={(e) => handleSupplierChange(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Petani Bebas / Non-Mitra --</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>
                            [{s.code}] {s.name} ({s.location})
                          </option>
                        ))}
                      </select>
                      {selectedSupplier && selectedSupplier.debtBalance > 0 && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Petani memiliki saldo kasbon: <strong>{formatRupiah(selectedSupplier.debtBalance)}</strong></span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Fraksi / Mutu TBS:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['SUPER', 'GRADE_A', 'GRADE_B'] as FruitGrade[]).map(grade => (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => handleGradeChange(grade)}
                            className={`py-1.5 px-2 rounded text-xs font-semibold border transition-all cursor-pointer ${
                              fruitGrade === grade
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-300'
                                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                            }`}
                          >
                            {grade.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Vehicle & Driver */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Nomor Polisi Truk:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Contoh: BM 8821 QC"
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      {/* Quick preset plate tags */}
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {vehicles.slice(0, 3).map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleVehicleSelect(v.plateNumber)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 font-mono cursor-pointer"
                          >
                            {v.plateNumber}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Nama Supir Pengantar:
                      </label>
                      <input
                        type="text"
                        placeholder="Nama supir..."
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Weight Capture & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Berat Bruto Masuk (Kg):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="0"
                          value={grossInput || ''}
                          onChange={(e) => setGrossInput(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-lg font-bold focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setGrossInput(liveWeight)}
                          className="px-3 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700 text-xs font-bold whitespace-nowrap cursor-pointer shadow-2xs"
                        >
                          Salin ({liveWeight} kg)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Harga Beli Peron (Rp/Kg):
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={priceOverride || ''}
                        onChange={(e) => setPriceOverride(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-base font-semibold focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-zinc-500 mt-1 block">
                        Harga acuan grade: {formatRupiah(priceOverride)}/kg
                      </span>
                    </div>
                  </div>

                  {/* Notes & Submit */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Catatan / Keterangan Muatan:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Buah blok timur, panen pagi"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-300 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>SIMPAN PENIMBANGAN 1 (BRUTO MASUK)</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* FORM 2: TARE & SORTATION ENTRY */
                <form onSubmit={handleCompleteTara} className="p-5 space-y-4">
                  {/* Summary of Gross */}
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block">No Tiket:</span>
                      <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{activePendingRecord.ticketNumber}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Nopol Truk:</span>
                      <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{activePendingRecord.vehiclePlate}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Petani:</span>
                      <strong className="text-zinc-900 dark:text-zinc-200 truncate block">{activePendingRecord.supplierName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Timbang Bruto:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatKg(activePendingRecord.grossWeight)}</strong>
                    </div>
                  </div>

                  {/* Tare Weight Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Timbang Tara Truk Kosong (Kg):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Contoh: 3420"
                        value={tareInput || ''}
                        onChange={(e) => setTareInput(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-lg font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setTareInput(liveWeight)}
                        className="px-3 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700 text-xs font-bold whitespace-nowrap cursor-pointer shadow-2xs"
                      >
                        Salin ({liveWeight} kg)
                      </button>
                    </div>
                  </div>

                  {/* Sortation Matrix */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-950/60">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mb-2.5 flex items-center justify-between">
                      <span>Parameter Pemotongan Mutu & Sortasi Buah:</span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                        Total Potong: <strong className="text-rose-600 dark:text-rose-400">{taraCalcPreview?.totalDeductionKg || 0} kg ({taraCalcPreview?.totalPercentDeduction || 0}%)</strong>
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Potongan Air / Hujan (%):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          value={sortation.waterPercent}
                          onChange={(e) => setSortation(s => ({ ...s, waterPercent: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Gagang Panjang &gt; 2.5cm (%):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          value={sortation.longStalkPercent}
                          onChange={(e) => setSortation(s => ({ ...s, longStalkPercent: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Buah Mentah Fraksi 0 (%):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          value={sortation.unripePercent}
                          onChange={(e) => setSortation(s => ({ ...s, unripePercent: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Buah Busuk / Lewat Matang (%):</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="20"
                          value={sortation.rottenPercent}
                          onChange={(e) => setSortation(s => ({ ...s, rottenPercent: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Potongan Sampah/Batu (Kg):</label>
                        <input
                          type="number"
                          min="0"
                          value={sortation.dirtKg}
                          onChange={(e) => setSortation(s => ({ ...s, dirtKg: parseInt(e.target.value, 10) || 0 }))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 text-[11px] mb-1">Potong Kasbon Petani (Rp):</label>
                        <input
                          type="number"
                          min="0"
                          value={loanDeductInput || ''}
                          placeholder="0"
                          onChange={(e) => setLoanDeductInput(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-amber-700 dark:text-amber-300 font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculation Result Preview Box */}
                  {taraCalcPreview && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 rounded-lg text-xs space-y-1.5">
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span>Netto Kotor (Bruto - Tara):</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{formatKg(taraCalcPreview.netGross)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span>Total Potongan Mutu:</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">- {formatKg(taraCalcPreview.totalDeductionKg)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-bold border-t border-emerald-200 dark:border-emerald-800/40 pt-1">
                        <span>NETTO BERSIH DITERIMA:</span>
                        <span className="font-mono text-sm">{formatKg(taraCalcPreview.netCleanWeight)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-900 dark:text-zinc-100 font-extrabold text-sm border-t border-emerald-200 dark:border-emerald-800/40 pt-1">
                        <span>TOTAL BAYAR KE PETANI:</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-black">{formatRupiah(taraCalcPreview.netPayable)}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>SIMPAN & SELESAIKAN PENIMBANGAN (TARA)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ACTIVE FORM: OUTBOUND WEIGHING (KIRIM PKS) */}
          {activeMode === 'OUTBOUND' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
              <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    Penimbangan Pengiriman TBS ke Pabrik (PKS)
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmitOutbound} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Pilih Pabrik Kelapa Sawit (PKS) Tujuan:
                    </label>
                    <select
                      required
                      value={selectedMillId}
                      onChange={(e) => {
                        setSelectedMillId(e.target.value);
                        const m = mills.find(mill => mill.id === e.target.value);
                        if (m) setOutboundPriceInput(m.contractPricePerKg);
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Pilih PKS Tujuan --</option>
                      {mills.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.distanceKm} km) - Kontrak {formatRupiah(m.contractPricePerKg)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Harga Kontrak PKS (Rp/Kg):
                    </label>
                    <input
                      type="number"
                      required
                      value={outboundPriceInput || ''}
                      onChange={(e) => setOutboundPriceInput(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Nomor Polisi Armada Ramp:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: BM 9412 TA"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Nama Supir Armada:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama supir armada..."
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      1. Tara Truk Kosong Ramp (Kg):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Contoh: 4250"
                        value={outboundTareInput || ''}
                        onChange={(e) => setOutboundTareInput(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setOutboundTareInput(liveWeight)}
                        className="px-2.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Salin ({liveWeight})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      2. Bruto Muatan TBS Ramp (Kg):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Contoh: 17850"
                        value={outboundGrossInput || ''}
                        onChange={(e) => setOutboundGrossInput(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setOutboundGrossInput(liveWeight)}
                        className="px-2.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        Salin ({liveWeight})
                      </button>
                    </div>
                  </div>
                </div>

                {outboundGrossInput > outboundTareInput && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Netto TBS Terkirim:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                        {formatKg(outboundGrossInput - outboundTareInput)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Estimasi Nilai Penjualan ke PKS:</span>
                      <strong className="text-zinc-900 dark:text-zinc-200 font-mono">
                        {formatRupiah((outboundGrossInput - outboundTareInput) * outboundPriceInput)}
                      </strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>TERBITKAN SPB & SURAT JALAN PENGIRIMAN PKS</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Queues & Active Floor Monitoring (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pending Tare Queue Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">
                  Antrean Bongkar Ramp ({pendingRecords.length} Truk Menunggu Tara)
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">LIVE QUEUE</span>
            </div>

            <div className="p-3 divide-y divide-zinc-200 dark:divide-zinc-800/80 max-h-[360px] overflow-y-auto">
              {pendingRecords.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Tidak ada truk yang sedang menunggu penimbangan Tara.
                </div>
              ) : (
                pendingRecords.map(rec => (
                  <div key={rec.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-200">{rec.vehiclePlate}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-semibold">
                          BRUTO: {formatKg(rec.grossWeight)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                        {rec.supplierName} • {rec.driverName}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        Masuk: {formatDateTime(rec.timestampGross)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMode('INBOUND');
                        setActivePendingRecord(rec);
                        setTareInput(rec.tareWeight || 0);
                        setSortation(rec.sortation);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Timbang Tara</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Pricing Reference Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs space-y-2.5 shadow-2xs transition-colors">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="font-bold text-zinc-800 dark:text-zinc-300">Papan Harga TBS Hari Ini:</span>
              <span className="text-[11px] text-zinc-500 font-mono">{priceBoard.date}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">GRADE SUPER</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{formatRupiah(priceBoard.priceSuper)}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">GRADE A</span>
                <strong className="text-zinc-900 dark:text-zinc-200 font-mono text-sm">{formatRupiah(priceBoard.priceGradeA)}</strong>
              </div>
              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">GRADE B</span>
                <strong className="text-zinc-900 dark:text-zinc-200 font-mono text-sm">{formatRupiah(priceBoard.priceGradeB)}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
              <span>Target Jual ke PKS: <strong className="text-zinc-900 dark:text-zinc-200 font-mono">{formatRupiah(priceBoard.targetMillPrice)}</strong></span>
              <span>Spread Margin: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+{formatRupiah(priceBoard.spreadMargin)}/kg</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Today's Weighing Records Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">
              Riwayat Transaksi Jembatan Timbang ({filteredRecords.length} Tiket)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nopol, tiket, petani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 w-52"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono text-[11px]">
                <th className="py-2.5 px-3">NO TIKET</th>
                <th className="py-2.5 px-3">TIPE</th>
                <th className="py-2.5 px-3">NOPOL & SUPIR</th>
                <th className="py-2.5 px-3">PETANI / PKS</th>
                <th className="py-2.5 px-3 text-right">BRUTO</th>
                <th className="py-2.5 px-3 text-right">TARA</th>
                <th className="py-2.5 px-3 text-right">NETTO BERSIH</th>
                <th className="py-2.5 px-3 text-right">TOTAL (RP)</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500 text-xs">
                    Belum ada data tiket penimbangan yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                      {rec.ticketNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.type === 'INBOUND'
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30'
                      }`}>
                        {rec.type === 'INBOUND' ? 'MASUK' : 'KELUAR'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200 block">{rec.vehiclePlate}</span>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{rec.driverName}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200 block truncate max-w-[150px]">
                        {rec.type === 'INBOUND' ? rec.supplierName : rec.millName}
                      </span>
                      <span className="text-[10px] text-zinc-500">{formatDateTime(rec.timestampGross)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-800 dark:text-zinc-300">
                      {formatKg(rec.grossWeight)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {rec.tareWeight > 0 ? formatKg(rec.tareWeight) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {rec.netCleanWeight > 0 ? formatKg(rec.netCleanWeight) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                      {rec.netPayable > 0 ? formatRupiah(rec.netPayable) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.status === 'COMPLETED'
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                          : rec.status === 'TARA_PENDING'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      }`}>
                        {rec.status === 'TARA_PENDING' ? 'ANTRE TARA' : rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedRecordForPrint(rec)}
                          title="Cetak Tiket"
                          className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {rec.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Masukkan alasan pembatalan tiket:');
                              if (reason) cancelRecord(rec.id, reason);
                            }}
                            title="Batalkan Tiket"
                            className="p-1.5 rounded bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Print Modal */}
      {selectedRecordForPrint && (
        <TicketPrintModal
          record={selectedRecordForPrint}
          onClose={() => setSelectedRecordForPrint(null)}
        />
      )}
    </div>
  );
};
