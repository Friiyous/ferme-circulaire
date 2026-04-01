// =============================================
// SUPABASE CLIENT - Configuration
// =============================================
// Ce fichier configure la connexion à Supabase

import { createClient } from '@supabase/supabase-js';
import type { Animal, Parcelle, Transaction, StockIntrant, Employe, TacheHR } from '@/types';

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les réponses Supabase
export interface Database {
  public: {
    Tables: {
      animals: {
        Row: Animal;
        Insert: Omit<Animal, 'id'>;
        Update: Partial<Animal>;
      };
      parcelles: {
        Row: Parcelle;
        Insert: Omit<Parcelle, 'id'>;
        Update: Partial<Parcelle>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id'>;
        Update: Partial<Transaction>;
      };
      stocks: {
        Row: StockIntrant;
        Insert: Omit<StockIntrant, 'id'>;
        Update: Partial<StockIntrant>;
      };
      employees: {
        Row: Employe;
        Insert: Omit<Employe, 'id'>;
        Update: Partial<Employe>;
      };
      tasks: {
        Row: TacheHR;
        Insert: Omit<TacheHR, 'id'>;
        Update: Partial<TacheHR>;
      };
    };
  };
}

// Vérifier la connexion
export const checkSupabaseConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { connected: false, error: 'Missing credentials' };
  }
  try {
    const { data, error } = await supabase.from('animals').select('count');
    return { connected: !error, error };
  } catch (error) {
    return { connected: false, error };
  }
};

// =============================================
// FONCTIONS CRUD GÉNÉRIQUES
// =============================================

// Récupérer tous les enregistrements d'une table
export const fetchAll = async <T>(table: string, orderBy?: string) => {
  let query = supabase.from(table).select('*');
  if (orderBy) {
    query = query.order(orderBy, { ascending: false });
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as T[];
};

// Récupérer par ID
export const fetchById = async <T>(table: string, id: string) => {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) throw error;
  return data as T;
};

// Créer un enregistrement
export const create = async <T>(table: string, item: Omit<T, 'id'>) => {
  const { data, error } = await supabase.from(table).insert(item).select().single();
  if (error) throw error;
  return data as T;
};

// Mettre à jour
export const update = async <T>(table: string, id: string, updates: Partial<T>) => {
  const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as T;
};

// Supprimer
export const remove = async (table: string, id: string) => {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// SPÉCIFIQUE ANIMAUX
// =============================================

export const fetchAnimals = async () => {
  const { data, error } = await supabase.from('animals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Animal[];
};

export const addAnimal = async (animal: Omit<Animal, 'id'>) => {
  const { data, error } = await supabase.from('animals').insert(animal).select().single();
  if (error) throw error;
  return data as Animal;
};

export const updateAnimal = async (id: string, updates: Partial<Animal>) => {
  const { data, error } = await supabase.from('animals').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Animal;
};

export const deleteAnimal = async (id: string) => {
  const { error } = await supabase.from('animals').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// SPÉCIFIQUE PARCELLES
// =============================================

export const fetchParcelles = async () => {
  const { data, error } = await supabase.from('parcelles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Parcelle[];
};

export const addParcelle = async (parcelle: Omit<Parcelle, 'id'>) => {
  const { data, error } = await supabase.from('parcelles').insert(parcelle).select().single();
  if (error) throw error;
  return data as Parcelle;
};

export const updateParcelle = async (id: string, updates: Partial<Parcelle>) => {
  const { data, error } = await supabase.from('parcelles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Parcelle;
};

export const deleteParcelle = async (id: string) => {
  const { error } = await supabase.from('parcelles').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// SPÉCIFIQUE TRANSACTIONS
// =============================================

export const fetchTransactions = async (filters?: {
  startDate?: string;
  endDate?: string;
  type?: 'revenu' | 'depense';
  module?: string;
}) => {
  let query = supabase.from('transactions').select('*').order('date', { ascending: false });
  
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.module) {
    query = query.eq('module', filters.module);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Transaction[];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
  if (error) throw error;
  return data as Transaction;
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Transaction;
};

export const deleteTransaction = async (id: string) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// SPÉCIFIQUE STOCKS
// =============================================

export const fetchStocks = async () => {
  const { data, error } = await supabase.from('stocks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as StockIntrant[];
};

export const addStock = async (stock: Omit<StockIntrant, 'id'>) => {
  const { data, error } = await supabase.from('stocks').insert(stock).select().single();
  if (error) throw error;
  return data as StockIntrant;
};

export const updateStock = async (id: string, updates: Partial<StockIntrant>) => {
  const { data, error } = await supabase.from('stocks').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as StockIntrant;
};

export const deleteStock = async (id: string) => {
  const { error } = await supabase.from('stocks').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// SPÉCIFIQUE EMPLOYEES
// =============================================

export const fetchEmployees = async () => {
  const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Employe[];
};

export const addEmployee = async (employee: Omit<Employe, 'id'>) => {
  const { data, error } = await supabase.from('employees').insert(employee).select().single();
  if (error) throw error;
  return data as Employe;
};

export const updateEmployee = async (id: string, updates: Partial<Employe>) => {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Employe;
};

export const deleteEmployee = async (id: string) => {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
  return { success: true };
};

// =============================================
// AUTHENTIFICATION
// =============================================

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};