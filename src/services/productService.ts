// src/services/productService.ts
import api from './api';
import type { Product, CreateProductDto } from '../types';

export const productService = {
  // Estudante / Geral: produtos ativos
  getAllActive: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products');
    return response.data;
  },

  // Admin: todos os produtos
  getAllForAdmin: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/api/products/admin');
    return response.data;
  },

  // Admin: cadastrar produto
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post<Product>('/api/products', data);
    return response.data;
  },

  // Admin: desativar produto
  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};