export type ContractFormat = {
  id: number;
  code: string;
  name: string;
};

export const ContractFormat: Record<number, ContractFormat> = {
  0: {
    id: 0,
    code: 'TemplateBuy',
    name: 'Hợp đồng nguyên tắc mua',
  },
  1: {
    id: 1,
    code: 'TemplateSell',
    name: 'Hợp đồng nguyên tắc bán',
  },
  2: {
    id: 2,
    code: 'EconomicBuy',
    name: 'Hợp đồng kinh tế mua',
  },
  3: {
    id: 3,
    code: 'EconomicSell',
    name: 'Hợp đồng kinh tế bán',
  },
} as const;
