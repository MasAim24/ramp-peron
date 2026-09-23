import { 
  Supplier, 
  PalmOilMill, 
  Vehicle, 
  WeighingRecord, 
  DailyPriceBoard, 
  CashTransaction, 
  ScaleConfig, 
  CompanySettings 
} from '../types';

export const initialCompanySettings: CompanySettings = {
  name: 'CV. SAWIT MAKMUR ABADI',
  tagline: 'Peron Pengumpulan TBS & Jembatan Timbang Komersial (Milik Bapak Sameno)',
  licenseNumber: 'NIB: 9120308129482 | TERA METROLOGI: 510.3/DISPERINDAG/2026',
  address: 'Jl. Poros Lintas Sawit Km. 42, Desa Sukamaju',
  district: 'Kecamatan Tapung Hilir',
  regency: 'Kabupaten Kampar',
  province: 'Riau - Indonesia',
  phone: '0812-7654-3210 / 0821-8899-7711',
  weighbridgeCode: 'JT-60T-LINE-01',
  maxBridgeCapacityKg: 60000,
  weighmasterName: 'Bambang Supriyanto',
  cashierName: 'Dewi Lestari',
  ticketFooterNote: 'Barang yang sudah ditimbang dan keluar peron tidak dapat dituntut kembali. Nota timbang sah ditandatangani kedua belah pihak.'
};

export const initialPriceBoard: DailyPriceBoard = {
  id: 'PRC-2026-0923',
  date: '2026-09-23',
  priceSuper: 2820,       // Usia > 10 thn (Rendemen Tinggi)
  priceGradeA: 2750,      // Usia 5 - 10 thn
  priceGradeB: 2620,      // Usia < 5 thn (Tanaman Pasir / Buah Pasir)
  targetMillPrice: 2980,  // Harga Jual Peron ke PKS Tujuan
  spreadMargin: 230,      // Margin Kotor Target Peron (Rp 2.980 - Rp 2.750)
  updatedAt: '2026-09-23T06:30:00Z',
  updatedBy: 'H. Rusli Efendi (Direktur Ramp)',
  status: 'ACTIVE'
};

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    code: 'PET-01',
    name: 'Haji Syamsuddin Siregar',
    nik: '1401081504780002',
    phone: '0813-6521-9988',
    location: 'Desa Bukit Kemuning, Blok B2',
    landAreaHa: 18.5,
    palmAgeYears: 12,
    variety: 'Marihat Unggul DxP',
    bankName: 'Bank BRI',
    bankAccount: '0129-01-049182-50-4',
    debtBalance: 4500000, // Ada kasbon pupuk
    defaultGrade: 'SUPER',
    status: 'ACTIVE',
    joinedDate: '2022-03-15'
  },
  {
    id: 'SUP-002',
    code: 'PET-02',
    name: 'Kelompok Tani Tunas Jaya',
    nik: '1401082207850001',
    phone: '0822-8734-1122',
    location: 'Afdeling IV Sumber Makmur',
    landAreaHa: 45.0,
    palmAgeYears: 8,
    variety: 'Socfindo Lame',
    bankName: 'Bank Mandiri',
    bankAccount: '108-00-1928374-1',
    debtBalance: 0,
    defaultGrade: 'GRADE_A',
    status: 'ACTIVE',
    joinedDate: '2021-08-10'
  },
  {
    id: 'SUP-003',
    code: 'PET-03',
    name: 'Wayan Sudiarta',
    nik: '1401083009890005',
    phone: '0852-7109-4455',
    location: 'Trans SP 2 Sukajadi',
    landAreaHa: 6.0,
    palmAgeYears: 4,
    variety: 'Dami Mas',
    bankName: 'Bank BNI',
    bankAccount: '0821-9918-22',
    debtBalance: 1200000,
    defaultGrade: 'GRADE_B',
    status: 'ACTIVE',
    joinedDate: '2024-01-20'
  },
  {
    id: 'SUP-004',
    code: 'PET-04',
    name: 'KUD Sawit Lestari Mandiri',
    nik: '1401080101700009',
    phone: '0812-7722-6633',
    location: 'Kandis Batang Harapan',
    landAreaHa: 120.0,
    palmAgeYears: 14,
    variety: 'Topaz Rispa',
    bankName: 'Bank Riau Kepri Syariah',
    bankAccount: '112-21-09882-1',
    debtBalance: 0,
    defaultGrade: 'SUPER',
    status: 'ACTIVE',
    joinedDate: '2020-05-12'
  },
  {
    id: 'SUP-005',
    code: 'PET-05',
    name: 'Rahmat Hidayat Tarigan',
    nik: '1401081112830007',
    phone: '0823-9081-5544',
    location: 'Sei Silau KM 12',
    landAreaHa: 11.0,
    palmAgeYears: 7,
    variety: 'Sriwijaya SJ-5',
    bankName: 'Bank BCA',
    bankAccount: '8220-194-001',
    debtBalance: 2500000,
    defaultGrade: 'GRADE_A',
    status: 'ACTIVE',
    joinedDate: '2023-09-01'
  }
];

export const initialMills: PalmOilMill[] = [
  {
    id: 'MILL-01',
    code: 'PKS-TAPUNG',
    name: 'PT. Sawit Sumber Sejahtera (Mill Tapung)',
    address: 'Kawasan Industri Sawit KM 28, Tapung Hulu',
    distanceKm: 24,
    contactPerson: 'Ir. Hendra Kusuma (Manager Timbangan)',
    phone: '0811-7500-1122',
    contractPricePerKg: 2980,
    maxDailyCapacityTon: 600,
    paymentTerms: 'Tempo 3 Hari Kerja (Transfer)',
    toleranceShrinkPercent: 0.6,
    status: 'ACTIVE'
  },
  {
    id: 'MILL-02',
    code: 'PKS-PALM-INDO',
    name: 'PT. Agro Nusantara Perkasa (PKS Bangkinang)',
    address: 'Jl. Raya Bangkinang - Petapahan KM 15',
    distanceKm: 38,
    contactPerson: 'Budi Santoso, ST',
    phone: '0812-6800-4499',
    contractPricePerKg: 3010,
    maxDailyCapacityTon: 900,
    paymentTerms: 'Tempo 2 Hari Kerja (Transfer)',
    toleranceShrinkPercent: 0.5,
    status: 'ACTIVE'
  },
  {
    id: 'MILL-03',
    code: 'PKS-WILMAR-MANDAU',
    name: 'PT. Mandau Sawit Makmur (Mill Duri)',
    address: 'Lintas Riau-Sumut Km 118',
    distanceKm: 65,
    contactPerson: 'Sari Anggraini (Bagian Pembelian TBS)',
    phone: '0821-7000-8811',
    contractPricePerKg: 3040,
    maxDailyCapacityTon: 1200,
    paymentTerms: 'Tempo 5 Hari Kerja',
    toleranceShrinkPercent: 0.8,
    status: 'ACTIVE'
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'VEH-01',
    plateNumber: 'BM 8821 QC',
    type: 'COLT_DIESEL',
    driverName: 'Joko Prabowo',
    driverPhone: '0813-7112-9901',
    tareAverageKg: 3420,
    maxCapacityKg: 9500,
    ownership: 'INTERNAL'
  },
  {
    id: 'VEH-02',
    plateNumber: 'BM 9412 TA',
    type: 'DUMP_TRUCK',
    driverName: 'Agus Salim',
    driverPhone: '0822-8199-3321',
    tareAverageKg: 4250,
    maxCapacityKg: 13000,
    ownership: 'INTERNAL'
  },
  {
    id: 'VEH-03',
    plateNumber: 'BK 8019 YU',
    type: 'COLT_DIESEL',
    driverName: 'Sulaeman',
    driverPhone: '0852-7811-4433',
    tareAverageKg: 3380,
    maxCapacityKg: 9000,
    ownership: 'SUPPLIER'
  },
  {
    id: 'VEH-04',
    plateNumber: 'BM 8102 LK',
    type: 'TRONTON',
    driverName: 'Dedi Kurniawan',
    driverPhone: '0812-7600-2211',
    tareAverageKg: 8900,
    maxCapacityKg: 28000,
    ownership: 'EXPEDITION'
  }
];

export const initialWeighingRecords: WeighingRecord[] = [
  {
    id: 'REC-001',
    ticketNumber: 'TK-20260923-001',
    type: 'INBOUND',
    vehiclePlate: 'BM 8821 QC',
    driverName: 'Joko Prabowo',
    supplierId: 'SUP-001',
    supplierName: 'Haji Syamsuddin Siregar',
    supplierCode: 'PET-01',
    fruitGrade: 'SUPER',
    grossWeight: 11420,
    tareWeight: 3420,
    netGrossWeight: 8000,
    sortation: {
      waterPercent: 1.0,
      longStalkPercent: 1.5,
      unripePercent: 0.5,
      rottenPercent: 0.0,
      abnormalPercent: 0.0,
      dirtKg: 20
    },
    totalDeductionPercent: 3.0,
    totalDeductionKg: 260, // 8000 * 3% (240kg) + 20kg dirt
    netCleanWeight: 7740,
    pricePerKg: 2820,
    grossAmount: 21826800,
    loanDeduction: 1000000, // Bayar cicilan kasbon
    loadingFeeDeduction: 0,
    netPayable: 20826800,
    timestampGross: '2026-09-23T07:15:20',
    timestampTare: '2026-09-23T07:42:11',
    weighmaster: 'Bambang Supriyanto',
    status: 'COMPLETED',
    paymentStatus: 'PAID_CASH',
    paymentDate: '2026-09-23T07:45:00',
    paymentMethod: 'CASH',
    paidBy: 'Dewi Lestari',
    notes: 'Kualitas buah TBS sangat baik, tingkat kematangan optimal.'
  },
  {
    id: 'REC-002',
    ticketNumber: 'TK-20260923-002',
    type: 'INBOUND',
    vehiclePlate: 'BK 8019 YU',
    driverName: 'Sulaeman',
    supplierId: 'SUP-002',
    supplierName: 'Kelompok Tani Tunas Jaya',
    supplierCode: 'PET-02',
    fruitGrade: 'GRADE_A',
    grossWeight: 12850,
    tareWeight: 3380,
    netGrossWeight: 9470,
    sortation: {
      waterPercent: 0.5,
      longStalkPercent: 2.0,
      unripePercent: 1.0,
      rottenPercent: 0.5,
      abnormalPercent: 0.0,
      dirtKg: 30
    },
    totalDeductionPercent: 4.0,
    totalDeductionKg: 408.8,
    netCleanWeight: 9061,
    pricePerKg: 2750,
    grossAmount: 24917750,
    loanDeduction: 0,
    loadingFeeDeduction: 0,
    netPayable: 24917750,
    timestampGross: '2026-09-23T08:10:04',
    timestampTare: '2026-09-23T08:35:19',
    weighmaster: 'Bambang Supriyanto',
    status: 'COMPLETED',
    paymentStatus: 'PAID_TRANSFER',
    paymentDate: '2026-09-23T08:40:00',
    paymentMethod: 'TRANSFER',
    paidBy: 'Dewi Lestari',
    notes: 'Transfer via BRI ke rekening Kelompok Tani.'
  },
  {
    id: 'REC-003',
    ticketNumber: 'TK-20260923-003',
    type: 'OUTBOUND',
    vehiclePlate: 'BM 9412 TA',
    driverName: 'Agus Salim',
    millId: 'MILL-01',
    millName: 'PT. Sawit Sumber Sejahtera (Mill Tapung)',
    millCode: 'PKS-TAPUNG',
    spbNumber: 'SPB-SMA-20260923-01',
    fruitGrade: 'SUPER',
    tareWeight: 4250,
    grossWeight: 17850,
    netGrossWeight: 13600,
    sortation: {
      waterPercent: 0,
      longStalkPercent: 0,
      unripePercent: 0,
      rottenPercent: 0,
      abnormalPercent: 0,
      dirtKg: 0
    },
    totalDeductionPercent: 0,
    totalDeductionKg: 0,
    netCleanWeight: 13600,
    pricePerKg: 2980,
    grossAmount: 40528000,
    loanDeduction: 0,
    loadingFeeDeduction: 0,
    netPayable: 40528000,
    timestampGross: '2026-09-23T09:15:30',
    timestampTare: '2026-09-23T08:50:12',
    weighmaster: 'Bambang Supriyanto',
    status: 'COMPLETED',
    paymentStatus: 'BON_TEMPO',
    notes: 'Pengiriman SPB 01 ke PKS Tapung. Hasil timbang PKS telah dicocokkan.',
    millResult: {
      millGrossKg: 17810,
      millTareKg: 4250,
      millNetKg: 13560,
      millDeductionPercent: 1.5,
      millDeductionKg: 203.4,
      millAcceptedNetKg: 13356.6,
      millPricePerKg: 2980,
      shrinkageKg: 40, // 13600 - 13560 = 40kg susut perjalanan
      shrinkagePercent: 0.29, // 0.29% (di bawah toleransi 0.6%)
      transportFeePerKg: 50,
      totalTransportFee: 680000,
      grossIncome: 39802668,
      estimatedCostOfGoods: 37060000,
      netMargin: 2062668, // Keuntungan bersih peron dari truk ini
      isSettled: false,
      notes: 'Susut 40 Kg (0.29%), sangat aman di bawah toleransi 0.60%.'
    }
  },
  {
    id: 'REC-004',
    ticketNumber: 'TK-20260923-004',
    type: 'INBOUND',
    vehiclePlate: 'BM 8821 QC',
    driverName: 'Joko Prabowo',
    supplierId: 'SUP-003',
    supplierName: 'Wayan Sudiarta',
    supplierCode: 'PET-03',
    fruitGrade: 'GRADE_B',
    grossWeight: 9650,
    tareWeight: 0,
    netGrossWeight: 9650,
    sortation: {
      waterPercent: 1.0,
      longStalkPercent: 2.5,
      unripePercent: 2.0,
      rottenPercent: 0.0,
      abnormalPercent: 0.0,
      dirtKg: 15
    },
    totalDeductionPercent: 5.5,
    totalDeductionKg: 0,
    netCleanWeight: 0,
    pricePerKg: 2620,
    grossAmount: 0,
    loanDeduction: 300000,
    loadingFeeDeduction: 0,
    netPayable: 0,
    timestampGross: '2026-09-23T10:05:42',
    weighmaster: 'Bambang Supriyanto',
    status: 'TARA_PENDING', // Sedang antre bongkar di peron ramp!
    paymentStatus: 'PENDING',
    notes: 'Truk masih berada di atas jembatan timbang / area bongkar muat.'
  }
];

export const initialCashTransactions: CashTransaction[] = [
  {
    id: 'CSH-01',
    date: '2026-09-23T06:00:00',
    type: 'IN',
    category: 'MODAL_KASIR',
    amount: 100000000,
    description: 'Modal Tunai Kasir Awal Shift Pagi (Operasional Pembelian TBS)',
    handledBy: 'Dewi Lestari'
  },
  {
    id: 'CSH-02',
    date: '2026-09-23T07:45:00',
    type: 'OUT',
    category: 'PEMBAYARAN_TBS',
    amount: 20826800,
    description: 'Pembayaran Tunai TBS Tiket TK-20260923-001 (Haji Syamsuddin Siregar)',
    referenceTicket: 'TK-20260923-001',
    supplierId: 'SUP-001',
    handledBy: 'Dewi Lestari'
  },
  {
    id: 'CSH-03',
    date: '2026-09-23T07:50:00',
    type: 'IN',
    category: 'PELUNASAN_KASBON',
    amount: 1000000,
    description: 'Potong Kasbon Petani Haji Syamsuddin via Tiket TK-20260923-001',
    referenceTicket: 'TK-20260923-001',
    supplierId: 'SUP-001',
    handledBy: 'Dewi Lestari'
  },
  {
    id: 'CSH-04',
    date: '2026-09-23T08:20:00',
    type: 'OUT',
    category: 'BBM_SOLAR',
    amount: 650000,
    description: 'Pembelian Solar Genset Timbangan & Wheel Loader 50 Liter',
    handledBy: 'Bambang Supriyanto'
  }
];

export const initialScaleConfig: ScaleConfig = {
  comPort: 'COM3',
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  indicatorModel: 'YAOHUA_XK3190',
  isSimulationActive: true, // Default to interactive simulator mode so user can play with live weights immediately
  stabilizeTimeMs: 1500,
  weightUnit: 'kg'
};
