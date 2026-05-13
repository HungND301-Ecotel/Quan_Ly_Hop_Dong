import { PaymentData } from './type';

export const mocks: PaymentData = {
  installments: [
    {
      id: '1',
      period: '1',
      paidAmount: 30000000,
      paymentDate: '2026-01-01',
      documents: {
        acceptanceMinute: ['Bbnt1.pdf'],
        invoice: ['hd1.pdf'],
        tax: ['thue1.pdf'],
      },
    },
    {
      id: '2',
      period: '2',
      paidAmount: 30000000,
      paymentDate: '2026-06-01',
      documents: {
        acceptanceMinute: ['Bbnt 2.pdf'],
        invoice: ['hd2.pdf'],
        tax: ['thue 2.pdf'],
      },
    },
  ],
  liquidationFile: 'thanh-ly.pdf',
};
