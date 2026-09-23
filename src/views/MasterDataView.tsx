import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Check, 
  X, 
  CreditCard, 
  MapPin, 
  Phone 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Supplier, PalmOilMill, Vehicle, FruitGrade } from '../types';
import { formatRupiah, formatKg } from '../utils/formatters';

export const MasterDataView: React.FC = () => {
  const { 
    suppliers, 
    mills, 
    vehicles, 
    saveSupplier, 
    deleteSupplier, 
    saveMill, 
    deleteMill, 
    saveVehicle, 
    deleteVehicle 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SUPPLIERS' | 'MILLS' | 'VEHICLES'>('SUPPLIERS');

  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [showMillModal, setShowMillModal] = useState<boolean>(false);
  const [editingMill, setEditingMill] = useState<PalmOilMill | null>(null);

  const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Supplier Form State
  const [supCode, setSupCode] = useState<string>('');
  const [supName, setSupName] = useState<string>('');
  const [supNik, setSupNik] = useState<string>('');
  const [supPhone, setSupPhone] = useState<string>('');
  const [supLocation, setSupLocation] = useState<string>('');
  const [supLandArea, setSupLandArea] = useState<number>(5);
  const [supPalmAge, setSupPalmAge] = useState<number>(8);
  const [supVariety, setSupVariety] = useState<string>('Marihat DxP');
  const [supBankName, setSupBankName] = useState<string>('Bank BRI');
  const [supBankAccount, setSupBankAccount] = useState<string>('');
  const [supDebtBalance, setSupDebtBalance] = useState<number>(0);
  const [supGrade, setSupGrade] = useState<FruitGrade>('GRADE_A');

  // Mill Form State
  const [millCode, setMillCode] = useState<string>('');
  const [millName, setMillName] = useState<string>('');
  const [millAddress, setMillAddress] = useState<string>('');
  const [millDistance, setMillDistance] = useState<number>(20);
  const [millContact, setMillContact] = useState<string>('');
  const [millPhone, setMillPhone] = useState<string>('');
  const [millPrice, setMillPrice] = useState<number>(2980);
  const [millTolerance, setMillTolerance] = useState<number>(0.6);
  const [millTerms, setMillTerms] = useState<string>('Tempo 3 Hari Kerja');

  // Vehicle Form State
  const [vehPlate, setVehPlate] = useState<string>('');
  const [vehType, setVehType] = useState<Vehicle['type']>('COLT_DIESEL');
  const [vehDriver, setVehDriver] = useState<string>('');
  const [vehPhone, setVehPhone] = useState<string>('');
  const [vehTare, setVehTare] = useState<number>(3400);
  const [vehCap, setVehCap] = useState<number>(9500);
  const [vehOwnership, setVehOwnership] = useState<Vehicle['ownership']>('INTERNAL');

  // Open Supplier Modal
  const openSupplierForm = (s?: Supplier) => {
    if (s) {
      setEditingSupplier(s);
      setSupCode(s.code);
      setSupName(s.name);
      setSupNik(s.nik);
      setSupPhone(s.phone);
      setSupLocation(s.location);
      setSupLandArea(s.landAreaHa);
      setSupPalmAge(s.palmAgeYears);
      setSupVariety(s.variety);
      setSupBankName(s.bankName);
      setSupBankAccount(s.bankAccount);
      setSupDebtBalance(s.debtBalance);
      setSupGrade(s.defaultGrade);
    } else {
      setEditingSupplier(null);
      setSupCode(`PET-${String(suppliers.length + 1).padStart(2, '0')}`);
      setSupName('');
      setSupNik('');
      setSupPhone('');
      setSupLocation('');
      setSupLandArea(5);
      setSupPalmAge(8);
      setSupVariety('Marihat DxP');
      setSupBankName('Bank BRI');
      setSupBankAccount('');
      setSupDebtBalance(0);
      setSupGrade('GRADE_A');
    }
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrUpdated: Supplier = {
      id: editingSupplier ? editingSupplier.id : `SUP-${Date.now()}`,
      code: supCode,
      name: supName,
      nik: supNik,
      phone: supPhone,
      location: supLocation,
      landAreaHa: supLandArea,
      palmAgeYears: supPalmAge,
      variety: supVariety,
      bankName: supBankName,
      bankAccount: supBankAccount,
      debtBalance: supDebtBalance,
      defaultGrade: supGrade,
      status: 'ACTIVE',
      joinedDate: editingSupplier ? editingSupplier.joinedDate : new Date().toISOString().split('T')[0]
    };
    saveSupplier(newOrUpdated);
    setShowSupplierModal(false);
  };

  // Open Mill Modal
  const openMillForm = (m?: PalmOilMill) => {
    if (m) {
      setEditingMill(m);
      setMillCode(m.code);
      setMillName(m.name);
      setMillAddress(m.address);
      setMillDistance(m.distanceKm);
      setMillContact(m.contactPerson);
      setMillPhone(m.phone);
      setMillPrice(m.contractPricePerKg);
      setMillTolerance(m.toleranceShrinkPercent);
      setMillTerms(m.paymentTerms);
    } else {
      setEditingMill(null);
      setMillCode(`PKS-${String(mills.length + 1).padStart(2, '0')}`);
      setMillName('');
      setMillAddress('');
      setMillDistance(25);
      setMillContact('');
      setMillPhone('');
      setMillPrice(2980);
      setMillTolerance(0.6);
      setMillTerms('Tempo 3 Hari Kerja');
    }
    setShowMillModal(true);
  };

  const handleSaveMill = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrUpdated: PalmOilMill = {
      id: editingMill ? editingMill.id : `MILL-${Date.now()}`,
      code: millCode,
      name: millName,
      address: millAddress,
      distanceKm: millDistance,
      contactPerson: millContact,
      phone: millPhone,
      contractPricePerKg: millPrice,
      maxDailyCapacityTon: 800,
      paymentTerms: millTerms,
      toleranceShrinkPercent: millTolerance,
      status: 'ACTIVE'
    };
    saveMill(newOrUpdated);
    setShowMillModal(false);
  };

  // Open Vehicle Modal
  const openVehicleForm = (v?: Vehicle) => {
    if (v) {
      setEditingVehicle(v);
      setVehPlate(v.plateNumber);
      setVehType(v.type);
      setVehDriver(v.driverName);
      setVehPhone(v.driverPhone);
      setVehTare(v.tareAverageKg);
      setVehCap(v.maxCapacityKg);
      setVehOwnership(v.ownership);
    } else {
      setEditingVehicle(null);
      setVehPlate('');
      setVehType('COLT_DIESEL');
      setVehDriver('');
      setVehPhone('');
      setVehTare(3400);
      setVehCap(9500);
      setVehOwnership('INTERNAL');
    }
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrUpdated: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `VEH-${Date.now()}`,
      plateNumber: vehPlate.toUpperCase().trim(),
      type: vehType,
      driverName: vehDriver,
      driverPhone: vehPhone,
      tareAverageKg: vehTare,
      maxCapacityKg: vehCap,
      ownership: vehOwnership
    };
    saveVehicle(newOrUpdated);
    setShowVehicleModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher & Action Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-colors">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'SUPPLIERS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Petani & Supplier ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MILLS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'MILLS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pabrik Kelapa Sawit / PKS ({mills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VEHICLES')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'VEHICLES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Armada Truk & Supir ({vehicles.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SUPPLIERS' && (
            <button
              onClick={() => openSupplierForm()}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Petani Mitra</span>
            </button>
          )}

          {activeTab === 'MILLS' && (
            <button
              onClick={() => openMillForm()}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah PKS Mitra</span>
            </button>
          )}

          {activeTab === 'VEHICLES' && (
            <button
              onClick={() => openVehicleForm()}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Truk Armada</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: SUPPLIERS TABLE */}
      {activeTab === 'SUPPLIERS' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono text-[11px]">
                  <th className="py-2.5 px-3">KODE & NAMA</th>
                  <th className="py-2.5 px-3">NIK & HP</th>
                  <th className="py-2.5 px-3">LOKASI & LAHAN</th>
                  <th className="py-2.5 px-3">REKENING BANK</th>
                  <th className="py-2.5 px-3 text-right">SALDO KASBON</th>
                  <th className="py-2.5 px-3 text-center">GRADE UTAMA</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
                {suppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-zinc-900 dark:text-zinc-200 block text-xs">{sup.name}</strong>
                      <span className="font-mono text-[10px] text-zinc-500">[{sup.code}]</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-200">{sup.phone}</div>
                      <div className="text-[10px] text-zinc-500">NIK: {sup.nik || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-300">
                      <div>{sup.location}</div>
                      <div className="text-[10px] text-zinc-500">
                        {sup.landAreaHa} Ha &bull; {sup.palmAgeYears} Thn ({sup.variety})
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-800 dark:text-zinc-300">
                      <div>{sup.bankName}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{sup.bankAccount || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {sup.debtBalance > 0 ? (
                        <strong className="text-amber-700 dark:text-amber-400 font-bold">{formatRupiah(sup.debtBalance)}</strong>
                      ) : (
                        <span className="text-zinc-500">Rp 0 (Lunas)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {sup.defaultGrade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openSupplierForm(sup)}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus petani ${sup.name}?`)) {
                              deleteSupplier(sup.id);
                            }
                          }}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MILLS TABLE */}
      {activeTab === 'MILLS' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono text-[11px]">
                  <th className="py-2.5 px-3">KODE & PKS</th>
                  <th className="py-2.5 px-3">ALAMAT & JARAK</th>
                  <th className="py-2.5 px-3">PIC & TELEPON</th>
                  <th className="py-2.5 px-3 text-right">HARGA KONTRAK</th>
                  <th className="py-2.5 px-3 text-center">TOLERANSI SUSUT</th>
                  <th className="py-2.5 px-3">SYARAT BAYAR</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
                {mills.map(mill => (
                  <tr key={mill.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <strong className="text-zinc-900 dark:text-zinc-200 block text-xs">{mill.name}</strong>
                      <span className="font-mono text-[10px] text-zinc-500">[{mill.code}]</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-300">
                      <div>{mill.address}</div>
                      <span className="text-[11px] text-zinc-500 font-mono">Jarak: {mill.distanceKm} km</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                      <div className="text-zinc-900 dark:text-zinc-200">{mill.contactPerson}</div>
                      <span className="font-mono text-[11px] text-zinc-500">{mill.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {formatRupiah(mill.contractPricePerKg)} / kg
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-zinc-800 dark:text-zinc-300">
                      &le; {mill.toleranceShrinkPercent}%
                    </td>
                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-300 font-medium">
                      {mill.paymentTerms}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openMillForm(mill)}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus PKS ${mill.name}?`)) {
                              deleteMill(mill.id);
                            }
                          }}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VEHICLES TABLE */}
      {activeTab === 'VEHICLES' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold font-mono text-[11px]">
                  <th className="py-2.5 px-3">NOPOL TRUK</th>
                  <th className="py-2.5 px-3">JENIS ARMADA</th>
                  <th className="py-2.5 px-3">SUPIR UTAMA</th>
                  <th className="py-2.5 px-3 text-right">TARA RATA-RATA</th>
                  <th className="py-2.5 px-3 text-right">KAPASITAS MAKSIMAL</th>
                  <th className="py-2.5 px-3 text-center">KEPEMILIKAN</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
                {vehicles.map(veh => (
                  <tr key={veh.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                      {veh.plateNumber}
                    </td>
                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-300">
                      {veh.type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-200">{veh.driverName}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{veh.driverPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                      {formatKg(veh.tareAverageKg)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatKg(veh.maxCapacityKg)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        veh.ownership === 'INTERNAL'
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        {veh.ownership}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openVehicleForm(veh)}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus truk ${veh.plateNumber}?`)) {
                              deleteVehicle(veh.id);
                            }
                          }}
                          className="p-1.5 rounded bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Supplier */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                {editingSupplier ? 'Edit Data Petani' : 'Pendaftaran Petani / Supplier Baru'}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kode Petani:</label>
                  <input
                    type="text"
                    required
                    value={supCode}
                    onChange={(e) => setSupCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Lengkap / Kelompok:</label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">No. KTP / NIK:</label>
                  <input
                    type="text"
                    value={supNik}
                    onChange={(e) => setSupNik(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Lokasi Kebun & Desa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desa Bukit Kemuning, Blok C"
                  value={supLocation}
                  onChange={(e) => setSupLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Luas Lahan (Ha):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={supLandArea}
                    onChange={(e) => setSupLandArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Usia Sawit (Thn):</label>
                  <input
                    type="number"
                    value={supPalmAge}
                    onChange={(e) => setSupPalmAge(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Grade Utama:</label>
                  <select
                    value={supGrade}
                    onChange={(e) => setSupGrade(e.target.value as FruitGrade)}
                    className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  >
                    <option value="SUPER">SUPER</option>
                    <option value="GRADE_A">GRADE A</option>
                    <option value="GRADE_B">GRADE B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Bank:</label>
                  <input
                    type="text"
                    value={supBankName}
                    onChange={(e) => setSupBankName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nomor Rekening:</label>
                  <input
                    type="text"
                    value={supBankAccount}
                    onChange={(e) => setSupBankAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Simpan Data Petani
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Mill */}
      {showMillModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                {editingMill ? 'Edit Data PKS' : 'Tambah Pabrik Kelapa Sawit (PKS) Tujuan'}
              </h3>
              <button onClick={() => setShowMillModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveMill} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kode PKS:</label>
                  <input
                    type="text"
                    required
                    value={millCode}
                    onChange={(e) => setMillCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Pabrik Sawit (PKS):</label>
                  <input
                    type="text"
                    required
                    value={millName}
                    onChange={(e) => setMillName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Alamat Lokasi Pabrik:</label>
                <input
                  type="text"
                  required
                  value={millAddress}
                  onChange={(e) => setMillAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Jarak dari Ramp (Km):</label>
                  <input
                    type="number"
                    value={millDistance}
                    onChange={(e) => setMillDistance(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Harga Kontrak Beli PKS (Rp/Kg):</label>
                  <input
                    type="number"
                    value={millPrice}
                    onChange={(e) => setMillPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-emerald-700 dark:text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">PIC / Manajer Timbang:</label>
                  <input
                    type="text"
                    value={millContact}
                    onChange={(e) => setMillContact(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">No. Kontak PKS:</label>
                  <input
                    type="text"
                    value={millPhone}
                    onChange={(e) => setMillPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Toleransi Susut (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={millTolerance}
                    onChange={(e) => setMillTolerance(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Syarat Pembayaran:</label>
                  <input
                    type="text"
                    value={millTerms}
                    onChange={(e) => setMillTerms(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMillModal(false)}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Simpan Data PKS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Vehicle */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transition-colors">
            <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                {editingVehicle ? 'Edit Armada Truk' : 'Tambah Armada Truk & Supir'}
              </h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveVehicle} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nomor Polisi:</label>
                  <input
                    type="text"
                    required
                    placeholder="BM 8821 QC"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Jenis Armada:</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value as Vehicle['type'])}
                    className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  >
                    <option value="COLT_DIESEL">Colt Diesel Double (6 Roda)</option>
                    <option value="DUMP_TRUCK">Dump Truck</option>
                    <option value="TRONTON">Tronton (10 Roda)</option>
                    <option value="PICKUP">Pick-up</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Supir:</label>
                  <input
                    type="text"
                    required
                    value={vehDriver}
                    onChange={(e) => setVehDriver(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">No. HP Supir:</label>
                  <input
                    type="text"
                    value={vehPhone}
                    onChange={(e) => setVehPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Tara Standar (Kg):</label>
                  <input
                    type="number"
                    value={vehTare}
                    onChange={(e) => setVehTare(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kapasitas Maksimal (Kg):</label>
                  <input
                    type="number"
                    value={vehCap}
                    onChange={(e) => setVehCap(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Status Kepemilikan:</label>
                <select
                  value={vehOwnership}
                  onChange={(e) => setVehOwnership(e.target.value as Vehicle['ownership'])}
                  className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                >
                  <option value="INTERNAL">Armada Internal Ramp / Milik Sendiri</option>
                  <option value="EXPEDITION">Ekspedisi Sewa Pihak Ketiga</option>
                  <option value="SUPPLIER">Truk Milik Petani / Langganan</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Simpan Armada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
