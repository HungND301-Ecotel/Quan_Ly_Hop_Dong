import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { Department } from '@/services/department/type';

async function getDepartmentList() {
  return await api.get<Department[], undefined>(API.DEPARTMENT.LIST);
}

async function getDepartmentDetail(id: string) {
  return await api.get<Department, string>(API.DEPARTMENT.DETAIL(id));
}

async function createDepartment(body: Omit<Department, 'id'>) {
  return await api.post<boolean, Omit<Department, 'id'>>(
    API.DEPARTMENT.CREATE,
    body
  );
}

async function updateDepartment(body: Department) {
  return await api.put<boolean, Department>(API.DEPARTMENT.UPDATE, body);
}

async function deleteDepartmentList(ids: string[]) {
  return await api.delete<boolean, string[]>(API.DEPARTMENT.DELETE, ids);
}

export const departmentService = {
  getDepartmentList,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
  deleteDepartmentList,
};
