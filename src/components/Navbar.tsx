import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Truck, 
  Wallet, 
  TrendingUp, 
  Database, 
  FileSpreadsheet, 
  Settings, 
  Radio, 
  Clock, 
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab = 
  | 'weighbridge' 
  | 'reconciliation' 
  | 'cashier' 
  | 'pricing' 
  | 'master' 
  | 'reports' 
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    companySettings, 
    scaleConfig, 
    isSimulatorActive, 
    records,
    theme,
    toggleTheme
  } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now)
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingTaraCount = records.filter(r => r.status === 'TARA_PENDING').length;
  const pendingPaymentCount = records.filter(r => r.status === 'COMPLETED' && r.paymentStatus === 'PENDING').length;

  const navItems = [
    { id: 'weighbridge' as ActiveTab, label: 'Jembatan Timbang', icon: Scale, badge: pendingTaraCount },
    { id: 'reconciliation' as ActiveTab, label: 'Pengiriman PKS', icon: Truck, badge: 0 },
    { id: 'cashier' as ActiveTab, label: 'Kasir & Kasbon', icon: Wallet, badge: pendingPaymentCount },
    { id: 'pricing' as ActiveTab, label: 'Papan Harga', icon: TrendingUp, badge: 0 },
    { id: 'master' as ActiveTab, label: 'Master Data', icon: Database, badge: 0 },
    { id: 'reports' as ActiveTab, label: 'Laporan & Audit', icon: FileSpreadsheet, badge: 0 },
    { id: 'settings' as ActiveTab, label: 'Sistem & Hardware', icon: Settings, badge: 0 }
  ];

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none shadow-sm transition-colors">
      {/* Top Corporate Status Bar */}
      <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-950 flex flex-wrap items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/80 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{companySettings.weighbridgeCode}</span>
            <span className="text-zinc-400 dark:text-zinc-600">|</span>
            <span className="text-zinc-600 dark:text-zinc-400 font-mono">KAPASITAS {(companySettings.maxBridgeCapacityKg / 1000)} TON</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>PORT: {scaleConfig.comPort}</span>
            <span className="text-zinc-400 dark:text-zinc-600">|</span>
            <span className="text-zinc-500 dark:text-zinc-400">{scaleConfig.indicatorModel}</span>
            {isSimulatorActive && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] rounded font-semibold ml-1">
                SIMULATOR
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Operator: <strong className="text-zinc-900 dark:text-zinc-200">{companySettings.weighmasterName}</strong></span>
          </div>
          
          <div className="hidden md:flex items-center gap-1.5 font-mono text-zinc-600 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>{currentTime}</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark / Light Theme"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 shadow-2xs transition-colors cursor-pointer text-xs font-semibold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Gelap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main App Bar & Navigation */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Corporate Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-md border border-emerald-600">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">{companySettings.name}</h1>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-700">
                ENTERPRISE V1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[260px] sm:max-w-md">
              {companySettings.tagline}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-zinc-700/80 shadow-2xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold ml-0.5">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
