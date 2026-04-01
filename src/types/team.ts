// =============================================
// TYPES ÉQUIPE - Portail collaboratif
// =============================================

export type TeamRole = 
  | 'proprietaire' 
  | 'contremaître' 
  | 'ouvrier_elevage' 
  | 'ouvrier_culture' 
  | 'technicien';

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type CheckinType = 'checkin' | 'checkout';

export interface TeamMember {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  role: TeamRole;
  telephone?: string;
  date_embauche?: string;
  salaire_base?: number;
  photo_url?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  station?: string;
  assigned_to?: string;
  created_by?: string;
  due_date: string;
  scheduled_time?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_duration?: number;
  actual_duration?: number;
  completed_at?: string;
  notes?: string;
  photo_urls?: string[];
  quality_score?: number;
  created_at: string;
  updated_at: string;
  assignee?: TeamMember;
}

export interface TeamCheckin {
  id: string;
  member_id: string;
  type: CheckinType;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
  notes?: string;
  device_info?: string;
  created_at: string;
}

export interface TeamChallenge {
  id: string;
  title: string;
  description?: string;
  type: string;
  target_value: number;
  current_value: number;
  reward_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  winners?: string[];
  created_at: string;
}

export interface TeamBadge {
  id: string;
  member_id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  description?: string;
  earned_at: string;
  points: number;
}

export interface TeamPoints {
  id: string;
  member_id: string;
  points: number;
  reason?: string;
  week_start: string;
  created_at: string;
}

export interface MemberStats {
  id: string;
  nom: string;
  prenom: string;
  role: TeamRole;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
  total_points: number;
}

// Configuration des rôles
export const ROLE_CONFIG: Record<TeamRole, { label: string; icon: string; color: string }> = {
  proprietaire: { label: 'Propriétaire', icon: '👑', color: '#722ED1' },
  contremaître: { label: 'Contremaître', icon: '👨‍💼', color: '#1890FF' },
  ouvrier_elevage: { label: 'Ouvrier Élevage', icon: '🐔', color: '#FA8C16' },
  ouvrier_culture: { label: 'Ouvrier Culture', icon: '🌱', color: '#52C41A' },
  technicien: { label: 'Technicien', icon: '⚡', color: '#13C2C2' },
};

// Templates de tâches récurrentes
export const TASK_TEMPLATES = [
  {
    title: 'Nourrir poules',
    station: 'poulailler',
    role: 'ouvrier_elevage' as TeamRole,
    scheduled_time: '06:00',
    estimated_duration: 30,
    priority: 'high' as TaskPriority,
    description: 'Distribution nourriture 200g/poule + eau fraîche',
  },
  {
    title: 'Collecter œufs',
    station: 'poulailler',
    role: 'ouvrier_elevage' as TeamRole,
    scheduled_time: '08:00',
    estimated_duration: 45,
    priority: 'high' as TaskPriority,
    description: 'Ramassage, tri et comptage des œufs',
  },
  {
    title: 'Irrigation parcelle A',
    station: 'cultures',
    role: 'ouvrier_culture' as TeamRole,
    scheduled_time: '07:00',
    estimated_duration: 60,
    priority: 'normal' as TaskPriority,
    description: 'Arrosage 15min si humidité sol <40%',
  },
  {
    title: 'Alimenter digesteur biogaz',
    station: 'biogaz',
    role: 'technicien' as TeamRole,
    scheduled_time: '09:00',
    estimated_duration: 30,
    priority: 'high' as TaskPriority,
    description: 'Ajouter 20kg fumier + 20L eau (ratio 1:1)',
  },
  {
    title: 'Retourner compost',
    station: 'compost',
    role: 'technicien' as TeamRole,
    scheduled_time: '14:00',
    estimated_duration: 45,
    priority: 'normal' as TaskPriority,
    description: 'Aération tas compost (J+7 ou J+21)',
  },
];