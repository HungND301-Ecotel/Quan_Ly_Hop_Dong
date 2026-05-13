import { api } from '@/lib/api';

async function getFile(url: string, isFullUrl: boolean = true) {
  return await api.file(url, isFullUrl);
}

export const fileService = {
  getFile,
};
