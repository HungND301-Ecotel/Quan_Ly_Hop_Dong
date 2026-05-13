export type GetDashboardStatisticsReq = {
  contractFormat?: number;
};

// Extend this type as the API response schema becomes clearer
export type DashboardStatistics = {
  [key: string]: unknown;
};