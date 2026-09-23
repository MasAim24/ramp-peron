import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Cpu, 
  Save, 
  RotateCcw, 
  Check, 
  Monitor, 
  Printer, 
  ShieldCheck, 
  Radio, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompanySettings, ScaleConfig } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    companySettings, 
    scaleConfig, 
    updateCompanySettings, 
    updateScaleConfig, 
    resetAllData,
    theme,
    setTheme
  } = useApp();

  const [companyForm, setCompanyForm] = useState<CompanySettings>(companySettings);
  const [scaleForm, setScaleForm] = useState<ScaleConfig>(scaleConfig);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const isDesktopElectron = typeof window !== 'undefined' && !!(window as unknown as { electronAPI?: unknown }).electronAPI;

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(companyForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveScale = (e: React.FormEvent) => {
    e.preventDefault();
    updateScaleConfig(scaleForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-5">
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-500 rounded-xl text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Pengaturan sistem dan parameter jembatan timbang berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Company & Weighbridge Legal Profile (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
            <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  Profil Ramp Peron & Legalitas Jembatan Timbang
                </h2>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Perusahaan / Ramp:</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Slogan / Keterangan Usaha:</label>
                  <input
                    type="text"
                    value={companyForm.tagline}
                    onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Legalitas & Sertifikasi Tera Metrologi:</label>
                <input
                  type="text"
                  required
                  value={companyForm.licenseNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Alamat Jembatan Timbang:</label>
                  <input
                    type="text"
                    required
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">No. Telepon / Hotline:</label>
                  <input
                    type="text"
                    required
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kecamatan:</label>
                  <input
                    type="text"
                    value={companyForm.district}
                    onChange={(e) => setCompanyForm({ ...companyForm, district: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kabupaten:</label>
                  <input
                    type="text"
                    value={companyForm.regency}
                    onChange={(e) => setCompanyForm({ ...companyForm, regency: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Provinsi:</label>
                  <input
                    type="text"
                    value={companyForm.province}
                    onChange={(e) => setCompanyForm({ ...companyForm, province: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kode Identitas Timbangan:</label>
                  <input
                    type="text"
                    value={companyForm.weighbridgeCode}
                    onChange={(e) => setCompanyForm({ ...companyForm, weighbridgeCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Kapasitas Maksimal Jembatan (Kg):</label>
                  <input
                    type="number"
                    value={companyForm.maxBridgeCapacityKg}
                    onChange={(e) => setCompanyForm({ ...companyForm, maxBridgeCapacityKg: parseInt(e.target.value, 10) || 60000 })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-emerald-700 dark:text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Operator Timbang (Shift):</label>
                  <input
                    type="text"
                    value={companyForm.weighmasterName}
                    onChange={(e) => setCompanyForm({ ...companyForm, weighmasterName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Nama Kasir Keuangan:</label>
                  <input
                    type="text"
                    value={companyForm.cashierName}
                    onChange={(e) => setCompanyForm({ ...companyForm, cashierName: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Catatan Kaki Tiket Timbang (Footer):</label>
                <input
                  type="text"
                  value={companyForm.ticketFooterNote}
                  onChange={(e) => setCompanyForm({ ...companyForm, ticketFooterNote: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 text-[11px]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil Perusahaan & Timbangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Theme Toggle, Digital Scale RS-232 & Hardware Config (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Theme Mode Selector Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs space-y-3 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <h3 className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">
                Tema Antarmuka (Light / Dark Mode)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Mode Terang (Light)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>Mode Gelap (Dark)</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Kontras warna telah dioptimalkan sesuai standar WCAG AA $\ge 4.5:1$ agar angka timbangan dan laporan terbaca jelas di bawah terik matahari maupun malam hari.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs transition-colors">
            <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  Koneksi Serial RS-232 Indikator Timbangan
                </h2>
              </div>
            </div>

            <form onSubmit={handleSaveScale} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Port Serial / COM:</label>
                <select
                  value={scaleForm.comPort}
                  onChange={(e) => setScaleForm({ ...scaleForm, comPort: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                >
                  <option value="COM1">COM1 (Standard Motherboard Serial)</option>
                  <option value="COM2">COM2</option>
                  <option value="COM3">COM3 (USB to RS-232 Converter)</option>
                  <option value="COM4">COM4</option>
                  <option value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux USB-Serial)</option>
                  <option value="/dev/ttyS0">/dev/ttyS0 (Linux Native Serial)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Protokol Indikator Timbangan:</label>
                <select
                  value={scaleForm.indicatorModel}
                  onChange={(e) => setScaleForm({ ...scaleForm, indicatorModel: e.target.value as ScaleConfig['indicatorModel'] })}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                >
                  <option value="YAOHUA_XK3190">Yaohua XK3190-A9 / A12 Series (Paling Umum di Peron Sawit)</option>
                  <option value="TOLEDO_8142">Mettler Toledo Panther / 8142 Industrial</option>
                  <option value="CAS_CI5010">CAS CI-5010A / CI-2001 Series</option>
                  <option value="AVERY_BERKEL">Avery Berkel E1005 / E1205</option>
                  <option value="CUSTOM_RS232">Generic Continuous ASCII Stream (RS-232)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Baud Rate:</label>
                  <select
                    value={scaleForm.baudRate}
                    onChange={(e) => setScaleForm({ ...scaleForm, baudRate: parseInt(e.target.value, 10) })}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-200 font-mono"
                  >
                    <option value="2400">2400 bps</option>
                    <option value="4800">4800 bps</option>
                    <option value="9600">9600 bps (Standar)</option>
                    <option value="19200">19200 bps</option>
                    <option value="115200">115200 bps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">Data Bits / Parity:</label>
                  <input
                    type="text"
                    disabled
                    value="8 Data Bits, None Parity, 1 Stop"
                    className="w-full px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scaleForm.isSimulationActive}
                    onChange={(e) => setScaleForm({ ...scaleForm, isSimulationActive: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">Aktifkan Virtual Scale Simulator</span>
                </label>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Memungkinkan pengujian alur timbangan tanpa alat fisik RS-232 terhubung (tombol preset beban truk).
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi Indikator</span>
                </button>
              </div>
            </form>
          </div>

          {/* Desktop App Status & Packaging Info */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs space-y-2.5 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">
                Status Aplikasi Desktop (Electron Ready)
              </h3>
            </div>

            <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Environment Mode:</span>
                <span className={`font-mono font-bold ${isDesktopElectron ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {isDesktopElectron ? 'DESKTOP APP (ELECTRON NATIVE)' : 'WEB & PWA PREVIEW MODE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Framework Stack:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">React 19 &bull; TS &bull; Tailwind v4 &bull; Vite 8</span>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-500 text-[11px]">Database Reset:</span>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke data demo simulasi awal?')) {
                    resetAllData();
                    window.location.reload();
                  }
                }}
                className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-950 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-300 text-[11px] font-semibold border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
              >
                Reset ke Data Demo Awal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
