// =============================================
// HOOK SIMULATION IoT - Pour tests et démonstrations
// =============================================

'use client';

import { useEffect, useCallback, useState } from 'react';
import { IoTService, generateMockReading } from '../lib/iotService';
import type { IoTStation, IoTReading } from '../types/iot';

interface UseSimulatedIoTOptions {
  station: IoTStation;
  enabled?: boolean;
  intervalMs?: number;
  onNewReading?: (reading: IoTReading) => void;
}

export const useSimulatedIoT = ({
  station,
  enabled = true,
  intervalMs = 30000, // 30 secondes par défaut
  onNewReading,
}: UseSimulatedIoTOptions) => {
  const [isRunning, setIsRunning] = useState(false);

  const sendMockData = useCallback(async () => {
    if (!enabled) return;

    const mockData = {
      station,
      ...generateMockReading(station),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as IoTReading;

    try {
      // Tentative d'envoi vers Supabase (comme un vrai ESP32)
      // Si Supabase n'est pas configuré, on simule seulement en local
      try {
        await IoTService.addReading(mockData);
      } catch (e) {
        // En mode simulation sans Supabase, on continue silencieusement
        console.log('🎮 [SIM] Mode hors-ligne - données en mémoire seulement');
      }
      
      // Callback optionnel pour UI immédiate
      onNewReading?.(mockData);
      setIsRunning(true);
      
      console.log(`🎮 [SIM] ${station}: données générées`, mockData);
    } catch (error) {
      console.error('Erreur simulation:', error);
    }
  }, [station, enabled, onNewReading]);

  useEffect(() => {
    if (!enabled) return;

    // Envoi immédiat au montage
    sendMockData();

    // Interval pour mises à jour périodiques
    const interval = setInterval(sendMockData, intervalMs);

    return () => clearInterval(interval);
  }, [sendMockData, intervalMs, enabled]);

  // Fonction pour déclencher manuellement (utile pour tests)
  const triggerNow = useCallback(() => {
    sendMockData();
  }, [sendMockData]);

  // Fonction pour arrêter la simulation
  const stop = useCallback(() => {
    setIsRunning(false);
    console.log(`🎮 [SIM] ${station}: simulation arrêtée`);
  }, [station]);

  return {
    enabled,
    isRunning,
    station,
    triggerNow,
    stop,
  };
};

// Hook pour toutes les stations simulées
export const useAllSimulatedIoT = (options?: {
  enabled?: boolean;
  intervalMs?: number;
}) => {
  const stations: IoTStation[] = ['poulailler', 'cultures', 'biogaz', 'compost'];
  
  return stations.map(station => ({
    ...useSimulatedIoT({
      station,
      enabled: options?.enabled ?? true,
      intervalMs: options?.intervalMs ?? 30000,
    }),
  }));
};