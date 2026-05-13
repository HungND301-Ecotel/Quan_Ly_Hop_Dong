import { SummaryResult } from './type';

export const mocks: SummaryResult = {
  items: [
    {
      id: '1',
      name: 'Hạng mục 1',
      cumulative: { volume: 31, amount: 32000000 },
      pending: { volume: 33, amount: 34000000 },
      estimated: { volume: 35, amount: 36000000 },
      liquidation: 'Hoàn thành',
    },
    {
      id: '2',
      name: 'Hạng mục 2',
      cumulative: { volume: 15, amount: 15000000 },
      pending: { volume: 5, amount: 5000000 },
      estimated: { volume: 20, amount: 20000000 },
      liquidation: 'Chưa xong',
    },
  ],
};
