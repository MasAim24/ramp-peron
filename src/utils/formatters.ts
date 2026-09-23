import { SortationDeductions } from '../types';

export const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatKg = (val: number): string => {
  return `${formatNumber(Math.round(val || 0))} kg`;
};

export const formatPercent = (val: number): string => {
  return `${Number(val || 0).toFixed(1)}%`;
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateOnly = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatTimeOnly = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return dateString;
  }
};

export interface CalculationResult {
  netGross: number;
  totalPercentDeduction: number;
  percentDeductionKg: number;
  dirtKg: number;
  totalDeductionKg: number;
  netCleanWeight: number;
  grossAmount: number;
  netPayable: number;
}

export const calculateInboundWeighing = (
  grossKg: number,
  tareKg: number,
  sortation: SortationDeductions,
  pricePerKg: number,
  loanDeduction: number = 0,
  loadingFeeDeduction: number = 0
): CalculationResult => {
  const netGross = Math.max(0, grossKg - tareKg);
  const totalPercentDeduction = 
    (sortation.waterPercent || 0) + 
    (sortation.longStalkPercent || 0) + 
    (sortation.unripePercent || 0) + 
    (sortation.rottenPercent || 0) + 
    (sortation.abnormalPercent || 0);

  const percentDeductionKg = Math.round(netGross * (totalPercentDeduction / 100));
  const dirtKg = sortation.dirtKg || 0;
  const totalDeductionKg = percentDeductionKg + dirtKg;
  const netCleanWeight = Math.max(0, netGross - totalDeductionKg);
  const grossAmount = Math.round(netCleanWeight * pricePerKg);
  const netPayable = Math.max(0, grossAmount - loanDeduction - loadingFeeDeduction);

  return {
    netGross,
    totalPercentDeduction,
    percentDeductionKg,
    dirtKg,
    totalDeductionKg,
    netCleanWeight,
    grossAmount,
    netPayable
  };
};

export const generateTicketNumber = (existingCount: number, prefix: string = 'TK'): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${yyyy}${mm}${dd}-${seq}`;
};

export const exportToCSV = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(field => {
        let val = row[field];
        if (val === null || val === undefined) val = '';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
