export interface SummaryMetrics {
  volume: number;
  amount: number;
}

export interface SummaryItem {
  id: string;
  name: string;
  cumulative: SummaryMetrics; // Lũy kế năm
  pending: SummaryMetrics; // Giá trị/khối lượng dở dang
  estimated: SummaryMetrics; // Ước thực hiện HĐ
  liquidation: string; // Kiểm điểm, thanh lý HĐ
}

export interface SummaryResult {
  items: SummaryItem[];
}
