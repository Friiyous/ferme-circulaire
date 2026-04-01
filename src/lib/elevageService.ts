/**
 * Service de calcul pour l'elevage
 * - Cycle de vie (naissance -> croissance -> production -> vente)
 * - Marge par animal
 * - Calendrier vaccinal automatique
 */

import { Animal, CYCLES_PAR_ESPECE, CALENDRIER_VACCINAL, TypeVaccin, EspeceAnimal } from '@/types';
import dayjs from 'dayjs';

/**
 * Calculer le stade actuel du cycle de vie d'un animal
 */
export function getStadeCycle(animal: Animal): { stade: string; progression: number; prochainStade: string } {
  const config = CYCLES_PAR_ESPECE[animal.espece];
  if (!config) return { stade: 'inconnu', progression: 0, prochainStade: '' };

  const dateEntree = dayjs(animal.dateEntree);
  const maintenant = dayjs();
  const joursEcoules = maintenant.diff(dateEntree, 'day');

  // Determiner le stade
  if (joursEcoules < config.croissance * 0.3) {
    return { stade: 'poussin', progression: (joursEcoules / (config.croissance * 0.3)) * 100, prochainStade: 'croissance' };
  } else if (joursEcoules < config.croissance) {
    return { stade: 'croissance', progression: ((joursEcoules - config.croissance * 0.3) / (config.croissance * 0.7)) * 100, prochainStade: 'production' };
  } else if (joursEcoules < config.croissance + config.production) {
    const prodStarted = config.croissance;
    const prodProgress = ((joursEcoules - prodStarted) / config.production) * 100;
    return { stade: 'production', progression: prodProgress, prochainStade: 'reforme' };
  } else {
    return { stade: 'reforme', progression: 100, prochainStade: 'vente' };
  }
}

/**
 * Calculer la marge potentielle d'un animal
 */
export function calculerMargeAnimal(animal: Animal): {
  coutTotal: number;
  revenuPotentiel: number;
  marge: number;
  rentabilite: number;
} {
  const config = CYCLES_PAR_ESPECE[animal.espece];
  if (!config) return { coutTotal: 0, revenuPotentiel: 0, marge: 0, rentabilite: 0 };

  const dateEntree = dayjs(animal.dateEntree);
  const maintenant = dayjs();
  const joursEcoules = Math.max(1, maintenant.diff(dateEntree, 'day'));

  // Cout de production (alimentation + soins)
  const coutTotal = joursEcoules * config.coutProduction;

  // Revenu potentiel (prix de vente + production)
  const productionParJour = getProductionJournaliere(animal);
  const revenuProduction = productionParJour * joursEcoules;
  const revenuVente = config.prixVente;

  const revenuTotal = revenuProduction + revenuVente;
  const marge = revenuTotal - coutTotal;
  const rentabilite = coutTotal > 0 ? ((revenuTotal - coutTotal) / coutTotal) * 100 : 0;

  return {
    coutTotal,
    revenuPotentiel: revenuTotal,
    marge,
    rentabilite: Math.round(rentabilite)
  };
}

/**
 * Production journaliere estimee par espece
 */
export function getProductionJournaliere(animal: Animal): number {
  switch (animal.espece) {
    case 'poule':
      // Ponte: 1 oeuf/jour environ
      const age = dayjs().diff(dayjs(animal.dateEntree), 'day');
      if (age > 120 && age < 730) return 0.8; // 80% ponte
      return 0;
    case 'chevre':
      // Lait: 1-2 L/jour
      return 1.5;
    case 'canard':
      return 0; // Pas de ponte significative
    case 'lapin':
      return 0; // Reproduction
    default:
      return 0;
  }
}

/**
 * Obtenir les vaccinations dues pour un animal
 */
export function getVaccinationsDues(animal: Animal): {
  vaccine: typeof CALENDRIER_VACCINAL[0];
  statut: 'fait' | 'a_faire' | 'retard';
  datePrevue: string;
  joursRestants: number;
}[] {
  const vaccinations = CALENDRIER_VACCINAL.filter(v => v.espece === animal.espece);
  const dateEntree = dayjs(animal.dateEntree);
  const maintenant = dayjs();

  return vaccinations.map(vaccin => {
    const datePrevue = dateEntree.add(vaccin.agePremiereDose, 'day');
    const joursEcoules = maintenant.diff(dateEntree, 'day');
    const joursRestants = datePrevue.diff(maintenant, 'day');

    let statut: 'fait' | 'a_faire' | 'retard' = 'a_faire';
    if (joursEcoules >= vaccin.agePremiereDose + vaccin.rappelIntervalle) {
      statut = 'retard';
    } else if (joursEcoules >= vaccin.agePremiereDose) {
      statut = 'a_faire';
    }

    return {
      vaccine: vaccin,
      statut,
      datePrevue: datePrevue.format('YYYY-MM-DD'),
      joursRestants
    };
  });
}

/**
 * Resumé du cheptel avec marges
 */
export function getResumeCheptel(animaux: Animal[]): {
  total: number;
  parEspece: Record<string, { quantite: number; margeTotale: number; revenuPotentiel: number }>;
  margeGlobale: number;
  revenuGlobal: number;
} {
  const parEspece: Record<string, { quantite: number; margeTotale: number; revenuPotentiel: number }> = {};
  let margeGlobale = 0;
  let revenuGlobal = 0;

  animaux.forEach(animal => {
    const marge = calculerMargeAnimal(animal);
    margeGlobale += marge.marge;
    revenuGlobal += marge.revenuPotentiel;

    if (!parEspece[animal.espece]) {
      parEspece[animal.espece] = { quantite: 0, margeTotale: 0, revenuPotentiel: 0 };
    }
    parEspece[animal.espece].quantite++;
    parEspece[animal.espece].margeTotale += marge.marge;
    parEspece[animal.espece].revenuPotentiel += marge.revenuPotentiel;
  });

  return {
    total: animaux.length,
    parEspece,
    margeGlobale,
    revenuGlobal
  };
}

/**
 * Alertes de vaccination
 */
export function getAlertesVaccination(animaux: Animal[]): {
  animal: Animal;
  message: string;
  priorite: 'urgente' | 'haute' | 'normale';
}[] {
  const alertes: { animal: Animal; message: string; priorite: 'urgente' | 'haute' | 'normale' }[] = [];

  animaux.forEach(animal => {
    const vaccinations = getVaccinationsDues(animal);

    vaccinations.forEach(v => {
      if (v.statut === 'retard') {
        alertes.push({
          animal,
          message: `Vaccin ${v.vaccine.typeVaccin} en retard de ${Math.abs(v.joursRestants)} jours`,
          priorite: 'urgente'
        });
      } else if (v.statut === 'a_faire' && v.joursRestants <= 7) {
        alertes.push({
          animal,
          message: `Vaccin ${v.vaccine.typeVaccin} prevu dans ${v.joursRestants} jours`,
          priorite: 'haute'
        });
      }
    });
  });

  return alertes;
}

// =============================================
// WORKFLOW VENTE AUTOMATIQUE
// =============================================

export interface VentePotentielle {
  animal: Animal;
  dateOptimale: string;
  prixVente: number;
  joursRestants: number;
  raison: string;
}

/**
 * Obtenir les animaux prets pour vente (stade reforme ou proche)
 */
export function getAnimauxAPrevoirVente(animaux: Animal[]): VentePotentielle[] {
  const ventes: VentePotentielle[] = [];

  animaux.forEach(animal => {
    if (animal.statut !== 'actif') return;
    
    const config = CYCLES_PAR_ESPECE[animal.espece];
    if (!config) return;

    const dateEntree = dayjs(animal.dateEntree);
    const maintenant = dayjs();
    const joursEcoules = maintenant.diff(dateEntree, 'day');
    const joursProduction = config.croissance + config.production;

    // Animal pret pour vente (fin de cycle de production)
    if (joursEcoules >= joursProduction * 0.9) {
      const joursRestants = joursProduction - joursEcoules;
      ventes.push({
        animal,
        dateOptimale: dateEntree.add(joursProduction, 'day').format('YYYY-MM-DD'),
        prixVente: config.prixVente,
        joursRestants: Math.round(joursRestants),
        raison: 'Fin de cycle de production - Reform recommended'
      });
    }
  });

  return ventes.sort((a, b) => a.joursRestants - b.joursRestants);
}

/**
 * Simuler une vente et retourner la transaction potentielle
 */
export function simulerVente(animal: Animal): {
  prixVente: number;
  coutTotal: number;
  marge: number;
  dureeElevage: number;
  profitParJour: number;
} {
  const config = CYCLES_PAR_ESPECE[animal.espece];
  if (!config) return { prixVente: 0, coutTotal: 0, marge: 0, dureeElevage: 0, profitParJour: 0 };

  const dateEntree = dayjs(animal.dateEntree);
  const maintenant = dayjs();
  const joursEcoules = Math.max(1, maintenant.diff(dateEntree, 'day'));

  const coutTotal = joursEcoules * config.coutProduction;
  const prixVente = config.prixVente;
  const marge = prixVente - coutTotal;
  const profitParJour = Math.round(marge / joursEcoules);

  return { prixVente, coutTotal, marge, dureeElevage: joursEcoules, profitParJour };
}

// =============================================
// SUIVI MARGE EN TEMPS REEL
// =============================================

export interface MargeParPeriode {
  periode: string;
  revenus: number;
  depenses: number;
  marge: number;
}

export function calculerMargeParPeriode(transactions: { date: string; type: 'revenu' | 'depense'; montant: number }[]): MargeParPeriode {
  const maintenant = dayjs();
  
  // Ce mois
  const debutMois = maintenant.startOf('month');
  const transactionsMois = transactions.filter(t => dayjs(t.date).isAfter(debutMois));
  
  const revenus = transactionsMois.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.montant, 0);
  const depenses = transactionsMois.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
  
  return {
    periode: maintenant.format('MMMM YYYY'),
    revenus,
    depenses,
    marge: revenus - depenses
  };
}

/**
 * Calculer la marge cumulative depuis le debut de l'annee
 */
export function getMargeAnnuelle(transactions: { date: string; type: 'revenu' | 'depense'; montant: number }[]): MargeParPeriode {
  const maintenant = dayjs();
  const debutAnnee = dayjs().startOf('year');
  
  const transactionsAnnee = transactions.filter(t => dayjs(t.date).isAfter(debutAnnee));
  
  const revenus = transactionsAnnee.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.montant, 0);
  const depenses = transactionsAnnee.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.montant, 0);
  
  return {
    periode: `Année ${debutAnnee.format('YYYY')}`,
    revenus,
    depenses,
    marge: revenus - depenses
  };
}
