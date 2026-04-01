// =============================================
// SERVICE D'ALERTES - Système d'alertes automatiques
// =============================================

import { mockAnimaux, mockParcelles, mockStocks, mockTaches } from './mockData';
import type { Animal, StockIntrant, Parcelle } from '../types';

// Alias pour compatibilité
const animals: Animal[] = mockAnimaux as Animal[];
const parcelles: Parcelle[] = mockParcelles as Parcelle[];
const stocks: StockIntrant[] = mockStocks as StockIntrant[];
const taches = mockTaches;

// Types d'alertes
export type AlertType = 'warning' | 'error' | 'info' | 'success';
export type AlertCategory = 'stock' | 'animal' | 'culture' | 'biogaz' | 'task' | 'weather';

export interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  severity: number; // 1-5, 5 étant le plus critique
  source?: string;
  createdAt: Date;
  read?: boolean;
  actionUrl?: string;
}

// Configuration des seuils
const THRESHOLDS = {
  stock: {
    minQuantity: 5, // Alerte si moins de 5 unités
    criticalQuantity: 2,
  },
  animal: {
    weightLossPercent: 10, // Alerte si perte > 10%
    noVaccinationDays: 30, // Alerte sipas de vaccin depuis 30 jours
  },
  culture: {
    minHumidity: 30, // Alerte si humidité < 30%
    maxTemperature: 40, // Alerte si température > 40°C
  },
  biogaz: {
    minTemp: 25, // Température minimum
    maxTemp: 45, // Température maximum
    minLevel: 20, // Niveau minimum
  },
};

// Vérifier les stocks
const checkStocks = (): Alert[] => {
  const alerts: Alert[] = [];
  const stockData = stocks || [];
  
  stockData.forEach((stock) => {
    const qty = stock.quantite || 0;
    const seuil = stock.seuilAlerte || THRESHOLDS.stock.minQuantity;
    
    if (qty <= THRESHOLDS.stock.criticalQuantity) {
      alerts.push({
        id: `stock-critical-${stock.id}`,
        type: 'error',
        category: 'stock',
        title: '🔴 Stock critique',
        message: `${stock.nom} : seulement ${qty} ${stock.unite} restant`,
        severity: 5,
        source: stock.id,
        createdAt: new Date(),
        actionUrl: '/alimentation',
      });
    } else if (qty <= seuil) {
      alerts.push({
        id: `stock-low-${stock.id}`,
        type: 'warning',
        category: 'stock',
        title: '⚠️ Stock faible',
        message: `${stock.nom} : ${qty} ${stock.unite} (seuil: ${seuil})`,
        severity: 3,
        source: stock.id,
        createdAt: new Date(),
        actionUrl: '/alimentation',
      });
    }
  });
  
  return alerts;
};

// Vérifier les animaux
const checkAnimals = (): Alert[] => {
  const alerts: Alert[] = [];
  const animalData = animals || [];
  
  animalData.forEach((animal) => {
    // Vérifier les vaccinations
    const lastVaccin = animal.vaccinations?.[0];
    if (lastVaccin) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastVaccin.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > THRESHOLDS.animal.noVaccinationDays) {
        alerts.push({
          id: `animal-vaccin-${animal.id}`,
          type: 'warning',
          category: 'animal',
          title: '💉 Vaccination requise',
          message: `${animal.id} : pas de vaccin depuis ${daysSince} jours`,
          severity: 3,
          source: animal.id,
          createdAt: new Date(),
          actionUrl: '/elevage',
        });
      }
    }
    
    // Vérifier le poids (si inférieur au précédent)
    if (animal.poids && animal.poids < 1) {
      alerts.push({
        id: `animal-weight-${animal.id}`,
        type: 'info',
        category: 'animal',
        title: '⚖️ Poids faible',
        message: `${animal.id} : ${animal.poids} kg - surveiller l'alimentation`,
        severity: 2,
        source: animal.id,
        createdAt: new Date(),
        actionUrl: '/elevage',
      });
    }
  });
  
  return alerts;
};

// Vérifier les cultures
const checkCultures = (): Alert[] => {
  const alerts: Alert[] = [];
  const parcelleData = parcelles || [];
  
  // Simuler des données d'humidité (en attendant les vrais capteurs)
  const simulatedHumidity = 45; // 45% en moyenne
  
  if (simulatedHumidity < THRESHOLDS.culture.minHumidity) {
    alerts.push({
      id: 'culture-humidity',
      type: 'warning',
      category: 'culture',
      title: '💧 Humidité sol faible',
      message: `Humidité actuelle: ${simulatedHumidity}% - Irriguer recommandé`,
      severity: 3,
      source: 'cultures',
      createdAt: new Date(),
      actionUrl: '/cultures',
    });
  }
  
  parcelleData.forEach((parcelle) => {
    if (parcelle.statut === 'en_jachère') {
      alerts.push({
        id: `culture-rest-${parcelle.id}`,
        type: 'info',
        category: 'culture',
        title: '🌱 Parcelle en repos',
        message: `${parcelle.nom} : période de repos terminée, prête pour nouvelle culture`,
        severity: 1,
        source: parcelle.id,
        createdAt: new Date(),
        actionUrl: '/cultures',
      });
    }
  });
  
  return alerts;
};

// Vérifier le biogaz
const checkBiogaz = (): Alert[] => {
  const alerts: Alert[] = [];
  
  // Simuler des données (en attendant les capteurs)
  const temp = 36;
  const niveau = 65;
  
  if (temp < THRESHOLDS.biogaz.minTemp) {
    alerts.push({
      id: 'biogaz-temp-low',
      type: 'error',
      category: 'biogaz',
      title: '❄️ Température basse',
      message: `Digesteur: ${temp}°C - processus de fermentation compromis`,
      severity: 5,
      source: 'biogaz',
      createdAt: new Date(),
      actionUrl: '/valorisation',
    });
  } else if (temp > THRESHOLDS.biogaz.maxTemp) {
    alerts.push({
      id: 'biogaz-temp-high',
      type: 'error',
      category: 'biogaz',
      title: '🔥 Température élevée',
      message: `Digesteur: ${temp}°C - risque de défaillance`,
      severity: 5,
      source: 'biogaz',
      createdAt: new Date(),
      actionUrl: '/valorisation',
    });
  }
  
  if (niveau < THRESHOLDS.biogaz.minLevel) {
    alerts.push({
      id: 'biogaz-level-low',
      type: 'warning',
      category: 'biogaz',
      title: '📉 Niveau biogaz faible',
      message: `Niveau actuel: ${niveau}% - prévoir l'alimentation en matière organique`,
      severity: 3,
      source: 'biogaz',
      createdAt: new Date(),
      actionUrl: '/valorisation',
    });
  }
  
  return alerts;
};

// Vérifier les tâches RH
const checkTasks = (): Alert[] => {
  const alerts: Alert[] = [];
  const tachData = taches || [];
  
  const overdueTasks = tachData.filter((t) => {
    return t.statut === 'en_cours' && new Date(t.dateEcheance) < new Date();
  });
  
  if (overdueTasks.length > 0) {
    alerts.push({
      id: 'tasks-overdue',
      type: 'error',
      category: 'task',
      title: '⏰ Tâches en retard',
      message: `${overdueTasks.length} tâche(s) en retard - action requise`,
      severity: 4,
      source: 'rh',
      createdAt: new Date(),
      actionUrl: '/rh',
    });
  }
  
  return alerts;
};

// Générer toutes les alertes
export const generateAllAlerts = (): Alert[] => {
  const allAlerts = [
    ...checkStocks(),
    ...checkAnimals(),
    ...checkCultures(),
    ...checkBiogaz(),
    ...checkTasks(),
  ];
  
  // Trier par sévérité (5 = plus critique)
  return allAlerts.sort((a, b) => b.severity - a.severity);
};

// Obtenir les alertes non lues
export const getUnreadAlerts = (): Alert[] => {
  return generateAllAlerts().filter(a => !a.read);
};

// Compter les alertes non lues par catégorie
export const getAlertCounts = (): Record<AlertCategory, number> => {
  const alerts = generateAllAlerts();
  const counts: Record<AlertCategory, number> = {
    stock: 0,
    animal: 0,
    culture: 0,
    biogaz: 0,
    task: 0,
    weather: 0,
  };
  
  alerts.forEach(alert => {
    counts[alert.category]++;
  });
  
  return counts;
};

// Marquer une alerte comme lue
export const markAsRead = (alertId: string): void => {
  // Ici on pourrait sauvegarder dans Supabase ou localStorage
  console.log(`Alerte ${alertId} marquée comme lue`);
};

// Formatter pour notification
export const formatAlertForNotification = (alert: Alert): string => {
  return `[${alert.type.toUpperCase()}] ${alert.title}\n${alert.message}`;
};