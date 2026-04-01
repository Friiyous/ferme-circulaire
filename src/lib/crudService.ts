/**
 * Service CRUD simplifié - Sans cache interne
 * Les pages gèrent她们自己的 localStorage
 */
import { supabase } from './supabase';

export type TableName = 'animals' | 'parcelles' | 'transactions' | 'stocks' | 'employees' | 'tasks' | 'alerts';

// Types pour les données
export interface Animal {
  id?: string;
  code: string;
  espece: string;
  race?: string;
  sexe?: string;
  poids?: number;
  statut?: 'actif' | 'malade' | 'vendu' | 'mort';
  localisation?: string;
  date_naissance?: string;
  date_entree?: string;
  created_at?: string;
}

export interface Transaction {
  id?: string;
  date: string;
  type: 'revenu' | 'depense';
  categorie?: string;
  montant: number;
  description?: string;
  module?: string;
  created_at?: string;
}

export interface Stock {
  id?: string;
  nom: string;
  categorie?: string;
  quantite?: number;
  unite?: string;
  prix_unitaire?: number;
  created_at?: string;
}

export interface Employee {
  id?: string;
  nom: string;
  prenom?: string;
  role?: string;
  telephone?: string;
  email?: string;
  statut?: 'actif' | 'inactif';
  salaire?: number;
  date_embauche?: string;
  created_at?: string;
}

export interface Parcelle {
  id?: string;
  nom: string;
  surface?: number;
  culture_actuelle?: string;
  statut?: 'en_culture' | 'fallow' | 'prepare';
  created_at?: string;
}

// Service simple sans cache interne
export const animalsService = {
  async create(data: Omit<Animal, 'id' | 'created_at'>): Promise<{ data: Animal | null; error: unknown }> {
    try {
      const { data: result, error } = await supabase
        .from('animals')
        .insert(data as Record<string, unknown>)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data: result as Animal, error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async getAll(): Promise<{ data: Animal[]; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data || []) as Animal[], error: null };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async delete(id: string): Promise<{ success: boolean; error: unknown }> {
    try {
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', id);
      return { success: !error, error: error?.message || null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
};

export const transactionsService = {
  async create(data: Omit<Transaction, 'id' | 'created_at'>): Promise<{ data: Transaction | null; error: unknown }> {
    try {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert(data as Record<string, unknown>)
        .select()
        .single();
      return { data: result as Transaction, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async getAll(): Promise<{ data: Transaction[]; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: (data || []) as Transaction[], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async delete(id: string): Promise<{ success: boolean; error: unknown }> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      return { success: !error, error: error?.message || null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
};

export const stocksService = {
  async create(data: Omit<Stock, 'id' | 'created_at'>): Promise<{ data: Stock | null; error: unknown }> {
    try {
      const { data: result, error } = await supabase
        .from('stocks')
        .insert(data as Record<string, unknown>)
        .select()
        .single();
      return { data: result as Stock, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async getAll(): Promise<{ data: Stock[]; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: (data || []) as Stock[], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async delete(id: string): Promise<{ success: boolean; error: unknown }> {
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id);
      return { success: !error, error: error?.message || null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
};

export const employeesService = {
  async create(data: Omit<Employee, 'id' | 'created_at'>): Promise<{ data: Employee | null; error: unknown }> {
    try {
      const { data: result, error } = await supabase
        .from('employees')
        .insert(data as Record<string, unknown>)
        .select()
        .single();
      return { data: result as Employee, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async getAll(): Promise<{ data: Employee[]; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: (data || []) as Employee[], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async delete(id: string): Promise<{ success: boolean; error: unknown }> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      return { success: !error, error: error?.message || null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
};

export const parcellesService = {
  async create(data: Omit<Parcelle, 'id' | 'created_at'>): Promise<{ data: Parcelle | null; error: unknown }> {
    try {
      const { data: result, error } = await supabase
        .from('parcelles')
        .insert(data as Record<string, unknown>)
        .select()
        .single();
      return { data: result as Parcelle, error };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async getAll(): Promise<{ data: Parcelle[]; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('parcelles')
        .select('*')
        .order('created_at', { ascending: false });
      return { data: (data || []) as Parcelle[], error };
    } catch (err: unknown) {
      return { data: [], error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
  
  async delete(id: string): Promise<{ success: boolean; error: unknown }> {
    try {
      const { error } = await supabase
        .from('parcelles')
        .delete()
        .eq('id', id);
      return { success: !error, error: error?.message || null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erreur' };
    }
  },
};