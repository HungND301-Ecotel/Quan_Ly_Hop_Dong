import { API } from '@/constants/api';
import { ApiRes } from '@/types/api.type';
import axios, { AxiosResponse } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    }
    return searchParams.toString();
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponse = <Res>(response: AxiosResponse<ApiRes<Res>>) => {
  const { data } = response;

  if (data && typeof data === 'object' && 'success' in data) {
    if (!data.success) throw new Error(data.title || 'Unknown error');
    return data.result;
  }

  return data as unknown as Res;
};

export const api = {
  get: async <Res, Req>(url: string, params?: Req) => {
    const response = await instance.get<ApiRes<Res>>(url, { params });
    return handleResponse(response);
  },
  post: async <Res, Req>(url: string, body?: Req) => {
    const response = await instance.post<ApiRes<Res>>(url, body);
    return handleResponse(response);
  },
  put: async <Res, Req>(url: string, body?: Req) => {
    const response = await instance.put<ApiRes<Res>>(url, body);
    return handleResponse(response);
  },
  delete: async <Res, Req>(url: string, data?: Req) => {
    const response = await instance.delete<ApiRes<Res>>(url, { data });
    return handleResponse(response);
  },
  file: async (url: string, isFullUrl: boolean = true) => {
    const response = await instance.post(
      API.FILE,
      isFullUrl ? { presignedUrl: url } : { fileS3Path: url },
      { responseType: 'blob' }
    );
    const blob = response.data as Blob;
    let fileName = url.split('/').pop() || 'file';
    fileName = fileName.split('?')[0];

    try {
      fileName = decodeURIComponent(fileName);
    } catch {
      // Fallback to original if decoding fails
    }

    return new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime(),
    });
  },
};
