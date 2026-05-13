// Mock data cho contract progress
export interface ContractItem {
  id: string;
  contractItemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  unitPrice: number; // Đơn giá
  contractQuantity: number; // Khối lượng hợp đồng
  contractAmount: number; // Thành tiền hợp đồng (contractQuantity * unitPrice)
  executedQuantity: number; // Tổng khối lượng đã thực hiện
  remainingQuantity: number; // Khối lượng còn lại
}

export interface ContractProgressItem extends ContractItem {
  currentExecutedQuantity: number;
  currentExecutedAmount: number;
}

export interface ContractProgress {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalExecutedQuantity: number;
  totalExecutedAmount: number;
  contractProgressItems: ContractProgressItem[];
}

export interface ContractProgressDetail {
  fromDate: string;
  toDate: string;
  total: number;
  contractProgresses: ContractProgress[];
}

// Danh sách vật tư trong hợp đồng (giả sử có sẵn trong contract)
export const CONTRACT_ITEMS: ContractItem[] = [
  {
    id: '1',
    contractItemId: 'item-1',
    itemCode: 'VT001',
    itemName: 'Xi măng PCB40',
    unit: '',
    unitPrice: 200,
    contractQuantity: 100,
    contractAmount: 20000, // 100 * 2000000
    executedQuantity: 0,
    remainingQuantity: 100,
  },
  {
    id: '2',
    contractItemId: 'item-2',
    itemCode: 'VT002',
    itemName: 'Cát xây dựng',
    unit: '',
    unitPrice: 30,
    contractQuantity: 500,
    contractAmount: 15000, // 500 * 300000
    executedQuantity: 0,
    remainingQuantity: 500,
  },
  {
    id: '3',
    contractItemId: 'item-3',
    itemCode: 'VT003',
    itemName: 'Đá 1x2',
    unit: '',
    unitPrice: 400,
    contractQuantity: 300,
    contractAmount: 120000, // 300 * 400000
    executedQuantity: 0,
    remainingQuantity: 300,
  },
  {
    id: '4',
    contractItemId: 'item-4',
    itemCode: 'VT004',
    itemName: 'Thép D10',
    unit: '',
    unitPrice: 150,
    contractQuantity: 2000,
    contractAmount: 300000, // 2000 * 15000
    executedQuantity: 0,
    remainingQuantity: 2000,
  },
  {
    id: '5',
    contractItemId: 'item-5',
    itemCode: 'VT005',
    itemName: 'Gạch ốp lát 60x60',
    unit: '',
    unitPrice: 250,
    contractQuantity: 200,
    contractAmount: 50000, // 200 * 250000
    executedQuantity: 0,
    remainingQuantity: 200,
  },
];

// Mock contract progress data ban đầu
export const MOCK_CONTRACT_PROGRESS: ContractProgressDetail = {
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  total: 0,
  contractProgresses: [],
};

// Helper function để tính toán remaining quantity
export const calculateRemainingQuantities = (
  contractItems: ContractItem[],
  allProgresses: ContractProgress[]
): ContractItem[] => {
  const itemsMap = new Map<string, number>();

  // Tính tổng đã thực hiện cho mỗi vật tư
  allProgresses.forEach((progress) => {
    progress.contractProgressItems.forEach((item) => {
      const current = itemsMap.get(item.contractItemId) || 0;
      itemsMap.set(
        item.contractItemId,
        current + item.currentExecutedQuantity
      );
    });
  });

  // Cập nhật remaining quantity
  return contractItems.map((item) => {
    const executed = itemsMap.get(item.contractItemId) || 0;
    return {
      ...item,
      executedQuantity: executed,
      remainingQuantity: item.contractQuantity - executed,
    };
  });
};

// Helper function để lấy danh sách vật tư còn lại có thể thực hiện
export const getAvailableItems = (
  contractItems: ContractItem[],
  allProgresses: ContractProgress[]
): ContractItem[] => {
  const updatedItems = calculateRemainingQuantities(
    contractItems,
    allProgresses
  );
  return updatedItems.filter((item) => item.remainingQuantity > 0);
};

// Helper function để tính tổng giá trị và khối lượng thực hiện
export const calculateProgressTotals = (
  items: ContractProgressItem[]
): { totalQuantity: number; totalAmount: number } => {
  return items.reduce(
    (totals, item) => {
      return {
        totalQuantity: totals.totalQuantity + item.currentExecutedQuantity,
        totalAmount:
          totals.totalAmount +
          item.currentExecutedQuantity * item.unitPrice,
      };
    },
    { totalQuantity: 0, totalAmount: 0 }
  );
};

// Helper function để tạo progress items từ contract items
export const createProgressItemsFromContractItems = (
  contractItems: ContractItem[]
): ContractProgressItem[] => {
  return contractItems.map((item) => ({
    ...item,
    currentExecutedQuantity: 0,
    currentExecutedAmount: 0,
  }));
};