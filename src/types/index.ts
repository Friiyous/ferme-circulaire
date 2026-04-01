// =============================================
// TYPES PRINCIPAUX — Ferme Circulaire
// =============================================

// =============================================
// NOUVELLES ESPÈCES D'ÉLEVAGE (Adaptées Côte d'Ivoire - Nord)
// =============================================

export type EspeceAnimal = 
  // Volailles
  | 'poule' | 'canard' | 'pintade' | 'dinde' | 'oie'
  // Ruminants
  | 'chevre' | 'mouton' | 'bovin'
  // Petits animaux
  | 'lapin' | 'porc'
  // Aquaculture
  | 'tilapia' | 'silure'
  // Insectes
  | 'bsf';

export type StatutAnimal = 'actif' | 'malade' | 'vendu' | 'mort' | 'abattu';
export type SexeAnimal = 'M' | 'F';

// =============================================
// SYSTÈME DE ROTATION ET LIAISONS CIRCULAIRES
// =============================================

export interface CycleProduction {
  id: string;
  nom: string;
  type: 'elevage' | 'culture' | 'valorisation';
  dureeJours: number;
  intrants: { type: string; quantite: number; origine: 'local' | 'achat' }[];
  produitts: { type: string; quantite: number; destination: string }[];
}

export interface LiaisonCirculaire {
  id: string;
  entree: string; // Ce qui entre dans le cycle
  sortie: string; // Ce qui sort du cycle
  typeLiaison: 'fumier' | 'residus' | 'compost' | 'biogaz' | 'larves' | 'lait' | 'viande' | 'oeufs';
  eficacite: number; // % de transformation
}

// =============================================
// CYCLE DE VIE ANIMAL (Naissance → Croissance → Production → Vente)
// =============================================

export type StadeCycle = 'poussin' | 'jeune' | 'adulte' | 'production' | 'reforme';

export interface CycleVie {
  id: string;
  animalId: string;
  stade: StadeCycle;
  dateDebut: string;
  dateFin?: string;
  poidsDebut: number;
  poidsFin?: number;
  observations?: string;
}

// Configuration des cycles par espece (jours)
export const CYCLES_PAR_ESPECE: Record<EspeceAnimal, {
  croissance: number; // jours avant production
  production: number; // jours en production
  reforme: number; // jours avant reforme
  poidsAdulte: number; // kg
  prixVente: number; // FCA
  coutProduction: number; // FCA/jour
}> = {
  poules: { croissance: 120, production: 365, reforme: 730, poidsAdulte: 2.5, prixVente: 5000, coutProduction: 35 },
  canards: { croissance: 90, production: 300, reforme: 600, poidsAdulte: 3.5, prixVente: 8000, coutProduction: 45 },
  pintades: { croissance: 150, production: 400, reforme: 800, poidsAdulte: 2.2, prixVente: 6000, coutProduction: 40 },
  dinde: { croissance: 180, production: 365, reforme: 730, poidsAdulte: 8, prixVente: 15000, coutProduction: 80 },
  oie: { croissance: 180, production: 400, reforme: 900, poidsAdulte: 5, prixVente: 12000, coutProduction: 60 },
  chevre: { croissance: 270, production: 1460, reforme: 2190, poidsAdulte: 35, prixVente: 45000, coutProduction: 80 },
  mouton: { croissance: 210, production: 1095, reforme: 1825, poidsAdulte: 30, prixVente: 40000, coutProduction: 70 },
  bovin: { croissance: 730, production: 2555, reforme: 3650, poidsAdulte: 300, prixVente: 350000, coutProduction: 250 },
  lapin: { croissance: 60, production: 300, reforme: 730, poidsAdulte: 2.5, prixVente: 3500, coutProduction: 20 },
  porc: { croissance: 180, production: 365, reforme: 730, poidsAdulte: 100, prixVente: 75000, coutProduction: 120 },
  tilapia: { croissance: 120, production: 365, reforme: 730, poidsAdulte: 0.5, prixVente: 1500, coutProduction: 5 },
  silure: { croissance: 180, production: 365, reforme: 730, poidsAduste: 2, prixVente: 5000, coutProduction: 15 },
  bsf: { croissance: 14, production: 21, reforme: 28, poidsAdulte: 0.02, prixVente: 500, coutProduction: 2 },
};

// =============================================
// VACCINATION AUTOMATIQUE
// =============================================

export type TypeVaccin = 'newcastle' | 'gumboro' | 'variole' | 'pasteurellose' | 'brucellose' | 'fievre_catarrhale';

export interface CalendrierVaccinal {
  id: string;
  espece: EspeceAnimal;
  typeVaccin: TypeVaccin;
  agePremiereDose: number; // jours
  rappelIntervalle: number; // jours
  efficacite: number; // %
  cout: number; // FCA
}

export const CALENDRIER_VACCINAL: CalendrierVaccinal[] = [
  { id: 'v1', espece: 'poule', typeVaccin: 'newcastle', agePremiereDose: 7, rappelIntervalle: 30, efficacite: 95, cout: 150 },
  { id: 'v2', espece: 'poule', typeVaccin: 'gumboro', agePremiereDose: 14, rappelIntervalle: 60, efficacite: 90, cout: 100 },
  { id: 'v3', espece: 'poule', typeVaccin: 'variole', agePremiereDose: 28, rappelIntervalle: 180, efficacite: 85, cout: 80 },
  { id: 'v4', espece: 'chevre', typeVaccin: 'pasteurellose', agePremiereDose: 60, rappelIntervalle: 180, efficacite: 80, cout: 500 },
  { id: 'v5', espece: 'mouton', typeVaccin: 'fievre_catarrhale', agePremiereDose: 90, rappelIntervalle: 365, efficacite: 85, cout: 400 },
];

// =============================================
// ÉLEVAGE AVEC PRODUCTION
// =============================================

export interface Vaccination {
  id: string;
  animalId: string;
  type: string;
  date: string;
  prochaineDate: string;
  veterinaire: string;
  vaccine: TypeVaccin;
  statut: 'fait' | 'a_faire' | 'retard';
  notes?: string;
}

export interface Production {
  id: string;
  animalId?: string;
  espece: EspeceAnimal;
  date: string;
  type: 'oeufs' | 'lait' | 'viande' | 'fumier' | 'larves';
  quantite: number; // œufs: unités, lait: litres, viande: kg, fumier: kg, larves: kg
  prixUnitaire: number; // FCA
}

export interface Animal {
  id: string;
  code: string; // ID unique ex: PL-001
  espece: EspeceAnimal;
  race: string;
  dateNaissance: string;
  poids: number; // kg
  sexe: SexeAnimal;
  statut: StatutAnimal;
  localisation: string;
  dateEntree: string;
  notes?: string;
  vaccinations?: Vaccination[];
  productions?: Production[];
  capaciteProduction?: number; // Production journalière estimée
}

// Configuration des races par région
export const RACES_PAR_REGION: Record<string, Record<EspeceAnimal, string[]>> = {
  'nord-cote-ivoire': {
    // Volailles
    poules: ['Cobb 500', 'ISA Brown', 'Local', 'Sasso'],
    canards: ['Pékin', 'Muscovy', 'Local'],
    pintades: ['Gris', 'Perlé', 'Local'],
    dinde: ['Bronze', 'Blanc', 'Local'],
    oie: ['Embden', 'Chinoise'],
    // Ruminants
    chevre: ['Sahélienne', 'Naine', 'Djallonké', 'Saanen'],
    mouton: ['Djallonké', 'Kédah', 'Merah'],
    bovin: ['N\'Dama', 'Baoulé', 'Zebu', 'Somalie'],
    // Petits animaux
    lapin: ['Local', 'Géant', 'Néozélandais'],
    porc: ['Local', 'Large White', 'Landrace'],
    // Aquaculture
    tilapia: ['Nilotica', 'Mugil', 'Local'],
    silure: ['Clarias', 'Heterobranchus'],
    // Insectes
    bsf: ['Hermetia illucens'],
  }
};

// Besoins alimentaires par espèce (kg/jour)
export const BESOINS_ALIMENTAIRES: Record<EspeceAnimal, { mini: number; maxi: number; proteines: number }> = {
  // Volailles
  poules: { mini: 0.1, maxi: 0.15, proteines: 16 },
  canards: { mini: 0.15, maxi: 0.2, proteines: 18 },
  pintades: { mini: 0.12, maxi: 0.18, proteines: 17 },
  dinde: { mini: 0.2, maxi: 0.3, proteines: 20 },
  oie: { mini: 0.2, maxi: 0.25, proteines: 14 },
  // Ruminants
  chevre: { mini: 1.5, maxi: 2.5, proteines: 12 },
  mouton: { mini: 1.2, maxi: 2.0, proteines: 12 },
  bovin: { mini: 8, maxi: 15, proteines: 10 },
  // Petits animaux
  lapin: { mini: 0.1, maxi: 0.15, proteines: 16 },
  porc: { mini: 2, maxi: 3.5, proteines: 14 },
  // Aquaculture
  tilapia: { mini: 0.02, maxi: 0.05, proteines: 28 },
  silure: { mini: 0.03, maxi: 0.08, proteines: 35 },
  // Insectes
  bsf: { mini: 0.001, maxi: 0.002, proteines: 60 },
};

export interface RationJournaliere {
  id: string;
  date: string;
  espece: EspeceAnimal;
  quantiteTotale: number; // kg
  coutTotal: number; // FCFA
  autonomiePourcentage: number;
  ingredients: { nom: string; quantite: number; origine: 'local' | 'achat' }[];
}

// =============================================
// CULTURES ADAPTÉES RÉGION NORD (Korhogo)
// =============================================

export type TypeIrrigation = 'pluvial' | 'goutte' | 'aspersion' | 'manuel' | 'bassine';
export type DestinationRecolte = 'vente' | 'alimentation_betail' | 'semence' | 'consommation_ferme' | 'transformation';
export type StatutParcelle = 'en_culture' | 'en_jachère' | 'preparation' | 'disponible';

// Cultures adaptées au climat nord Côte d'Ivoire
export type CultureType = 
  // Cereales
  | 'mais' | 'riz' | 'mil' | 'sorgho'
  // Legumineuses
  | 'niebe' | 'arachide' | 'soja' | 'niébé'
  // Cultures de rente
  | 'coton' | 'café' | 'cacao' | 'anacarde'
  // Maraichage
  | 'tomate' | 'poivron' | 'gombo' | 'aubergine' | 'oignon' | 'ail' | 'choux' | 'carotte'
  // Fourrageres
  | 'brachiaria' | 'panicum' | 'stylosanthes' | 'mucuna'
  // Fruitiers
  | 'mangue' | 'orange' | 'papaye' | 'banane' | 'ananas';

export interface Intrant {
  id: string;
  type: 'semence' | 'engrais' | 'pesticide' | 'autre';
  nom: string;
  quantite: number;
  unite: string;
  cout: number; // FCFA
  date: string;
}

export interface CultureHistorique {
  id: string;
  parcelleId: string;
  culture: string;
  dateSemis: string;
  dateRecoltePrevu: string;
  dateRecolteEffective?: string;
  rendement?: number; // kg
  destination: DestinationRecolte;
  intrants: Intrant[];
  notes?: string;
}

export interface Parcelle {
  id: string;
  nom: string;
  surface: number; // m²
  typeSol: string;
  localisation: string;
  irrigation: TypeIrrigation;
  statut: StatutParcelle;
  historique: CultureHistorique[];
  cultureActuelle?: string;
  rotationPrecedente?: string;
}

// Configuration des cultures par saison
export const CALENDRIER_CULTURES: Record<string, { culture: string; semis: string; recolte: string; rendement: number; destination: DestinationRecolte }[]> = {
  'saison_pluies': [
    { culture: 'Maïs', semis: 'Avril-Mai', recolte: 'Août-Sept', rendimiento: 4000, destination: 'alimentation_betail' },
    { culture: 'Niébé', semis: 'Juin', recolte: 'Sept-Oct', rendimiento: 800, destination: 'alimentation_betail' },
    { culture: 'Arachide', semis: 'Mai-Juin', recolte: 'Sept-Oct', rendimiento: 1200, destination: 'vente' },
    { culture: 'Sorgho', semis: 'Mai-Juin', recolte: 'Sept-Oct', rendimiento: 2500, destination: 'alimentation_betail' },
    { culture: 'Mil', semis: 'Juin', recolte: 'Oct-Nov', rendimiento: 1500, destination: 'alimentation_betail' },
  ],
  'saison_seche': [
    { culture: 'Oignon', semis: 'Nov-Dec', recolte: 'Fev-Mars', rendimiento: 20000, destination: 'vente' },
    { culture: 'Tomate', semis: 'Nov-Dec', recolte: 'Jan-Fev', rendement: 25000, destination: 'vente' },
    { culture: 'Poivron', semis: 'Nov-Dec', recolte: 'Jan-Fev', rendement: 15000, destination: 'vente' },
    { culture: 'Gombo', semis: 'Dec-Jan', recolte: 'Mars-Avril', rendimiento: 8000, destination: 'vente' },
  ],
  'perenne': [
    { culture: 'Manguier', semis: 'Juin', recolte: 'Avril-Juin', rendimiento: 50000, destination: 'vente' },
    { culture: 'Anacardier', semis: 'Juin', recolte: 'Jan-Mars', rendimiento: 3000, destination: 'vente' },
    { culture: 'Brachiaria', semis: 'Mai-Juin', recolte: ' Continue', rendimiento: 8000, destination: 'alimentation_betail' },
  ]
};

// =============================================
// VALORISATION DÉCHETS - SYSTÈME CIRculaire
// =============================================

export interface DigesteurBiogaz {
  id: string;
  nom: string;
  volume: number; // m³
  niveauActuel: number; // %
  productionGazJour: number; // m³/jour
  bioSlurryJour: number; // kg/jour
  dernierNettoyage: string;
  statut: 'actif' | 'maintenance' | 'inactif';
}

export type MaturiteCompost = 'frais' | 'en_cours' | 'pret' | 'utilise';

export interface BacCompost {
  id: string;
  nom: string;
  type: 'chaud' | 'froid' | 'vermi' | 'mixte';
  dateCreation: string;
  maturite: MaturiteCompost;
  quantiteEstimee: number; // kg
  ingredients: string[];
  notes?: string;
}

export type StadeBSF = 'oeufs' | 'larves_jeunes' | 'larves_matures' | 'nymphe' | 'adulte';

export interface BacBSF {
  id: string;
  nom: string;
  dateDemarrage: string;
  stade: StadeBSF;
  quantiteDechets: number; // kg déchets mis
  quantiteRecoltee?: number; // kg larves récoltées
  statut: 'actif' | 'recolte' | 'sechage' | 'stocke' | 'termine';
  notes?: string;
}

export interface FluxDechet {
  id: string;
  date: string;
  type: 'entree' | 'sortie';
  categorie: 'fumier' | 'dechets_cuisine' | 'residus_cultures' | 'biogaz' | 'compost' | 'bsf';
  quantite: number; // kg ou m³
  source: string;
  destination: string;
}

// =============================================
// ALIMENTATION BÉTAIL - AUTOSUFFISANCE
// =============================================

export type CategorieStock = 
  | 'grains' 
  | 'tourteau' 
  | 'fourrage' 
  | 'mineral' 
  | 'additif' 
  | 'bsf'
  | 'farine_poisson'
  | 'semence'
  | 'engrais';

export interface StockIntrant {
  id: string;
  nom: string;
  categorie: CategorieStock;
  quantite: number;
  unite: string;
  unitePrix?: string;
  uniteMesure?: string;
  seuilAlerte: number;
  dateEntree: string;
  datePeremption?: string;
  prix: number;
  origine: 'local' | 'achat';
  localisation: string;
  productionLocale?: boolean; // Produit sur la ferme
}

export interface IngredientFormule {
  stockId: string;
  nom: string;
  pourcentage: number; // %
  quantitePour100kg: number; // kg
  cout: number; // FCFA pour cette quantité
}

export interface FormuleAliment {
  id: string;
  nom: string;
  especeCible: EspeceAnimal;
  stade: 'demarrage' | 'croissance' | 'finition' | 'ponte' | 'entretien' | 'reproduction';
  ingredients: IngredientFormule[];
  coutPour100kg: number; // FCFA
  proteinesBrutes: number; // %
  energie: number; // kcal/kg
  autonomiePourcentage: number; // % ingrédients locaux
}

// Formule locale optimisée pour le Nord CI
export const FORMULES_LOCALES: Partial<FormuleAliment>[] = [
  {
    nom: 'Ponte Tropicale',
    especeCible: 'poule',
    stade: 'ponte',
    proteinesBrutes: 17,
    energie: 2700,
    autonomiePourcentage: 75,
  },
  {
    nom: 'Croissance Poussins',
    especeCible: 'poule',
    stade: 'demarrage',
    proteinesBrutes: 22,
    energie: 2900,
    autonomiePourcentage: 70,
  },
  {
    nom: 'Engraissement Porcs',
    especeCible: 'porc',
    stade: 'finition',
    proteinesBrutes: 15,
    energie: 3200,
    autonomiePourcentage: 60,
  },
];

// =============================================
// FINANCES ET COMPTABILITÉ
// =============================================

export type TypeTransaction = 'revenu' | 'depense';
export type ModuleFerme = 'elevage' | 'cultures' | 'valorisation' | 'alimentation' | 'infrastructure';

export interface Transaction {
  id: string;
  date: string;
  type: TypeTransaction;
  categorie: string;
  montant: number; // FCFA
  description: string;
  module: ModuleFerme;
  moduleConcerne?: string;
  quantite?: number;
  unite?: string;
}

// =============================================
// DASHBOARD ET KPIs AVANCÉS
// =============================================

export interface AlerteFerme {
  id: string;
  type: 'vaccination' | 'stock_critique' | 'recolte' | 'maintenance' | 'sante';
  priorite: 'faible' | 'normale' | 'haute' | 'urgente';
  message: string;
  date: string;
  module: ModuleFerme | 'elevage';
  resolved: boolean;
}

export interface KPIData {
  autonomieAlimentaire: number; // %
  animauxActifs: number;
  recolteSemaine: number; // kg
  revenuMois: number; // FCFA
  depenseMois: number; // FCFA
  totalAnimaux: number;
  tauxMortalite: number; // %
  stocksAlerts: number;
  productionTotal: number; // Valeur production
  circulariteScore: number; // %循环性
}

export interface CircuitCircularite {
  id: string;
  nom: string;
  flux: { entree: string; sortie: string; pourcentage: number }[];
  coutEconomie: number; // FCA économisés
}

// =============================================
// RESSOURCES HUMAINES
// =============================================

export type RoleHR = 'propriétaire' | 'gestionnaire' | 'ouvrier_qualifié' | 'manoeuvre' | 'veterinaire' | 'technicien' | 'gardien';
export type StatutHR = 'actif' | 'conges' | 'maladie' | 'inactif' | 'vacataire';

export interface Employe {
  id: string;
  matricule: string;
  nom: string;
  preNom: string;
  role: RoleHR;
  departement: 'direction' | 'elevage' | 'cultures' | 'valorisation' | 'maintenance';
  dateEmbauche: string;
  salaireMensuel: number;
  contact: string;
  statut: StatutHR;
  avatar?: string;
  managerId?: string;
}

export type PrioriteTache = 'basse' | 'moyenne' | 'haute' | 'urgente';
export type StatutTache = 'a_faire' | 'en_cours' | 'termine' | 'annule';

export interface TacheHR {
  id: string;
  titre: string;
  description: string;
  assigneeId: string;
  createurId: string;
  dateCreation: string;
  dateEcheance: string;
  priorite: PrioriteTache;
  statut: StatutTache;
  points: number;
  moduleLie?: string;
}

// =============================================
// CONFIGURATION FERME 1 HECTARE - KORHOGO
// =============================================

export interface FermeConfig {
  superficieTotale: number; // m² (1 ha = 10000 m²)
  localisation: string;
  region: 'nord-cote-ivoire';
  
  // Répartition des espaces
  elevage: {
    poulailler: number;
    bergerie: number;
    etable: number;
    clapiers: number;
    porcherie: number;
    aquaculture: number;
  };
  
  cultures: {
    cereales: number;
    legumes: number;
    fourrageres: number;
    fruitiers: number;
  };
  
  valorisation: {
    biogas: number;
    compost: number;
    bsf: number;
  };
  
  stockage: {
    silo: number;
    hangar: number;
  };
}

// Configuration recommandée pour 1 hectare à Korhogo
export const FERME_1HA_KORHOGO: FermeConfig = {
  superficieTotale: 10000,
  localisation: 'Korhogo, Nord Côte d\'Ivoire',
  region: 'nord-cote-ivoire',
  
  elevage: {
    poulailler: 150, // 150 m²
    bergerie: 200,
    etable: 300,
    clapiers: 50,
    porcherie: 100,
    aquaculture: 200, // Étangs tilapia
  },
  
  cultures: {
    cereals: 3000, // Maïs, mil, sorgho
    legumes: 1500, // Maraichage
    fourrageres: 2000, // Brachiaria
    fruitiers: 1500, // Manguiers, anacardiers
  },
  
  valorisation: {
    biogas: 50,
    compost: 100,
    bsf: 50,
  },
  
  stockage: {
    silo: 100,
    hangar: 150,
  },
};