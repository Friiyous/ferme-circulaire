# 🌿 Ferme Circulaire - Gestion Agricole

Application de gestion de ferme circulaire intégrée développée avec Next.js, TypeScript et Supabase.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-3-green)

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte [Vercel](https://vercel.com)
- Projet Supabase (optionnel pour mode local)

### Étapes de déploiement

1. **Pousser le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ferme Circulaire"
   git branch -M main
   git remote add origin https://github.com/votre-compte/ferme-circulaire.git
   git push -u origin main
   ```

2. **Importer sur Vercel**
   - Allez sur https://vercel.com
   - Cliquez "Add New..." → "Project"
   - Importez votre dépôt GitHub
   - Configurez:
     - Framework Preset: **Next.js**
     - Build Command: `next build` (déjà configuré)
     - Output Directory: `.next` (par défaut)

3. **Variables d'environnement**
   Dans Vercel, ajoutez ces variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   ```

4. **Déployer**
   - Cliquez "Deploy" et attendez le build
   - Votre app sera live sur `https://ferme-circulaire.vercel.app`

## 🏠 Mode Local

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# Lancer en développement
npm run dev
```

Ouvrez http://localhost:3000

## 📱 Fonctionnalités

- **Élevage**: Gestion des animaux (poules, porcs, etc.)
- **Cultures**: Suivi des parcelles et productions
- **Valorisation**: Biogaz, compost, recyclage
- **Alimentation**: Fabrication d'aliments pour bétail
- **Finances**: Suivi des revenus et dépenses
- **Ressources Humaines**: Gestion de l'équipe
- **Rapports**: KPIs et statistiques
- **IoT**: Relevés automatiques (capteurs)
- **Planning**: Calendrier des activités

## 🛠️ Technologies

- **Frontend**: Next.js 14, React, TypeScript, Ant Design
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Charts**: Recharts
- **State**: React Context + localStorage

## 📄 License

MIT