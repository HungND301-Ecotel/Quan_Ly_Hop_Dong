import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { Position } from '@/services/postion/type';

const getPositionList = async () => {
  return await api.get<Position[], undefined>(API.POSITION.LIST);
};

export const positionService = {
  getPositionList,
};
