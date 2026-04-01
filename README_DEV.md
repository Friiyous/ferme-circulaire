# 🚜 Ferme Circulaire Agricole — Guide de Développement (Handoff)

Ce document sert de point de repère pour reprendre le développement de l'application de gestion de "Ferme Circulaire" à partir d'un état 100% fonctionnel et propre.

## 🌟 État Actuel du Projet (Mars 2026)
L'application front-end est **totalement finalisée, exempte de bugs TypeScript et d'avertissements de console**.
- **Framework** : Next.js 14+ (App Router)
- **UI** : Ant Design v5
- **État Global** : Zustand
- **Graphiques** : Recharts
- **Typage** : TypeScript Strict (`tsc --noEmit` passe avec succès)

Tous les modules métier ont été intégrés avec des données mockées hyper-réalistes (`src/lib/mockData.ts`) :
1. ✅ **Dashboard** : KPIs globaux et alertes consolidées.
2. ✅ **Élevage** : Registre complet, suivi de santé (vaccinations) et production (œufs/lait).
3. ✅ **Cultures** : Gestion des parcelles, historique de rotations, widget d'irrigation.
4. ✅ **Valorisation** : Digesteur Biogaz, bacs à Compost, et traceur de cycle Larves BSF (Mouches Soldats Noires).
5. ✅ **Alimentation** : Gestion des stocks, alertes de seuils, formulateur "low-cost" pour calculer l'autonomie protéique.
6. ✅ **Finances** : Suivi des transactions et calcul de rentabilité inter-modules.
7. ✅ **Ressources Humaines (RH)** : Organigramme, liste des employés et gestionnaire de tâches.

---

## 🏗️ Structure Clé du Projet
- **`src/app/(main)/`** : Contient toutes les pages de l'application (routing géré par Next.js). Chaque sous-dossier représente un module (ex: `/cultures`, `/alimentation`, `/rh`).
- **`src/components/`** : Composants réutilisables organisés par module métier (`/dashboard`, `/elevage`, `/ferme`, etc.).
- **`src/types/index.ts`** : Le cœur de vos définitions TypeScript (`Animal`, `StockIntrant`, `Employe`, `Transaction`, etc...). Tout nouveau champ métier doit être déclaré ici en premier.
- **`src/lib/theme.ts`** : La configuration globale des couleurs (vert agricole, orange, bleu de l'eau) utilisée par Ant Design.
- **`src/lib/mockData.ts`** : Contient l'ensemble des fausses données actuelles.

---

## 🛠️ Bonnes pratiques spécifiques à retenir
1. **Ant Design V5 Migration** : Les propriétés telles que `valueStyle`, `bodyStyle` pour `<Card>` ou `<Statistic>` sont dépréciées en v5. Utilisez toujours l'API `styles` (ex: `styles={{ content: { color: 'green' } }}`).
2. **TypeScript Strict** : Pensez toujours à définir minutieusement toutes les propriétés optionnelles dans `src/types/index.ts`. Le linter est configuré de façon stricte pour éviter les props inattendues.
3. **Icons AntD** : Si vous utilisez de nouvelles icônes (`@ant-design/icons`), assurez-vous de bien vérifier le nom exact avant l'importation.

---

## 🚀 Prochaines Étapes (Phases 11 & 12)

Le projet est maintenant mûr pour être connecté à l'environnement de production. Voici les prochaines étapes à lancer dès votre retour :

### 1. Phase Supabase (Base de Données & Auth)
Le passage du mode "Mock" (fausses données) au backend réel.
- Configurer les tables PostgreSQL dans **Supabase**.
- Mettre en place la Row Level Security (RLS) pour le multi-tenant (`farm_id`).
- Lier l'authentification (`NextAuth` ou l'Auth native de Supabase).
- Remplacer l'importation des objets de `src/lib/mockData.ts` par de réels appels via le `supabase-client`.

### 2. Phase PWA (Progressive Web App)
- Générer de vrais logos (`public/icon.png`, `icon-512x512.png`).
- Remplir le `public/manifest.json` avec les informations d'installabilité mobile.
- Activer `next-pwa` sur le `next.config.ts` pour permettre l'utilisation "Hors-Ligne" (Offline Cache).

---
*L'application est solide, la fondation est prête à industrialiser la ferme circulaire en douceur. Bon codage !*
