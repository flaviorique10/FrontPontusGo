// src/services/redemptionService.ts
import api from './api';
import type { Redemption, RedemptionResult, RedemptionValidationResult } from '../types';

export const redemptionService = {
  // Estudante: resgatar recompensa (gerar voucher)
  redeem: async (productId: string): Promise<RedemptionResult> => {
    const response = await api.post<RedemptionResult>(`/api/redemptions/${productId}/redeem`);
    return response.data;
  },

  // Estudante: ver histórico de resgates próprios
  getMyRedemptions: async (): Promise<Redemption[]> => {
    const response = await api.get<Redemption[]>('/api/redemptions/me');
    return response.data;
  },

  // Admin: listar todos os resgates do sistema (com filtro opcional de status)
  getAllForAdmin: async (status?: string): Promise<Redemption[]> => {
    const response = await api.get<Redemption[]>('/api/redemptions/admin', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  // Admin: validar voucher (marcar como entregue) através do código
  validateVoucher: async (voucherCode: string): Promise<RedemptionValidationResult> => {
    const response = await api.post<RedemptionValidationResult>('/api/redemptions/validate', {
      voucherCode,
    });
    return response.data;
  },
};