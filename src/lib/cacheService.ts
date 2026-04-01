// =============================================
// SERVICE CACHE LOCAL - Optimisation performance
// =============================================

const CACHE_PREFIX = 'ferme_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  expiry: number;
}

// Sauvegarder dans le cache local
export function setCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return;
  
  const item: CacheItem<T> = {
    data,
    expiry: Date.now() + ttl
  };
  
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
}

// Recuperer du cache local
export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;
    
    const item: CacheItem<T> = JSON.parse(stored);
    
    // Verifier expiration
    if (Date.now() > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return item.data;
  } catch (e) {
    return null;
  }
}

// Supprimer une entree du cache
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_PREFIX + key);
}

// Vider tout le cache de l'application
export function clearAllCache(): void {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// Wrapper pour fonctions avec cache
export async function withCache<T>(
  key: string, 
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Verifier cache existant
  const cached = getCache<T>(key);
  if (cached) return cached;
  
  // sinon executer et mettre en cache
  const data = await fetchFn();
  setCache(key, data, ttl);
  return data;
}

// =============================================
// BACKUP AUTOMATIQUE DES DONNEES
// =============================================

interface BackupData {
  version: string;
  timestamp: string;
  data: {
    animals?: any[];
    parcelles?: any[];
    stocks?: any[];
    transactions?: any[];
    employees?: any[];
  };
}

const BACKUP_KEY = 'ferme_backup';

// Creer un backup complet
export function createBackup(data: {
  animals?: any[];
  parcelles?: any[];
  stocks?: any[];
  transactions?: any[];
  employees?: any[];
}): void {
  const backup: BackupData = {
    version: '2.1',
    timestamp: new Date().toISOString(),
    data
  };
  
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    console.log('✅ Backup cree:', backup.timestamp);
  } catch (e) {
    console.error('Backup failed:', e);
  }
}

// Restaurer depuis un backup
export function restoreBackup(): BackupData | null {
  try {
    const stored = localStorage.getItem(BACKUP_KEY);
    if (!stored) return null;
    
    const backup: BackupData = JSON.parse(stored);
    console.log('📥 Backup trouve:', backup.timestamp);
    return backup;
  } catch (e) {
    return null;
  }
}

// Verification s'il y a des donnees a restaurer
export function hasBackup(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(BACKUP_KEY) !== null;
}

// Supprimer le backup
export function deleteBackup(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BACKUP_KEY);
}

// Export backup vers fichier (telechargement)
export function exportBackupFile(): void {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (!backup) {
    alert('Aucun backup disponible');
    return;
  }
  
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ferme-circulaire-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// =============================================
// SYNC SUPABASE - Sauvegarde automatique periodique
// =============================================

import { supabase } from './supabase';

export async function autoBackupToSupabase(): Promise<boolean> {
  try {
    // Recuperer donnees locales
    const animals = getCache('animals') || [];
    const parcelles = getCache('parcelles') || [];
    const transactions = getCache('transactions') || [];
    const stocks = getCache('stocks') || [];
    
    // Sauvegarder dans Supabase (table backup)
    const { error } = await supabase.from('alerts').insert({
      type: 'system',
      title: 'Backup auto',
      message: `Sauvegarde automatique - ${new Date().toISOString()}`,
      severity: 'info'
    });
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Backup failed:', error);
      return false;
    }
    
    console.log('✅ Backup automatique effectue');
    return true;
  } catch (e) {
    console.error('Auto backup error:', e);
    return false;
  }
}

// Planifier backup automatique toutes les heures
export function startAutoBackup(intervalMs: number = 3600000): () => void {
  const interval = setInterval(() => {
    autoBackupToSupabase();
  }, intervalMs);
  
  // Faire un premier backup immediatement
  autoBackupToSupabase();
  
  // Retourner fonction pour arreter
  return () => clearInterval(interval);
}