import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WeighingRecord, 
  Supplier, 
  PalmOilMill, 
  Vehicle, 
  DailyPriceBoard, 
  CashTransaction, 
  ScaleConfig, 
  CompanySettings, 
  SortationDeductions, 
  OutboundMillResult 
} from '../types';
import { 
  initialCompanySettings, 
  initialPriceBoard, 
  initialSuppliers, 
  initialMills, 
  initialVehicles, 
  initialWeighingRecords, 
  initialCashTransactions, 
  initialScaleConfig 
} from '../data/mockData';
import { calculateInboundWeighing, generateTicketNumber } from '../utils/formatters';
import { playBuzzerSound } from '../utils/scaleSimulator';

interface AppContextType {
  // Master & Transaction States
  records: WeighingRecord[];
  suppliers: Supplier[];
  mills: PalmOilMill[];
  vehicles: Vehicle[];
  priceBoard: DailyPriceBoard;
  cashTransactions: CashTransaction[];
  scaleConfig: ScaleConfig;
  companySettings: CompanySettings;

  // Live Digital Scale State
  liveWeight: number;
  isScaleStable: boolean;
  isZero: boolean;
  isSimulatorActive: boolean;
  setLiveWeight: (weight: number) => void;
  zeroScale: () => void;
  toggleSimulator: (active: boolean) => void;
  triggerScalePreset: (weight: number) => void;

  // Transaction Actions
  createInboundRecord: (record: Partial<WeighingRecord>) => WeighingRecord;
  completeInboundTare: (
    recordId: string, 
    tareKg: number, 
    sortation: SortationDeductions, 
    loanDeduction?: number,
    loadingFeeDeduction?: number,
    notes?: string
  ) => void;
  createOutboundRecord: (record: Partial<WeighingRecord>) => WeighingRecord;
  settleOutboundAtMill: (recordId: string, millResult: OutboundMillResult) => void;
  cancelRecord: (recordId: string, reason: string) => void;
  processPayment: (
    recordId: string, 
    method: 'CASH' | 'TRANSFER' | 'BON', 
    loanDeduct?: number, 
    notes?: string
  ) => void;

  // Master Data Actions
  saveSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  saveMill: (mill: PalmOilMill) => void;
  deleteMill: (id: string) => void;
  saveVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  updatePriceBoard: (prices: Partial<DailyPriceBoard>) => void;
  addCashTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  updateScaleConfig: (config: ScaleConfig) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'AGROSCALE_ENTERPRISE_STATE_V1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from local storage or defaults
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const [records, setRecords] = useState<WeighingRecord[]>(() => loadStored('records', initialWeighingRecords));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStored('suppliers', initialSuppliers));
  const [mills, setMills] = useState<PalmOilMill[]>(() => loadStored('mills', initialMills));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadStored('vehicles', initialVehicles));
  const [priceBoard, setPriceBoard] = useState<DailyPriceBoard>(() => loadStored('prices', initialPriceBoard));
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => loadStored('cash', initialCashTransactions));
  const [scaleConfig, setScaleConfig] = useState<ScaleConfig>(() => loadStored('scale', initialScaleConfig));
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => loadStored('company', initialCompanySettings));

  // Live scale reading simulation
  const [liveWeight, setLiveWeightState] = useState<number>(0);
  const [isScaleStable, setIsScaleStable] = useState<boolean>(true);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(scaleConfig.isSimulationActive);
  const isZero = liveWeight === 0;

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_records`, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_mills`, JSON.stringify(mills));
  }, [mills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prices`, JSON.stringify(priceBoard));
  }, [priceBoard]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cash`, JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_scale`, JSON.stringify(scaleConfig));
  }, [scaleConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_company`, JSON.stringify(companySettings));
  }, [companySettings]);

  // Live Simulator Engine: simulates realistic platform vibration when truck moves or stabilizes
  const triggerScalePreset = (targetWeight: number) => {
    setIsScaleStable(false);
    
    // Quick random fluctuations before settling
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const fluctuation = targetWeight > 0 ? (Math.random() - 0.5) * 60 : 0;
      setLiveWeightState(Math.max(0, Math.round(targetWeight + fluctuation)));

      if (step >= 4) {
        clearInterval(interval);
        setLiveWeightState(targetWeight);
        setIsScaleStable(true);
        playBuzzerSound();
      }
    }, 200);
  };

  const zeroScale = () => {
    setIsScaleStable(false);
    setTimeout(() => {
      setLiveWeightState(0);
      setIsScaleStable(true);
      playBuzzerSound();
    }, 300);
  };

  const toggleSimulator = (active: boolean) => {
    setIsSimulatorActive(active);
    setScaleConfig(prev => ({ ...prev, isSimulationActive: active }));
  };

  const setLiveWeight = (weight: number) => {
    setLiveWeightState(weight);
  };

  // Transaction Creation & Completion
  const createInboundRecord = (data: Partial<WeighingRecord>): WeighingRecord => {
    const ticketNumber = generateTicketNumber(records.length, 'TK');
    const gross = data.grossWeight || 0;
    const tare = data.tareWeight || 0;
    const sortation = data.sortation || {
      waterPercent: 0,
      longStalkPercent: 0,
      unripePercent: 0,
      rottenPercent: 0,
      abnormalPercent: 0,
      dirtKg: 0
    };

    const calc = calculateInboundWeighing(
      gross,
      tare,
      sortation,
      data.pricePerKg || priceBoard.priceGradeA,
      data.loanDeduction || 0,
      data.loadingFeeDeduction || 0
    );

    const isComplete = tare > 0;

    const newRecord: WeighingRecord = {
      id: `REC-${Date.now()}`,
      ticketNumber,
      type: 'INBOUND',
      vehiclePlate: data.vehiclePlate || '',
      driverName: data.driverName || '',
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      supplierCode: data.supplierCode,
      fruitGrade: data.fruitGrade || 'GRADE_A',
      grossWeight: gross,
      tareWeight: tare,
      netGrossWeight: calc.netGross,
      sortation,
      totalDeductionPercent: calc.totalPercentDeduction,
      totalDeductionKg: calc.totalDeductionKg,
      netCleanWeight: calc.netCleanWeight,
      pricePerKg: data.pricePerKg || priceBoard.priceGradeA,
      grossAmount: calc.grossAmount,
      loanDeduction: data.loanDeduction || 0,
      loadingFeeDeduction: data.loadingFeeDeduction || 0,
      netPayable: calc.netPayable,
      timestampGross: new Date().toISOString(),
      timestampTare: isComplete ? new Date().toISOString() : undefined,
      weighmaster: companySettings.weighmasterName,
      status: isComplete ? 'COMPLETED' : 'TARA_PENDING',
      paymentStatus: 'PENDING',
      notes: data.notes || ''
    };

    setRecords(prev => [newRecord, ...prev]);
    playBuzzerSound();
    return newRecord;
  };

  const completeInboundTare = (
    recordId: string, 
    tareKg: number, 
    sortation: SortationDeductions, 
    loanDeduction: number = 0,
    loadingFeeDeduction: number = 0,
    notes?: string
  ) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id !== recordId) return rec;

      const calc = calculateInboundWeighing(
        rec.grossWeight,
        tareKg,
        sortation,
        rec.pricePerKg,
        loanDeduction,
        loadingFeeDeduction
      );

      return {
        ...rec,
        tareWeight: tareKg,
        netGrossWeight: calc.netGross,
        sortation,
        totalDeductionPercent: calc.totalPercentDeduction,
        totalDeductionKg: calc.totalDeductionKg,
        netCleanWeight: calc.netCleanWeight,
        grossAmount: calc.grossAmount,
        loanDeduction,
        loadingFeeDeduction,
        netPayable: calc.netPayable,
        timestampTare: new Date().toISOString(),
        status: 'COMPLETED',
        notes: notes !== undefined ? notes : rec.notes
      };
    }));
    playBuzzerSound();
  };

  const createOutboundRecord = (data: Partial<WeighingRecord>): WeighingRecord => {
    const spbNumber = generateTicketNumber(records.filter(r => r.type === 'OUTBOUND').length, 'SPB');
    const ticketNumber = generateTicketNumber(records.length, 'TK-OUT');
    const gross = data.grossWeight || 0;
    const tare = data.tareWeight || 0;
    const netGross = Math.max(0, gross - tare);

    const price = data.pricePerKg || priceBoard.targetMillPrice;
    const grossAmount = netGross * price;

    const newRecord: WeighingRecord = {
      id: `REC-${Date.now()}`,
      ticketNumber,
      spbNumber,
      type: 'OUTBOUND',
      vehiclePlate: data.vehiclePlate || '',
      driverName: data.driverName || '',
      millId: data.millId,
      millName: data.millName,
      millCode: data.millCode,
      fruitGrade: 'SUPER',
      grossWeight: gross,
      tareWeight: tare,
      netGrossWeight: netGross,
      sortation: { waterPercent: 0, longStalkPercent: 0, unripePercent: 0, rottenPercent: 0, abnormalPercent: 0, dirtKg: 0 },
      totalDeductionPercent: 0,
      totalDeductionKg: 0,
      netCleanWeight: netGross,
      pricePerKg: price,
      grossAmount,
      loanDeduction: 0,
      loadingFeeDeduction: 0,
      netPayable: grossAmount,
      timestampGross: new Date().toISOString(),
      timestampTare: new Date().toISOString(),
      weighmaster: companySettings.weighmasterName,
      status: 'COMPLETED',
      paymentStatus: 'BON_TEMPO',
      notes: data.notes || `Pengiriman TBS ke ${data.millName || 'PKS'}`
    };

    setRecords(prev => [newRecord, ...prev]);
    playBuzzerSound();
    return newRecord;
  };

  const settleOutboundAtMill = (recordId: string, millResult: OutboundMillResult) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id !== recordId) return rec;
      return {
        ...rec,
        millResult: {
          ...millResult,
          isSettled: true,
          settledAt: new Date().toISOString()
        }
      };
    }));
  };

  const cancelRecord = (recordId: string, reason: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id !== recordId) return rec;
      return {
        ...rec,
        status: 'CANCELLED',
        notes: `${rec.notes ? rec.notes + ' | ' : ''}DIBATALKAN: ${reason}`
      };
    }));
  };

  const processPayment = (
    recordId: string, 
    method: 'CASH' | 'TRANSFER' | 'BON', 
    loanDeduct: number = 0, 
    notes?: string
  ) => {
    let targetRecord: WeighingRecord | undefined;

    setRecords(prev => prev.map(rec => {
      if (rec.id !== recordId) return rec;
      targetRecord = rec;
      const statusMap = {
        CASH: 'PAID_CASH' as const,
        TRANSFER: 'PAID_TRANSFER' as const,
        BON: 'BON_TEMPO' as const
      };

      return {
        ...rec,
        paymentStatus: statusMap[method],
        paymentMethod: method,
        paymentDate: new Date().toISOString(),
        paidBy: companySettings.cashierName,
        loanDeduction: loanDeduct,
        netPayable: Math.max(0, rec.grossAmount - loanDeduct - rec.loadingFeeDeduction),
        notes: notes || rec.notes
      };
    }));

    // Record cash transactions if paid in cash
    if (targetRecord && method === 'CASH') {
      const payable = Math.max(0, targetRecord.grossAmount - loanDeduct - targetRecord.loadingFeeDeduction);
      
      const newCashOut: CashTransaction = {
        id: `CSH-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'OUT',
        category: 'PEMBAYARAN_TBS',
        amount: payable,
        description: `Bayar Tunai Tiket ${targetRecord.ticketNumber} (${targetRecord.supplierName || 'Petani'})`,
        referenceTicket: targetRecord.ticketNumber,
        supplierId: targetRecord.supplierId,
        handledBy: companySettings.cashierName
      };

      setCashTransactions(prev => [newCashOut, ...prev]);

      // If there was a loan deduction, record it as cash in (loan settled) and update supplier debt
      if (loanDeduct > 0 && targetRecord.supplierId) {
        const newCashIn: CashTransaction = {
          id: `CSH-${Date.now() + 1}`,
          date: new Date().toISOString(),
          type: 'IN',
          category: 'PELUNASAN_KASBON',
          amount: loanDeduct,
          description: `Potong Kasbon Petani via Tiket ${targetRecord.ticketNumber}`,
          referenceTicket: targetRecord.ticketNumber,
          supplierId: targetRecord.supplierId,
          handledBy: companySettings.cashierName
        };
        setCashTransactions(prev => [newCashIn, ...prev]);

        setSuppliers(prev => prev.map(s => {
          if (s.id !== targetRecord?.supplierId) return s;
          return {
            ...s,
            debtBalance: Math.max(0, s.debtBalance - loanDeduct)
          };
        }));
      }
    }
  };

  // Master Data Methods
  const saveSupplier = (supplier: Supplier) => {
    setSuppliers(prev => {
      const exists = prev.some(s => s.id === supplier.id);
      if (exists) {
        return prev.map(s => s.id === supplier.id ? supplier : s);
      }
      return [supplier, ...prev];
    });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const saveMill = (mill: PalmOilMill) => {
    setMills(prev => {
      const exists = prev.some(m => m.id === mill.id);
      if (exists) {
        return prev.map(m => m.id === mill.id ? mill : m);
      }
      return [mill, ...prev];
    });
  };

  const deleteMill = (id: string) => {
    setMills(prev => prev.filter(m => m.id !== id));
  };

  const saveVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => {
      const exists = prev.some(v => v.id === vehicle.id);
      if (exists) {
        return prev.map(v => v.id === vehicle.id ? vehicle : v);
      }
      return [vehicle, ...prev];
    });
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const updatePriceBoard = (prices: Partial<DailyPriceBoard>) => {
    setPriceBoard(prev => ({
      ...prev,
      ...prices,
      updatedAt: new Date().toISOString()
    }));
  };

  const addCashTransaction = (tx: Omit<CashTransaction, 'id'>) => {
    const newTx: CashTransaction = {
      ...tx,
      id: `CSH-${Date.now()}`
    };
    setCashTransactions(prev => [newTx, ...prev]);

    // If it's a new loan given to supplier, increase supplier debt
    if (tx.category === 'KASBON_PETANI' && tx.supplierId) {
      setSuppliers(prev => prev.map(s => {
        if (s.id !== tx.supplierId) return s;
        return {
          ...s,
          debtBalance: s.debtBalance + tx.amount
        };
      }));
    }
  };

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings);
  };

  const updateScaleConfig = (config: ScaleConfig) => {
    setScaleConfig(config);
    setIsSimulatorActive(config.isSimulationActive);
  };

  const resetAllData = () => {
    setRecords(initialWeighingRecords);
    setSuppliers(initialSuppliers);
    setMills(initialMills);
    setVehicles(initialVehicles);
    setPriceBoard(initialPriceBoard);
    setCashTransactions(initialCashTransactions);
    setScaleConfig(initialScaleConfig);
    setCompanySettings(initialCompanySettings);
    localStorage.clear();
  };

  return (
    <AppContext.Provider value={{
      records,
      suppliers,
      mills,
      vehicles,
      priceBoard,
      cashTransactions,
      scaleConfig,
      companySettings,

      liveWeight,
      isScaleStable,
      isZero,
      isSimulatorActive,
      setLiveWeight,
      zeroScale,
      toggleSimulator,
      triggerScalePreset,

      createInboundRecord,
      completeInboundTare,
      createOutboundRecord,
      settleOutboundAtMill,
      cancelRecord,
      processPayment,

      saveSupplier,
      deleteSupplier,
      saveMill,
      deleteMill,
      saveVehicle,
      deleteVehicle,
      updatePriceBoard,
      addCashTransaction,
      updateCompanySettings,
      updateScaleConfig,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
