// =============================================
// RAPPORTS AUTOMATIQUES - Générateur de rapports
// =============================================

import { 
  mockAnimaux, mockParcelles, mockTransactions 
} from './mockData';

// Types pour les rapports
export interface ReportData {
  title: string;
  dateRange: { start: string; end: string };
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  icon: string;
  metrics: Metric[];
  observations: string[];
}

export interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'error' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
}

// Formatage des dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  });
};

// Générer rapport hebdomadaire
export const generateWeeklyReport = (): ReportData => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const poulailler = mockAnimaux.filter(a => a.espece === 'poule');
  const cultures = mockParcelles;
  const transactions = mockTransactions;
  
  // Calculs revenus/dépenses semaine
  const revenues = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0);
  
  const benefit = revenues - expenses;
  
  // Statistiques poulailler
  const activePoules = poulailler.filter(a => a.statut === 'actif').length;
  // Simuler la production d'œufs pour la semaine
  const totalEggs = activePoules * 6; // ~6 œufs par poule/semaine
  
  return {
    title: 'Rapport Hebdomadaire - Ferme Circulaire',
    dateRange: {
      start: formatDate(weekAgo),
      end: formatDate(now)
    },
    generatedAt: formatDate(now),
    sections: [
      {
        title: '🐔 Poulailler',
        icon: '🐔',
        metrics: [
          { label: 'Effectif actif', value: activePoules, unit: 'têtes', status: 'neutral' },
          { label: 'Œufs collectés', value: totalEggs, unit: 'units', status: 'good', trend: 'up' },
          { label: 'Température moyenne', value: 31, unit: '°C', status: 'good' },
        ],
        observations: [
          `Ponte stable cette semaine avec ${totalEggs} œufs collectés.`,
          'Aucune alerte sanitaire détectée.',
          'Consommation alimentaire normale.'
        ]
      },
      {
        title: '🌱 Cultures',
        icon: '🌱',
        metrics: [
          { label: 'Parcelles actives', value: cultures.filter(p => p.statut === 'en_culture').length, unit: 'parcelles', status: 'neutral' },
          { label: 'Surface totale', value: cultures.reduce((sum, p) => sum + (p.surface || 0), 0), unit: 'm²', status: 'neutral' },
        ],
        observations: [
          'Suivi irrigation normal.',
          'Prochaine rotation prévue semaine prochaine.'
        ]
      },
      {
        title: '⚡ Biogaz',
        icon: '⚡',
        metrics: [
          { label: 'Production estimée', value: 3.2, unit: 'm³/jour', status: 'good' },
          { label: 'Température digesteur', value: 36, unit: '°C', status: 'good' },
        ],
        observations: [
          'Production stable, temporairement en демо.',
          'Compost généré: 18kg vers épandage.'
        ]
      },
      {
        title: '💰 Situation Financière',
        icon: '💰',
        metrics: [
          { label: 'Revenus', value: revenues, unit: 'FCFA', status: 'good' },
          { label: 'Dépenses', value: expenses, unit: 'FCFA', status: 'warning' },
          { label: 'Bénéfice', value: benefit, unit: 'FCFA', status: benefit > 0 ? 'good' : 'error' },
        ],
        observations: [
          `Marge brute: ${Math.round((benefit / revenues) * 100)}% cette semaine.`,
          'Économies compost: ~45,000 CFA non comptabilisé.',
          'Prévoyance: provisionnier pour saison sèche.'
        ]
      }
    ]
  };
};

// Générer rapport mensuel
export const generateMonthlyReport = (): ReportData => {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const transactions = mockTransactions;
  const animals = mockAnimaux;
  const parcelles = mockParcelles;
  
  const revenues = transactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0);
  
  return {
    title: 'Rapport Mensuel - Ferme Circulaire',
    dateRange: {
      start: formatDate(monthAgo),
      end: formatDate(now)
    },
    generatedAt: formatDate(now),
    sections: [
      {
        title: '📊 Synthèse Globale',
        icon: '📊',
        metrics: [
          { label: 'Revenus totaux', value: revenues, unit: 'FCFA', status: 'good', trend: 'up' },
          { label: 'Dépenses totales', value: expenses, unit: 'FCFA', status: 'neutral' },
          { label: 'Bénéfice net', value: revenues - expenses, unit: 'FCFA', status: (revenues - expenses) > 0 ? 'good' : 'error' },
        ],
        observations: [
          'ROI du projet en bonne voie.',
          'Objectif季度: marge >50% en cours.'
        ]
      },
      {
        title: '🐔 Élevage',
        icon: '🐔',
        metrics: [
          { label: 'Total animaux', value: animals.length, unit: 'têtes', status: 'neutral' },
          { label: 'Espèces', value: new Set(animals.map(a => a.espece)).size, unit: 'types', status: 'neutral' },
        ],
        observations: [
          '健康管理 en place.',
          'Vaccinations à jour.'
        ]
      },
      {
        title: '🌾 Agriculture',
        icon: '🌾',
        metrics: [
          { label: 'Parcelles', value: parcelles.length, unit: 'parcelles', status: 'neutral' },
          { label: 'dont cultivées', value: parcelles.filter(p => p.statut === 'en_culture').length, unit: 'parcelles', status: 'good' },
        ],
        observations: [
          'Rotation respectée.',
          'Engrais organique privilégie.'
        ]
      }
    ]
  };
};

// Exporter en format texte (pour WhatsApp/Email)
export const exportToText = (report: ReportData): string => {
  let text = `📄 ${report.title}\n`;
  text += `📅 ${report.dateRange.start} - ${report.dateRange.end}\n`;
  text += `Généré le: ${report.generatedAt}\n\n`;
  
  for (const section of report.sections) {
    text += `\n${section.icon} ${section.title}\n`;
    text += '─'.repeat(30) + '\n';
    
    for (const metric of section.metrics) {
      const trendIcon = metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️';
      const statusIcon = metric.status === 'good' ? '✅' : metric.status === 'warning' ? '⚠️' : metric.status === 'error' ? '❌' : 'ℹ️';
      text += `• ${metric.label}: ${metric.value}${metric.unit ? ' ' + metric.unit : ''} ${trendIcon} ${statusIcon}\n`;
    }
    
    text += '\n📝 Observations:\n';
    for (const obs of section.observations) {
      text += `  - ${obs}\n`;
    }
  }
  
  text += '\n\n---\nFerme Circulaire CI 🇨🇮';
  return text;
};

// Formatter pour JSON (pour API)
export const exportToJSON = (report: ReportData): string => {
  return JSON.stringify(report, null, 2);
};