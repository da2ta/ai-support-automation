import { apiClient } from './api';
import type { Ticket, TicketCreateInput, TicketUpdateInput, TicketListResponse } from '../types';

export const ticketService = {
  async getTickets(params: {
    status?: string;
    priority?: string;
    category?: string;
    sentiment?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TicketListResponse> {
    const response = await apiClient.get<TicketListResponse>('/tickets', { params });
    return response.data;
  },

  async getTicket(id: number): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  async submitTicket(input: TicketCreateInput): Promise<Ticket> {
    const response = await apiClient.post<Ticket>('/tickets', input);
    return response.data;
  },

  async updateTicket(id: number, update: TicketUpdateInput): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(`/tickets/${id}`, update);
    return response.data;
  },

  async reanalyzeTicket(id: number): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(`/tickets/${id}/reanalyze`);
    return response.data;
  }
};
