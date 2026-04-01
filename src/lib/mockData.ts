import type {
  Animal, Parcelle, StockIntrant, Transaction, FormuleAliment,
  DigesteurBiogaz, BacCompost, BacBSF, AlerteFerme, KPIData, Production,
  Employe, TacheHR
} from '@/types';

// =============================================
// DONNÉES VIDES — PRÊTES POUR SAISIE
// =============================================

// Tableau vide prêt pour les animaux
export const mockAnimaux: Animal[] = [];

// Tableau vide prêt pour les parcelles
export const mockParcelles: Parcelle[] = [];

// Tableau vide prêt pour les stocks
export const mockStocks: StockIntrant[] = [];

// Tableau vide prêt pour les transactions
export const mockTransactions: Transaction[] = [];

// Digesteur vide
export const mockDigesteur: DigesteurBiogaz = {
  id: '',
  nom: 'Nouveau Digesteur',
  volume: 0,
  niveauActuel: 0,
  productionGazJour: 0,
  bioSlurryJour: 0,
  dernierNettoyage: new Date().toISOString(),
  statut: 'inactif',
};

// Bacs de compost vides
export const mockBacsCompost: BacCompost[] = [];

// Bacs BSF vides
export const mockBacsBSF: BacBSF[] = [];

// Formules alimentaires vides
export const mockFormules: FormuleAliment[] = [];

// Alertes vides
export const mockAlertes: AlerteFerme[] = [];

// KPIs vierges
export const mockKPIs: KPIData = {
  autonomieAlimentaire: 0,
  animauxActifs: 0,
  totalAnimaux: 0,
  recolteSemaine: 0,
  revenuMois: 0,
  depenseMois: 0,
  tauxMortalite: 0,
  stocksAlerts: 0,
  productionTotal: 0,
  circulariteScore: 0,
};

// Employés vides
export const mockEmployes: Employe[] = [];

// Tâches vides
export const mockTaches: TacheHR[] = [];

// Fonctions vides pour graphiques
const _productionOeufsData: any[] = [];
const _cashflowData: any[] = [];
const _autonomieData: any[] = [];
const _repartitionData: any[] = [];

export const getProductionOeufs = () => _productionOeufsData;
export const getCashflowMois = () => _cashflowData;
export const getAutonomieEvolution = () => _autonomieData;
export const getRepartitionCouts = () => _repartitionData;

// Alias vides
export const mockProductionOeufs = _productionOeufsData;
export const mockCashflowMois = _cashflowData;
export const mockAutonomieEvolution = _autonomieData;
export const mockRepartitionCouts = _repartitionData;