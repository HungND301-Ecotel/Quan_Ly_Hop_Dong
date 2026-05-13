export interface PaymentInstallment {
  period: string; // e.g., "Kỳ 1"
  id: string;
  paidAmount: number; // Số tiền đã thanh toán
  paymentDate: string;
  documents: {
    acceptanceMinute?: string[]; // Biên bản nghiệm thu
    invoice?: string[]; // Hóa đơn
    tax?: string[]; // Thuế
  };
}

export interface PaymentData {
  installments: PaymentInstallment[];
  liquidationFile?: string;
}
