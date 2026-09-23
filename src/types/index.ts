export type TransactionType = 'INBOUND' | 'OUTBOUND';

export type TransactionStatus = 'TARA_PENDING' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID_CASH' | 'PAID_TRANSFER' | 'BON_TEMPO';

export type FruitGrade = 'SUPER' | 'GRADE_A' | 'GRADE_B';

export interface SortationDeductions {
  waterPercent: number;        // Potongan basah/hujan (%)
  longStalkPercent: number;    // Potongan gagang panjang > 2.5cm (%)
  unripePercent: number;       // Potongan buah mentah fraksi 0 (%)
  rottenPercent: number;       // Potongan buah busuk fraksi 4/5 (%)
  abnormalPercent: number;     // Potongan abnormal / tandan kosong (%)
  dirtKg: number;              // Potongan sampah/pasir/batu (Kg tetap)
}

export interface OutboundMillResult {
  millGrossKg: number;
  millTareKg: number;
  millNetKg: number;
  millDeductionPercent: number;
  millDeductionKg: number;
  millAcceptedNetKg: number;   // Netto yang diakui & dibayar oleh PKS
  millPricePerKg: number;      // Harga kontrak jual ke PKS
  shrinkageKg: number;         // Selisih susut = Netto Ramp - Netto PKS
  shrinkagePercent: number;    // % susut
  transportFeePerKg: number;   // Biaya angkut per Kg atau flat
  totalTransportFee: number;   // Total ongkos armada
  grossIncome: number;         // millAcceptedNetKg * millPricePerKg
  estimatedCostOfGoods: number;// Biaya beli TBS di Ramp
  netMargin: number;           // grossIncome - (estimatedCostOfGoods + totalTransportFee)
  isSettled: boolean;          // Apakah pembayaran dari PKS sudah cair
  settledAt?: string;
  notes?: string;
}

export interface WeighingRecord {
  id: string;
  ticketNumber: string;        // e.g. TK-20260923-001
  type: TransactionType;       // INBOUND (Beli Petani) atau OUTBOUND (Kirim PKS)
  vehiclePlate: string;        // Nopol Truk
  driverName: string;
  
  // Inbound relations
  supplierId?: string;
  supplierName?: string;
  supplierCode?: string;
  fruitGrade: FruitGrade;
  
  // Outbound relations
  millId?: string;
  millName?: string;
  millCode?: string;
  spbNumber?: string;          // No Surat Pengantar Buah
  
  // Weighbridge figures
  grossWeight: number;         // Timbang 1 (Kg)
  tareWeight: number;          // Timbang 2 (Kg)
  netGrossWeight: number;      // Bruto - Tara (Kg)
  
  // Sortation (khusus Inbound)
  sortation: SortationDeductions;
  totalDeductionPercent: number;
  totalDeductionKg: number;
  netCleanWeight: number;      // Netto Diterima / Netto Bersih (Kg)
  
  // Financials
  pricePerKg: number;          // Harga Satuan (Rp/Kg)
  grossAmount: number;         // Netto Bersih * Harga Satuan (Rp)
  loanDeduction: number;       // Potong Kasbon Petani (Rp)
  loadingFeeDeduction: number; // Biaya Bongkar Muat (Rp) jika ditanggung petani
  netPayable: number;          // Total Bersih yang Diterima Petani (Rp)
  
  // Timestamps & Master
  timestampGross: string;      // ISO String saat timbang Bruto
  timestampTare?: string;      // ISO String saat timbang Tara
  weighmaster: string;         // Operator Timbang
  notes?: string;
  
  // Status
  status: TransactionStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: 'CASH' | 'TRANSFER' | 'BON';
  paidBy?: string;
  
  // Outbound reconciliation (khusus OUTBOUND saat truk balik dari PKS)
  millResult?: OutboundMillResult;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  nik: string;
  phone: string;
  location: string;
  landAreaHa: number;
  palmAgeYears: number;
  variety: string;
  bankName: string;
  bankAccount: string;
  debtBalance: number;         // Saldo pinjaman / kasbon aktif
  defaultGrade: FruitGrade;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export interface PalmOilMill {
  id: string;
  code: string;
  name: string;
  address: string;
  distanceKm: number;
  contactPerson: string;
  phone: string;
  contractPricePerKg: number;
  maxDailyCapacityTon: number;
  paymentTerms: string;        // e.g. "Net 3 Hari Kerja", "Cash On Delivery"
  toleranceShrinkPercent: number; // e.g. 0.5%
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'COLT_DIESEL' | 'TRONTON' | 'DUMP_TRUCK' | 'PICKUP';
  driverName: string;
  driverPhone: string;
  tareAverageKg: number;
  maxCapacityKg: number;
  ownership: 'INTERNAL' | 'EXPEDITION' | 'SUPPLIER';
}

export interface DailyPriceBoard {
  id: string;
  date: string;
  priceSuper: number;          // Usia > 10 tahun
  priceGradeA: number;         // Usia 5 - 10 tahun
  priceGradeB: number;         // Usia 3 - 5 tahun
  targetMillPrice: number;     // Harga acuan PKS utama
  spreadMargin: number;        // Estimasi margin peron per Kg
  updatedAt: string;
  updatedBy: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  category: 'MODAL_KASIR' | 'PEMBAYARAN_TBS' | 'KASBON_PETANI' | 'PELUNASAN_KASBON' | 'OPERASIONAL' | 'BBM_SOLAR' | 'PENERIMAAN_PKS';
  amount: number;
  description: string;
  referenceTicket?: string;
  supplierId?: string;
  handledBy: string;
}

export interface ScaleConfig {
  comPort: string;
  baudRate: number;
  dataBits: number;
  parity: 'none' | 'even' | 'odd';
  stopBits: number;
  indicatorModel: 'TOLEDO_8142' | 'YAOHUA_XK3190' | 'CAS_CI5010' | 'AVERY_BERKEL' | 'CUSTOM_RS232';
  isSimulationActive: boolean;
  stabilizeTimeMs: number;
  weightUnit: 'kg';
}

export interface CompanySettings {
  name: string;
  tagline: string;
  licenseNumber: string;
  address: string;
  district: string;
  regency: string;
  province: string;
  phone: string;
  weighbridgeCode: string;
  maxBridgeCapacityKg: number;
  weighmasterName: string;
  cashierName: string;
  ticketFooterNote: string;
}
