import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { WeighbridgeView } from './views/WeighbridgeView';
import { MillReconciliationView } from './views/MillReconciliationView';
import { CashierView } from './views/CashierView';
import { PriceBoardView } from './views/PriceBoardView';
import { MasterDataView } from './views/MasterDataView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('weighbridge');
  const { companySettings } = useApp();

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('weighbridge');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('reconciliation');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('cashier');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('pricing');
      } else if (e.key === 'F5') {
        // allow browser refresh
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('reports');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Corporate Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-12">
        {activeTab === 'weighbridge' && <WeighbridgeView />}
        {activeTab === 'reconciliation' && <MillReconciliationView />}
        {activeTab === 'cashier' && <CashierView />}
        {activeTab === 'pricing' && <PriceBoardView />}
        {activeTab === 'master' && <MasterDataView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Bottom Status / Keyboard Shortcuts Legend Bar */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2 select-none no-print shadow-2xs transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Shortcut Cepat:</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            [F1] Timbangan
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            [F2] Kirim PKS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            [F3] Kasir
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            [F4] Harga TBS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
            [F6] Laporan
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span>{companySettings.licenseNumber}</span>
          <span>&bull;</span>
          <span>Sistem Jembatan Timbang & Ramp Peron Sawit Enterprise</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
