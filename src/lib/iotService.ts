// =============================================
// SERVICE IoT - Pour la ferme circulaire
// =============================================

import { supabase } from './supabase';
import type { IoTStation, IoTReading, ManualReading, UnifiedReading } from '../types/iot';

// Service pour les lectures IoT (capteurs)
export const IoTService = {
  // Ajouter une lecture IoT
  async addReading(reading: Omit<IoTReading, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('iot_readings')
      .insert([reading])
      .select()
      .single();
    
    if (error) throw error;
    return data as IoTReading;
  },

  // Récupérer l'historique IoT par station
  async getHistory(station: IoTStation, hours: number = 24): Promise<IoTReading[]> {
    const { data, error } = await supabase
      .from('iot_readings')
      .select('*')
      .eq('station', station)
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as IoTReading[];
  },

  // Dernière lecture par station
  async getLatest(station: IoTStation): Promise<IoTReading | null> {
    const { data, error } = await supabase
      .from('iot_readings')
      .select('*')
      .eq('station', station)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as IoTReading | null;
  },

  // Toutes les dernières lectures
  async getAllLatest(): Promise<Record<IoTStation, IoTReading | null>> {
    const stations: IoTStation[] = ['poulailler', 'cultures', 'biogaz', 'compost'];
    const result: Record<IoTStation, IoTReading | null> = {} as any;
    
    for (const station of stations) {
      result[station] = await this.getLatest(station);
    }
    
    return result;
  },
};

// Service pour les saisies manuelles
export const ManualReadingsService = {
  // Créer une nouvelle saisie manuelle
  async addReading(reading: Omit<ManualReading, 'id' | 'created_at' | 'updated_at' | 'source'>) {
    const { data, error } = await supabase
      .from('manual_readings')
      .insert([{ ...reading, source: 'manual' }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ManualReading;
  },

  // Récupérer l'historique manuel par station
  async getHistory(station: IoTStation, days: number = 7): Promise<ManualReading[]> {
    const { data, error } = await supabase
      .from('manual_readings')
      .select('*')
      .eq('station', station)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ManualReading[];
  },

  // Marquer une saisie comme vérifiée
  async verifyReading(readingId: string) {
    const { error } = await supabase
      .from('manual_readings')
      .update({ is_verified: true })
      .eq('id', readingId);
    
    if (error) throw error;
  },
};

// Service unifié (IoT + manuel)
export const UnifiedReadingsService = {
  // Récupérer toutes les lectures (IoT + manuel)
  async getUnifiedHistory(station: IoTStation, hours: number = 24): Promise<UnifiedReading[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    // Récupérer les deux sources
    const [iotData, manualData] = await Promise.all([
      IoTService.getHistory(station, hours),
      ManualReadingsService.getHistory(station, hours / 24),
    ]);
    
    // Combiner et trier
    const combined: UnifiedReading[] = [
      ...iotData.map(r => ({ ...r, source: 'iot' as const })),
      ...manualData.map(r => ({ ...r, source: 'manual' as const })),
    ];
    
    return combined.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  },
};

// Générateur de données simulées (pour tests/démos)
export const generateMockReading = (station: IoTStation): Partial<IoTReading> => {
  const base = {
    battery_level: Math.floor(85 + Math.random() * 15),
    signal_strength: Math.floor(-40 - Math.random() * 30),
    firmware_version: '1.0.0',
  };

  switch (station) {
    case 'poulailler':
      return {
        ...base,
        temperature: parseFloat((28 + Math.random() * 7).toFixed(1)),
        humidite: Math.floor(50 + Math.random() * 30),
        qualite_air: Math.floor(150 + Math.random() * 200),
        mouvement: Math.random() > 0.7,
      };
    case 'cultures':
      return {
        ...base,
        temperature: parseFloat((24 + Math.random() * 12).toFixed(1)),
        humidite_sol: Math.floor(35 + Math.random() * 45),
        ph_sol: parseFloat((6 + Math.random() * 2).toFixed(1)),
      };
    case 'biogaz':
      return {
        ...base,
        temperature: parseFloat((33 + Math.random() * 5).toFixed(1)),
        niveau_biogaz: Math.floor(40 + Math.random() * 50),
        methane_level: Math.floor(200 + Math.random() * 400),
      };
    case 'compost':
      return {
        ...base,
        temperature: parseFloat((45 + Math.random() * 20).toFixed(1)),
        humidite: Math.floor(50 + Math.random() * 30),
      };
    default:
      return base;
  }
};