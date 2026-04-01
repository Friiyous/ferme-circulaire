// =============================================
// SERVICE ÉQUIPE - Portail collaboratif (Mode Mock)
// =============================================

import { mockEmployes, mockTaches } from './mockData';
import type { 
  TeamMember, 
  DailyTask, 
  TeamCheckin, 
  TeamChallenge, 
  TeamBadge,
  MemberStats,
  TaskStatus,
  TeamRole
} from '../types/team';

// Données locales pour simulation (en attendant Supabase)
let localTasks: DailyTask[] = [];
let localCheckins: TeamCheckin[] = [];
let localPoints: Map<string, number> = new Map();

// Initialiser les tâches avec les données mock
const initializeTasks = () => {
  if (localTasks.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const members = mockEmployes as unknown as TeamMember[];
    
    // Créer des tâches pour chaque membre
    members.forEach((member, idx) => {
      localTasks.push({
        id: `task-${idx}-1`,
        title: 'Nourrir les animaux',
        description: 'Distribution nourriture et eau fraîche',
        station: member.role.includes('elevage') ? 'poulailler' : 'biogaz',
        assigned_to: member.id,
        created_by: 'emp1',
        due_date: today,
        scheduled_time: '06:00',
        status: idx === 0 ? 'done' : 'pending',
        priority: 'high',
        estimated_duration: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      localTasks.push({
        id: `task-${idx}-2`,
        title: 'Nettoyage structures',
        description: 'Nettoyer les abreuvoirs et mangeoires',
        station: 'poulailler',
        assigned_to: member.id,
        created_by: 'emp1',
        due_date: today,
        scheduled_time: '08:00',
        status: 'pending',
        priority: 'normal',
        estimated_duration: 45,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      localTasks.push({
        id: `task-${idx}-3`,
        title: 'Vérification clôture',
        description: 'Inspecter l\'état des clôture et portes',
        station: 'poulailler',
        assigned_to: member.id,
        created_by: 'emp1',
        due_date: today,
        scheduled_time: '10:00',
        status: 'pending',
        priority: 'low',
        estimated_duration: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
  }
};

export const TeamService = {
  // ========== MEMBRES ==========
  
  getAllMembers(): TeamMember[] {
    return mockEmployes as unknown as TeamMember[];
  },

  getMemberById(id: string): TeamMember | null {
    return (mockEmployes as unknown as TeamMember[]).find(m => m.id === id) || null;
  },

  // Simuler un membre connecté (le premier pour démo)
  getCurrentMember(): TeamMember | null {
    const members = mockEmployes as unknown as TeamMember[];
    return members[0] || null;
  },

  createMember(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: `emp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Dans une vraie app, on ajouterait à Supabase
    return newMember;
  },

  // ========== TÂCHES ==========

  getTasksForMember(memberId: string, date?: string): DailyTask[] {
    initializeTasks();
    let tasks = localTasks.filter(t => t.assigned_to === memberId);
    if (date) {
      tasks = tasks.filter(t => t.due_date === date);
    }
    return tasks;
  },

  getTodayTasks(memberId: string): DailyTask[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getTasksForMember(memberId, today);
  },

  getAllTasks(filters?: {
    status?: TaskStatus;
    assigned_to?: string;
    due_date?: string;
    station?: string;
  }): DailyTask[] {
    initializeTasks();
    let tasks = [...localTasks];
    
    if (filters?.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters?.assigned_to) tasks = tasks.filter(t => t.assigned_to === filters.assigned_to);
    if (filters?.due_date) tasks = tasks.filter(t => t.due_date === filters.due_date);
    if (filters?.station) tasks = tasks.filter(t => t.station === filters.station);
    
    return tasks;
  },

  createTask(task: Omit<DailyTask, 'id' | 'created_at' | 'updated_at'>): DailyTask {
    initializeTasks();
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localTasks.push(newTask);
    return newTask;
  },

  updateTaskStatus(taskId: string, status: TaskStatus, additionalData?: Partial<DailyTask>): DailyTask {
    initializeTasks();
    const taskIndex = localTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Tâche non trouvée');
    
    localTasks[taskIndex] = {
      ...localTasks[taskIndex],
      status,
      completed_at: status === 'done' ? new Date().toISOString() : undefined,
      ...additionalData,
      updated_at: new Date().toISOString(),
    };
    
    return localTasks[taskIndex];
  },

  getTaskById(taskId: string): DailyTask | null {
    initializeTasks();
    return localTasks.find(t => t.id === taskId) || null;
  },

  // Créer des tâches récurrentes pour la semaine
  createWeeklyTasks(templates: Array<{
    template: any;
    dates: string[];
    assigneeId: string;
    createdBy: string;
  }>): DailyTask[] {
    initializeTasks();
    const newTasks: DailyTask[] = [];
    
    templates.forEach(({ template, dates, assigneeId, createdBy }) => {
      dates.forEach(date => {
        const task = this.createTask({
          title: template.title,
          description: template.description,
          station: template.station,
          assigned_to: assigneeId,
          created_by: createdBy,
          due_date: date,
          scheduled_time: template.scheduled_time,
          status: 'pending',
          priority: template.priority,
          estimated_duration: template.estimated_duration,
        });
        newTasks.push(task);
      });
    });
    
    return newTasks;
  },

  // ========== CHECK-INS ==========

  createCheckin(checkin: Omit<TeamCheckin, 'id' | 'created_at'>): TeamCheckin {
    const newCheckin: TeamCheckin = {
      ...checkin,
      id: `checkin-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    localCheckins.push(newCheckin);
    return newCheckin;
  },

  getTodayCheckins(memberId: string): TeamCheckin[] {
    const today = new Date().toISOString().split('T')[0];
    return localCheckins.filter(c => 
      c.member_id === memberId && 
      c.timestamp.startsWith(today)
    );
  },

  getMemberStats(memberId: string): MemberStats | null {
    const tasks = this.getTasksForMember(memberId);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const points = localPoints.get(memberId) || 0;
    
    return {
      id: memberId,
      nom: '',
      prenom: '',
      role: 'ouvrier_elevage' as TeamRole,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: totalTasks - completedTasks,
      completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      total_points: points,
    };
  },

  // ========== GAMIFICATION ==========

  addPoints(memberId: string, points: number, reason: string): void {
    const current = localPoints.get(memberId) || 0;
    localPoints.set(memberId, current + points);
    console.log(`Points ajoutés à ${memberId}: +${points} (${reason})`);
  },

  getLeaderboard(): MemberStats[] {
    const members = this.getAllMembers();
    return members.map(m => this.getMemberStats(m.id) || {
      id: m.id,
      nom: m.nom,
      prenom: m.prenom,
      role: m.role,
      total_tasks: 0,
      completed_tasks: 0,
      pending_tasks: 0,
      completion_rate: 0,
      total_points: localPoints.get(m.id) || 0,
    }).sort((a, b) => b.total_points - a.total_points);
  },

  getActiveChallenges(): TeamChallenge[] {
    // Défis simulés
    return [
      {
        id: 'challenge-1',
        title: 'Productivité Mars',
        description: 'Complétez 50 tâches ce mois',
        type: 'productivity',
        target_value: 50,
        current_value: 23,
        reward_amount: 25000,
        start_date: '2026-03-01',
        end_date: '2026-03-31',
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: 'challenge-2',
        title: 'Zéro Retard',
        description: 'Aucune tâche en retard pendant 2 semaines',
        type: 'punctuality',
        target_value: 14,
        current_value: 5,
        reward_amount: 15000,
        start_date: '2026-03-15',
        end_date: '2026-03-29',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];
  },

  getMemberBadges(memberId: string): TeamBadge[] {
    // Badges simulés selon les points
    const points = localPoints.get(memberId) || 0;
    const badges: TeamBadge[] = [];
    
    if (points >= 50) {
      badges.push({
        id: 'badge-1',
        member_id: memberId,
        badge_type: 'expert',
        badge_name: 'Expert',
        badge_icon: '⭐',
        description: '50+ points累计',
        earned_at: new Date().toISOString(),
        points: 50,
      });
    }
    
    return badges;
  },

  // ========== STATS ÉQUIPE ==========

  getTeamStats(): {
    totalMembers: number;
    activeMembers: number;
    totalTasksToday: number;
    completedTasksToday: number;
    completionRate: number;
  } {
    const members = this.getAllMembers();
    const today = new Date().toISOString().split('T')[0];
    const allTasks = this.getAllTasks({ due_date: today });
    
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => (m as any).statut === 'actif').length,
      totalTasksToday: allTasks.length,
      completedTasksToday: allTasks.filter(t => t.status === 'done').length,
      completionRate: allTasks.length > 0 
        ? Math.round((allTasks.filter(t => t.status === 'done').length / allTasks.length) * 100)
        : 0,
    };
  },
};

// Initialiser les données
initializeTasks();