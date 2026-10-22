import apiClient from '../../api/client';
import type { SalesLookupsResponse } from '../../types/sales';

export const getSalesLookups = async (): Promise<SalesLookupsResponse> => {
  const response = await apiClient.get<SalesLookupsResponse>('/Sales/lookups');
  return response.data;
};
