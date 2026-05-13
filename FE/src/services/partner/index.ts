import { API } from '@/constants/api';
import { api } from '@/lib/api';
import { Partner } from '@/services/partner/type';

async function getPartnerList() {
  return api.get<Partner[], undefined>('/partner');
}

async function getPartnerDetail(id: string) {
  return api.get<Partner, undefined>(API.PARTNER.DETAIL(id));
}

async function createPartner(body: Omit<Partner, 'id'>) {
  return await api.post<boolean, Omit<Partner, 'id'>>(API.PARTNER.CREATE, body);
}

async function updatePartner(body: Partner) {
  return await api.put<boolean, Partner>(API.PARTNER.UPDATE, body);
}

async function deletePartnerList(ids: string[]) {
  return await api.delete<boolean, string[]>(API.PARTNER.DELETE, ids);
}

export const partnerService = {
  getPartnerList,
  getPartnerDetail,
  updatePartner,
  deletePartnerList,
  createPartner,
};
