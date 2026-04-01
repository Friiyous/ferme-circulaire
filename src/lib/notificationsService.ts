'use client';

/**
 * Service de notifications intelligentes
 * Génère des alertes basées sur les données de la ferme
 */
import { stocksService, animalsService, transactionsService } from './crudService';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: 'stock' | 'animal' | 'finance' | 'task' | 'system';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Seuils de notification
const THRESHOLDS = {
  lowStock: 20, // Quantité minimum avant alerte
  upcomingVaccinationDays: 7, // Jours avant rappel vaccin
  lowTransactionBalance: 50000, // Solde minimum pour alerte finance
};

export const NotificationsService = {
  /**
   * Vérifie les stocks bas et génère des alertes
   */
  async checkLowStocks(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    try {
      const { data } = await stocksService.getAll();
      
      (data || []).forEach(stock => {
        const qty = stock.quantite || 0;
        if (qty < THRESHOLDS.lowStock) {
          notifications.push({
            id: `stock-${stock.id}`,
            title: `Stock bas: ${stock.nom}`,
            message: `Il ne reste que ${qty} ${stock.unite} de "${stock.nom}". Veuillez réapprovisionner.`,
            priority: qty < 5 ? 'critical' : 'high',
            category: 'stock',
            read: false,
            createdAt: new Date(),
            actionUrl: '/inventaire',
          });
        }
      });
    } catch (error) {
      console.error('Erreur vérification stocks:', error);
    }
    
    return notifications;
  },

  /**
   * Vérifie les vaccinations à venir
   */
  async checkUpcomingVaccinations(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    try {
      const { data } = await animalsService.getAll();
      
      (data || []).forEach(animal => {
        // Simuler une date de vaccination (en production, cela viendrait de la base)
        const daysUntilVaccin = Math.floor(Math.random() * 14);
        
        if (daysUntilVaccin <= THRESHOLDS.upcomingVaccinationDays) {
          notifications.push({
            id: `vaccin-${animal.id}`,
            title: `Rappel vaccination - ${animal.code}`,
            message: `Vaccination prévue dans ${daysUntilVaccin} jour(s) pour ${animal.espece}.`,
            priority: daysUntilVaccin <= 3 ? 'high' : 'normal',
            category: 'animal',
            read: false,
            createdAt: new Date(),
            actionUrl: '/elevage',
          });
        }
      });
    } catch (error) {
      console.error('Erreur vérification vaccinations:', error);
    }
    
    return notifications;
  },

  /**
   * Vérifie les transactions importantes
   */
  async checkImportantTransactions(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    try {
      const { data } = await transactionsService.getAll();
      
      // Calculer les revenus/dépenses du mois
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthTransactions = (data || []).filter(t => 
        new Date(t.date) >= monthStart
      );
      
      const totalDepenses = monthTransactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + (t.montant || 0), 0);
      
      const totalRevenus = monthTransactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + (t.montant || 0), 0);
      
      // Alerte si dépenses > revenus (tentative de détection de problème)
      if (totalDepenses > totalRevenus * 1.5) {
        notifications.push({
          id: 'finance-warning',
          title: 'Alerte financière',
          message: `Les dépenses du mois (${totalDepenses.toLocaleString()} FCFA) dépassent significativement les revenus (${totalRevenus.toLocaleString()} FCFA).`,
          priority: 'high',
          category: 'finance',
          read: false,
          createdAt: new Date(),
          actionUrl: '/finances',
        });
      }
    } catch (error) {
      console.error('Erreur vérification transactions:', error);
    }
    
    return notifications;
  },

  /**
   * Récupère toutes les notifications
   */
  async getAllNotifications(): Promise<Notification[]> {
    const [stockAlerts, vaccinationAlerts, transactionAlerts] = await Promise.all([
      this.checkLowStocks(),
      this.checkUpcomingVaccinations(),
      this.checkImportantTransactions(),
    ]);

    return [
      ...stockAlerts,
      ...vaccinationAlerts,
      ...transactionAlerts,
    ].sort((a, b) => {
      // Trier par priorité (critical en premier)
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: string): void {
    // En production, ceci mettrait à jour la base de données
    console.log(`Notification ${notificationId} marquée comme lue`);
  },

  /**
   * Nombre de notifications non lues
   */
  getUnreadCount(notifications: Notification[]): number {
    return notifications.filter(n => !n.read).length;
  },
};

// Exporter pour utilisation directe
export default NotificationsService;