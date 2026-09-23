// Audio feedback for industrial weighbridge indicator lock
export const playBuzzerSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    // Audio might be restricted until user gesture, ignore safely
  }
};

export interface VehiclePreset {
  label: string;
  category: 'EMPTY' | 'LOADED' | 'ZERO';
  nominalKg: number;
}

export const SCALE_PRESETS: VehiclePreset[] = [
  { label: 'Platform Kosong (0 kg)', category: 'ZERO', nominalKg: 0 },
  { label: 'Colt Diesel Kosong (Tara ~3,420 kg)', category: 'EMPTY', nominalKg: 3420 },
  { label: 'Dump Truck Kosong (Tara ~4,250 kg)', category: 'EMPTY', nominalKg: 4250 },
  { label: 'Tronton Kosong (Tara ~8,900 kg)', category: 'EMPTY', nominalKg: 8900 },
  { label: 'Colt Diesel Muat TBS (~11,500 kg)', category: 'LOADED', nominalKg: 11500 },
  { label: 'Colt Diesel Muatan Berat (~13,200 kg)', category: 'LOADED', nominalKg: 13200 },
  { label: 'Dump Truck Muat TBS (~17,800 kg)', category: 'LOADED', nominalKg: 17800 },
  { label: 'Tronton Muat TBS Pabrik (~28,500 kg)', category: 'LOADED', nominalKg: 28500 }
];
