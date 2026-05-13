import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { DashboardStatistics, GetDashboardStatisticsReq } from './type';
 
async function getDashboardStatistics(req?: GetDashboardStatisticsReq) {
  return await api.get<DashboardStatistics, GetDashboardStatisticsReq>(
    API.DASHBOARD.STATISTICS,
    req
  );
}
 
export const dashboardService = {
  getDashboardStatistics,
};
 