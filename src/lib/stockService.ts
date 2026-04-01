'use client';
import { stocksService } from './crudService';
import type { Stock as DbStock } from './crudService';

export interface Stock {
  id: string;
  nom: string;
  categorie: string;
  quantite: number;
  unite: string;
  prix_unitaire?: number;
}

const mockStocks: Stock[] = [];

export const StockService = {
  async getAll(): Promise<Stock[]> {
    try {
      const { data, error } = await stocksService.getAll();
      if (error || !data?.length) return mockStocks;
      return data.map((s: DbStock) => ({
        id: s.id || String(Date.now()),
        nom: s.nom || '',
        categorie: s.categorie || '',
        quantite: s.quantite || 0,
        unite: s.unite || '',
        prix_unitaire: s.prix_unitaire,
      }));
    } catch {
      return mockStocks;
    }
  },

  async create(stock: Omit<Stock, 'id'>): Promise<Stock | null> {
    try {
      const { data, error } = await stocksService.create(stock as any);
      if (error) throw error;
      return data ? {
        id: data.id || String(Date.now()),
        ...stock,
      } : null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await stocksService.delete(id);
      return true;
    } catch {
      return false;
    }
  },
};