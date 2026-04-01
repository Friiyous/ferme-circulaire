// =============================================
// SERVICE INVENTAIRE - Gestion des équipements (Mode Mock)
// =============================================

import type { Equipment, MaintenanceRecord, EquipmentStats, EquipmentCategory } from '../types/inventory';

// Données mock pour les équipements
const mockEquipment: Equipment[] = [];

const mockMaintenanceRecords: MaintenanceRecord[] = [];

export const InventoryService = {
  // ========== ÉQUIPEMENTS ==========

  getAllEquipment(): Equipment[] {
    return mockEquipment;
  },

  getEquipmentById(id: string): Equipment | null {
    return mockEquipment.find(e => e.id === id) || null;
  },

  getEquipmentByCategory(category: EquipmentCategory): Equipment[] {
    return mockEquipment.filter(e => e.categorie === category);
  },

  getEquipmentByStatus(status: string): Equipment[] {
    return mockEquipment.filter(e => e.statut === status);
  },

  createEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>): Equipment {
    const newEquipment: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockEquipment.push(newEquipment);
    return newEquipment;
  },

  updateEquipment(id: string, updates: Partial<Equipment>): Equipment | null {
    const index = mockEquipment.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    mockEquipment[index] = {
      ...mockEquipment[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockEquipment[index];
  },

  // ========== MAINTENANCE ==========

  getMaintenanceHistory(equipmentId: string): MaintenanceRecord[] {
    return mockMaintenanceRecords.filter(m => m.equipment_id === equipmentId);
  },

  addMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'created_at'>): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    mockMaintenanceRecords.push(newRecord);
    return newRecord;
  },

  // ========== STATISTIQUES ==========

  getEquipmentStats(): EquipmentStats {
    const actifs = mockEquipment.filter(e => e.statut === 'actif').length;
    const enMaintenance = mockEquipment.filter(e => e.statut === 'maintenance').length;
    const horsService = mockEquipment.filter(e => e.statut === 'hors-service').length;
    
    const valeurTotale = mockEquipment.reduce((sum, e) => sum + (e.valeur_actuelle || 0), 0);
    
    // Coût maintenance du mois (simulation)
    const coutMaintenanceMois = mockMaintenanceRecords
      .filter(m => {
        const date = new Date(m.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, m) => sum + m.cout, 0);

    return {
      total: mockEquipment.length,
      actifs,
      en_maintenance: enMaintenance,
      hors_service: horsService,
      valeur_totale: valeurTotale,
      cout_maintenance_mois: coutMaintenanceMois,
    };
  },

  // ========== ALERTES ==========

  getEquipmentAlerts(): { type: string; message: string; equipment: Equipment }[] {
    const alerts: { type: string; message: string; equipment: Equipment }[] = [];
    const now = new Date();

    mockEquipment.forEach(equipment => {
      // Équipements en maintenance
      if (equipment.statut === 'maintenance') {
        alerts.push({
          type: 'warning',
          message: 'Équipement en maintenance',
          equipment,
        });
      }

      // Entretien proche (7 jours)
      if (equipment.prochain_entretien) {
        const nextMaintenance = new Date(equipment.prochain_entretien);
        const daysUntil = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7 && daysUntil > 0) {
          alerts.push({
            type: 'info',
            message: `Entretien dans ${daysUntil} jour(s)`,
            equipment,
          });
        } else if (daysUntil <= 0) {
          alerts.push({
            type: 'error',
            message: 'Entretien en retard !',
            equipment,
          });
        }
      }

      // Équipements HS
      if (equipment.statut === 'hors-service') {
        alerts.push({
          type: 'error',
          message: 'Équipement hors service',
          equipment,
        });
      }
    });

    return alerts;
  },
};