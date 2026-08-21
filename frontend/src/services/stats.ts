import { apiClient } from './api';
import type { DashboardStats, HealthCheckResponse } from '../types';

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/stats');
    return response.data;
  },
  
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  }
};
