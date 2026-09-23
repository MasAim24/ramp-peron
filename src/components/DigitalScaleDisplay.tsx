import React, { useState } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Sliders, 
  Volume2, 
  ArrowDownToLine 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../utils/formatters';
import { SCALE_PRESETS, playBuzzerSound } from '../utils/scaleSimulator';

interface DigitalScaleDisplayProps {
  onCaptureWeight?: (weightKg: number) => void;
  targetInputLabel?: string;
}

export const DigitalScaleDisplay: React.FC<DigitalScaleDisplayProps> = ({ 
  onCaptureWeight,
  targetInputLabel = 'Form Aktif'
}) => {
  const { 
    liveWeight, 
    isScaleStable, 
    isZero, 
    zeroScale, 
    isSimulatorActive, 
    triggerScalePreset,
    setLiveWeight,
    scaleConfig,
    companySettings
  } = useApp();

  const [customWeightInput, setCustomWeightInput] = useState<string>('');
  const [showSimulatorPanel, setShowSimulatorPanel] = useState<boolean>(true);

  const handleCapture = () => {
    playBuzzerSound();
    if (onCaptureWeight) {
      onCaptureWeight(liveWeight);
    }
  };

  const handleApplyCustomWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customWeightInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      triggerScalePreset(parsed);
      setCustomWeightInput('');
    }
  };

  const isOverload = liveWeight > companySettings.maxBridgeCapacityKg;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
      {/* Top Terminal Header */}
      <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300 tracking-wider font-mono">DIGITAL INDICATOR</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] border border-zinc-800">
            {scaleConfig.indicatorModel}
          </span>
          <span className="text-zinc-600 font-mono text-[11px] hidden sm:inline">
            RS-232 / 9600-8-N-1
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimulatorPanel(prev => !prev)}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            <span>{showSimulatorPanel ? 'Sembunyikan Panel Uji' : 'Panel Uji Timbangan'}</span>
          </button>
        </div>
      </div>

      {/* Main Digital Display Chamber */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-zinc-950 to-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: LCD Digits & Status Flags */}
        <div className="w-full md:w-auto flex-1">
          <div className="bg-black/80 rounded-lg p-3 sm:p-4 border border-zinc-800 shadow-inner flex flex-col justify-between">
            {/* Status Flags Row */}
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-zinc-800/60 pb-2 mb-2">
              <div className="flex items-center gap-3">
                {/* Stable LED */}
                <span className={`inline-flex items-center gap-1 font-bold ${
                  isScaleStable ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isScaleStable ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  {isScaleStable ? 'STABLE' : 'MOTION'}
                </span>

                {/* Zero LED */}
                <span className={`inline-flex items-center gap-1 ${
                  isZero ? 'text-emerald-400 font-bold' : 'text-zinc-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isZero ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
                  ZERO
                </span>

                {/* Gross / Net */}
                <span className="text-zinc-400 font-semibold">
                  {liveWeight > 0 ? 'GROSS' : 'IDLE'}
                </span>
              </div>

              {isOverload && (
                <span className="flex items-center gap-1 text-rose-400 font-bold animate-bounce">
                  <AlertCircle className="w-3.5 h-3.5" /> OVERLOAD &gt; {companySettings.maxBridgeCapacityKg / 1000}T
                </span>
              )}
            </div>

            {/* Massive Digital Number Display */}
            <div className="flex items-baseline justify-between select-all">
              <div className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono ${
                isOverload 
                  ? 'text-rose-500' 
                  : isScaleStable 
                    ? 'text-emerald-400 digital-lcd' 
                    : 'text-amber-400 digital-lcd-amber'
              }`}>
                {formatNumber(liveWeight)}
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-500 ml-4">
                KG
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-row md:flex-col items-center gap-2.5 w-full md:w-auto">
          {/* Lock / Ambil Berat Button */}
          <button
            onClick={handleCapture}
            disabled={!isScaleStable}
            className={`w-full md:w-48 px-4 py-3 rounded-lg font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isScaleStable 
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white border border-emerald-500' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 translate-x-[0.5px]" />
            <span>AMBIL BERAT</span>
          </button>

          {/* Zero Button */}
          <button
            onClick={zeroScale}
            className="w-full md:w-48 px-3 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NOLKAN (ZERO)</span>
          </button>
        </div>
      </div>

      {/* Simulator Toolbar (Collapsible) */}
      {showSimulatorPanel && (
        <div className="p-3 bg-zinc-950/70 border-t border-zinc-800/80 text-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulasi Uji Berat Platform (Klik untuk menempatkan truk di jembatan timbang):</span>
            </span>
            <span className="text-[11px] text-zinc-500">Target input: <strong className="text-zinc-300">{targetInputLabel}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
            {SCALE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => triggerScalePreset(preset.nominalKg)}
                className={`px-2 py-1.5 rounded text-[11px] text-left border transition-all truncate cursor-pointer ${
                  liveWeight === preset.nominalKg
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 font-semibold'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Manual Weight Input Form */}
          <form onSubmit={handleApplyCustomWeight} className="flex items-center gap-2 pt-1 border-t border-zinc-800/40">
            <span className="text-zinc-500 text-[11px] whitespace-nowrap">Input Manual Beban Uji:</span>
            <input
              type="number"
              placeholder="Contoh: 12450"
              value={customWeightInput}
              onChange={(e) => setCustomWeightInput(e.target.value)}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 text-xs w-32 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-medium cursor-pointer"
            >
              Terapkan Beban
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
