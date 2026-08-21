import { apiClient } from './api';
import type { AutomationAction } from '../types';

export const automationService = {
  async getActions(status?: string): Promise<AutomationAction[]> {
    const response = await apiClient.get<AutomationAction[]>('/automation/actions', { params: { status } });
    return response.data;
  },

  async updateAction(id: number, status: string, assigned_to?: string): Promise<AutomationAction> {
    const response = await apiClient.patch<AutomationAction>(`/automation/actions/${id}`, { status, assigned_to });
    return response.data;
  }
};
