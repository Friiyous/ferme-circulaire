// =============================================
// SERVICE PLANNING - Gestion du calendrier (Mode Mock)
// =============================================

import type { PlanningEvent, PlanningStats, EventType, EventStatus } from '../types/planning';
import { mockParcelles } from './mockData';

// Events mock - vide
const mockEvents: PlanningEvent[] = [];

// Events pour le mois en cours - vide
const currentMonthEvents: PlanningEvent[] = [];

export const PlanningService = {
  // ========== ÉVÉNEMENTS ==========

  getAllEvents(): PlanningEvent[] {
    return [...mockEvents, ...currentMonthEvents];
  },

  getEventsByMonth(year: number, month: number): PlanningEvent[] {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    return this.getAllEvents().filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  },

  getEventsByDate(date: string): PlanningEvent[] {
    return this.getAllEvents().filter(event => event.start_date === date);
  },

  getEventsByType(type: EventType): PlanningEvent[] {
    return this.getAllEvents().filter(e => e.type === type);
  },

  getEventsByStatus(status: EventStatus): PlanningEvent[] {
    return this.getAllEvents().filter(e => e.status === status);
  },

  getUpcomingEvents(days: number = 7): PlanningEvent[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.getAllEvents()
      .filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate >= now && eventDate <= future && event.status !== 'termine' && event.status !== 'annule';
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  },

  createEvent(event: Omit<PlanningEvent, 'id' | 'created_at' | 'updated_at'>): PlanningEvent {
    const newEvent: PlanningEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  updateEvent(id: string, updates: Partial<PlanningEvent>): PlanningEvent | null {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    mockEvents[index] = {
      ...mockEvents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockEvents[index];
  },

  // ========== STATISTIQUES ==========

  getPlanningStats(): PlanningStats {
    const events = this.getAllEvents();
    const now = new Date();
    
    const termines = events.filter(e => e.status === 'termine').length;
    const enCours = events.filter(e => e.status === 'en-cours').length;
    const planifies = events.filter(e => e.status === 'planifie').length;
    const enRetard = events.filter(e => {
      if (e.status === 'termine' || e.status === 'annule') return false;
      const eventDate = new Date(e.start_date);
      return eventDate < now;
    }).length;

    return {
      total_events: events.length,
      termines,
      en_cours: enCours,
      planifies,
      en_retard: enRetard,
    };
  },

  // ========== PARCELLES ==========

  getParcellesWithActiveEvents(): { parcelle: any; events: PlanningEvent[] }[] {
    const parcelles = mockParcelles as any[];
    
    return parcelles.map(parcelle => ({
      parcelle,
      events: this.getAllEvents().filter(e => e.parcelle_id === parcelle.id),
    })).filter(p => p.events.length > 0);
  },
};