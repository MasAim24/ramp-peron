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
  UserCheck 
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
  const { companySettings, scaleConfig, isSimulatorActive, records } = useApp();
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
    <header className="bg-zinc-900 border-b border-zinc-800 select-none">
      {/* Top Corporate Status Bar */}
      <div className="px-4 py-2 bg-zinc-950 flex flex-wrap items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{companySettings.weighbridgeCode}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 font-mono">KAPASITAS {(companySettings.maxBridgeCapacityKg / 1000)} TON</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>PORT: {scaleConfig.comPort}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{scaleConfig.indicatorModel}</span>
            {isSimulatorActive && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-semibold ml-1">
                SIMULATOR
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Operator: <strong className="text-zinc-200">{companySettings.weighmasterName}</strong></span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{currentTime}</span>
          </div>
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
              <h1 className="font-bold text-sm tracking-wide text-zinc-100 uppercase">{companySettings.name}</h1>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                ENTERPRISE V1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-[260px] sm:max-w-md">
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
                    ? 'bg-zinc-800 text-emerald-400 border border-zinc-700/80 shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold ml-0.5">
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
