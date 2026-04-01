// =============================================
// TYPES PLANNING - Calendrier agricole
// =============================================

export type EventType = 'semis' | 'recolte' | 'entretien' | 'traitement' | ' irrigation' | 'autre';
export type EventStatus = 'planifie' | 'en-cours' | 'termine' | 'annule';

export interface PlanningEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  start_date: string;
  end_date?: string;
  parcelle_id?: string;
  culture_id?: string;
  assignee_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reminders?: string[]; // ['1j', '1semaine']
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarView {
  month: number;
  year: number;
}

export interface PlanningStats {
  total_events: number;
  termines: number;
  en_cours: number;
  planifies: number;
  en_retard: number;
}

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; icon: string; color: string }> = {
  semis: { label: 'Semis', icon: '🌱', color: '#52C41A' },
  recolte: { label: 'Récolte', icon: '🌾', color: '#FA8C16' },
  entretien: { label: 'Entretien', icon: '🔧', color: '#1890FF' },
  traitement: { label: 'Traitement', icon: '💊', color: '#722ED1' },
  ' irrigation': { label: 'Irrigation', icon: '💧', color: '#13C2C2' },
  autre: { label: 'Autre', icon: '📋', color: '#666666' },
};

export const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'default' },
  normal: { label: 'Normale', color: 'blue' },
  high: { label: 'Haute', color: 'orange' },
  urgent: { label: 'Urgente', color: 'red' },
};

export const STATUS_CONFIG: Record<EventStatus, { label: string; color: string }> = {
  planifie: { label: 'Planifié', color: 'default' },
  'en-cours': { label: 'En cours', color: 'blue' },
  termine: { label: 'Terminé', color: 'green' },
  annule: { label: 'Annulé', color: 'red' },
};