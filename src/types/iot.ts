// =============================================
// TYPES IOT - Pour la ferme circulaire
// =============================================

export type IoTStation = 'poulailler' | 'cultures' | 'biogaz' | 'compost';

export type ReadingSource = 'iot' | 'manual';

// Lecture IoT (provenance capteurs réels)
export interface IoTReading {
  id: string;
  station: IoTStation;
  temperature?: number;
  humidite?: number;
  qualite_air?: number;
  humidite_sol?: number;
  ph_sol?: number;
  niveau_biogaz?: number;
  methane_level?: number;
  mouvement?: boolean;
  battery_level?: number;
  signal_strength?: number;
  firmware_version?: string;
  created_at: string;
  updated_at: string;
}

// Lecture manuelle (saisie par l'utilisateur)
export interface ManualReading extends Omit<IoTReading, 'battery_level' | 'signal_strength' | 'firmware_version'> {
  observation?: string;
  photo_url?: string;
  entered_by?: string;
  is_verified?: boolean;
  source: 'manual';
}

// Lecture unifiée (IoT + manuel)
export interface UnifiedReading extends IoTReading {
  source: ReadingSource;
  observation?: string;
  photo_url?: string;
}

// Configuration des champs par station pour les formulaires
export interface StationFieldConfig {
  station: IoTStation;
  label: string;
  icon: string;
  fields: Array<{
    key: keyof IoTReading | 'observation' | 'photo_url';
    label: string;
    type: 'number' | 'text' | 'textarea' | 'boolean' | 'image';
    required?: boolean;
    min?: number;
    max?: number;
    suffix?: string;
    placeholder?: string;
  }>;
}

// Configuration des stations
export const STATION_CONFIGS: Record<IoTStation, StationFieldConfig> = {
  poulailler: {
    station: 'poulailler',
    label: '🐔 Poulailler',
    icon: '🐔',
    fields: [
      { key: 'temperature', label: 'Température', type: 'number', required: true, min: 15, max: 45, suffix: '°C' },
      { key: 'humidite', label: 'Humidité', type: 'number', required: true, min: 0, max: 100, suffix: '%' },
      { key: 'qualite_air', label: 'Qualité air (MQ-135)', type: 'number', min: 0, max: 1000, placeholder: 'Optionnel' },
      { key: 'mouvement', label: 'Activité détectée', type: 'boolean', placeholder: 'Coche si mouvement inhabituel' },
      { key: 'observation', label: 'Observation', type: 'textarea', placeholder: 'Comportement, odeur, santé...' },
      { key: 'photo_url', label: 'Photo', type: 'image', placeholder: 'Preuve visuelle optionnelle' },
    ],
  },
  cultures: {
    station: 'cultures',
    label: '🌱 Cultures',
    icon: '🌱',
    fields: [
      { key: 'temperature', label: 'Température air', type: 'number', min: 10, max: 45, suffix: '°C' },
      { key: 'humidite_sol', label: 'Humidité sol', type: 'number', required: true, min: 0, max: 100, suffix: '%' },
      { key: 'ph_sol', label: 'pH du sol', type: 'number', min: 4, max: 9, suffix: 'pH' },
      { key: 'observation', label: 'État des plantes', type: 'textarea', placeholder: 'Croissance, ravageurs, maladies...' },
      { key: 'photo_url', label: 'Photo parcelle', type: 'image' },
    ],
  },
  biogaz: {
    station: 'biogaz',
    label: '⚡ Biogaz',
    icon: '⚡',
    fields: [
      { key: 'temperature', label: 'Température digesteur', type: 'number', required: true, min: 20, max: 50, suffix: '°C' },
      { key: 'niveau_biogaz', label: 'Niveau gaz', type: 'number', min: 0, max: 100, suffix: '%' },
      { key: 'methane_level', label: 'Niveau méthane', type: 'number', min: 0, max: 5000, suffix: 'ppm' },
      { key: 'observation', label: 'Observation', type: 'textarea', placeholder: 'Odeur, production, maintenance...' },
    ],
  },
  compost: {
    station: 'compost',
    label: '♻️ Compost',
    icon: '♻️',
    fields: [
      { key: 'temperature', label: 'Température tas', type: 'number', required: true, min: 20, max: 80, suffix: '°C' },
      { key: 'humidite', label: 'Humidité', type: 'number', min: 0, max: 100, suffix: '%' },
      { key: 'observation', label: 'État du compost', type: 'textarea', placeholder: 'Odeur, texture, maturité...' },
      { key: 'photo_url', label: 'Photo', type: 'image' },
    ],
  },
};

// Alerte automatique
export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  station?: IoTStation;
  created_at: string;
  read?: boolean;
}