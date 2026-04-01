// =============================================
// TYPES INVENTAIRE - Équipements et Matériel
// =============================================

export type EquipmentCategory = 
  | 'tracteur'
  | 'motoculteur'
  | 'pompe'
  | 'outillage'
  | 'vehicule'
  | 'cloture'
  | 'batiment'
  | 'autre';

export type EquipmentStatus = 'actif' | 'maintenance' | 'hors-service' | 'vendu';

export interface Equipment {
  id: string;
  nom: string;
  description?: string;
  categorie: EquipmentCategory;
  numero_serie?: string;
  marque?: string;
  modele?: string;
  date_achat?: string;
  prix_achat?: number;
  valeur_actuelle?: number;
  statut: EquipmentStatus;
  localisation?: string;
  derniere_maintenance?: string;
  prochain_entretien?: string;
  heures_utilisation?: number;
  kilometrage?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  date: string;
  cout: number;
  prestataire?: string;
  pieces_changees?: string[];
  prochaine_date?: string;
  created_at: string;
}

export interface EquipmentStats {
  total: number;
  actifs: number;
  en_maintenance: number;
  hors_service: number;
  valeur_totale: number;
  cout_maintenance_mois: number;
}

export const CATEGORY_CONFIG: Record<EquipmentCategory, { label: string; icon: string; color: string }> = {
  tracteur: { label: 'Tracteur', icon: '🚜', color: '#FA8C16' },
  motoculteur: { label: 'Motoculteur', icon: '🔧', color: '#52C41A' },
  pompe: { label: 'Pompe', icon: '💧', color: '#1890FF' },
  outillage: { label: 'Outillage', icon: '🔨', color: '#722ED1' },
  vehicule: { label: 'Véhicule', icon: '🚗', color: '#13C2C2' },
  cloture: { label: 'Clôture', icon: '🚧', color: '#8BC34A' },
  batiment: { label: 'Bâtiment', icon: '🏠', color: '#5A7A5A' },
  autre: { label: 'Autre', icon: '📦', color: '#666666' },
};

export const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string }> = {
  actif: { label: 'Actif', color: 'green' },
  maintenance: { label: 'En maintenance', color: 'orange' },
  'hors-service': { label: 'Hors service', color: 'red' },
  vendu: { label: 'Vendu', color: 'default' },
};