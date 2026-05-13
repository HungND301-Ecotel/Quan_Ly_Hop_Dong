import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { UnitOfMeasure } from './type';

async function getUnitOfMeasureList() {
  return api.get<UnitOfMeasure[], { search?: string }>(
    API.UNIT_OF_MEASURE.LIST,
  );
}

async function getUnitOfMeasureDetail(id: string) {
  return api.get<UnitOfMeasure, undefined>(API.UNIT_OF_MEASURE.DETAIL(id));
}

async function createUnitOfMeasure(body: Omit<UnitOfMeasure, 'id' | 'isActive'>) {
  return api.post<boolean, Omit<UnitOfMeasure, 'id' | 'isActive'>>(
    API.UNIT_OF_MEASURE.CREATE,
    body
  );
}

async function updateUnitOfMeasure(body: UnitOfMeasure) {
  return api.put<boolean, UnitOfMeasure>(API.UNIT_OF_MEASURE.UPDATE, body);
}

async function deleteUnitOfMeasureList(ids: string[]) {
  return api.delete<boolean, string[]>(API.UNIT_OF_MEASURE.DELETE, ids);
}

export const unitOfMeasureService = {
  getUnitOfMeasureList,
  getUnitOfMeasureDetail,
  createUnitOfMeasure,
  updateUnitOfMeasure,
  deleteUnitOfMeasureList,
};