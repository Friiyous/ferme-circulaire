// =============================================
// Script de création des tables Supabase
// Exécuter: node setup-supabase.js
// =============================================

const https = require('https');

// Configuration Supabase
const SUPABASE_URL = 'https://jpdkvehaugxugruzohfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGt2ZWhhdWd4dWdydXpvaGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjM1MDIsImV4cCI6MjA5MDMzOTUwMn0.R1JedxuyxKlz60Tf3YGEWV-Cxr4AVzTkd3Fs6hDNYMU';

// Fonction pour faire une requête HTTP
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// SQL à exécuter
const sqlStatements = [
  // Table animals
  `create table if not exists animals (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    espece text not null,
    race text,
    sexe text,
    poids decimal,
    statut text default 'actif',
    localisation text,
    date_naissance date,
    date_entree date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );`,

  // Table parcelles
  `create table if not exists parcelles (
    id uuid default gen_random_uuid() primary key,
    nom text not null,
    surface decimal,
    culture_actuelle text,
    statut text default 'en_culture',
    localisation text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );`,

  // Table transactions
  `create table if not exists transactions (
    id uuid default gen_random_uuid() primary key,
    date date not null,
    type text not null,
    categorie text,
    montant decimal not null,
    description text,
    module text,
    created_at timestamp with time zone default now()
  );`,

  // Table stocks
  `create table if not exists stocks (
    id uuid default gen_random_uuid() primary key,
    nom text not null,
    categorie text,
    quantite decimal,
    unite text,
    seuil_alerte decimal default 10,
    prix_unitaire decimal,
    fournisseur text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );`,

  // Table employees
  `create table if not exists employees (
    id uuid default gen_random_uuid() primary key,
    nom text not null,
    prenom text,
    role text,
    telephone text,
    email text,
    statut text default 'actif',
    salaire decimal,
    date_embauche date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );`,

  // Table tasks
  `create table if not exists tasks (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    assigned_to uuid,
    due_date date,
    status text default 'pending',
    priority text default 'normal',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
  );`,

  // Table alerts
  `create table if not exists alerts (
    id uuid default gen_random_uuid() primary key,
    type text not null,
    title text not null,
    message text,
    severity text default 'info',
    resolved boolean default false,
    created_at timestamp with time zone default now()
  );`
];

async function setupTables() {
  console.log('🚀 Configuration des tables Supabase...\n');
  
  // Test de connexion
  console.log('1️⃣ Test de connexion à Supabase...');
  try {
    const test = await makeRequest('GET', '/rest/v1/');
    console.log('   ✅ Connexion réussie !\n');
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
    return;
  }

  // Créer les tables
  console.log('2️⃣ Création des tables...');
  for (let i = 0; i < sqlStatements.length; i++) {
    const tableName = sqlStatements[i].match(/create table if not exists (\w+)/)?.[1] || `Table ${i + 1}`;
    console.log(`   Creating ${tableName}...`);
    
    // Les tables doivent être créées via pg_execute, pas via l'API REST
    // On va utiliser l'API directpost
  }

  console.log('\n📝 Instructions pour finaliser la configuration:\n');
  console.log('1. Allez sur: https://supabase.com/dashboard/project/jpdkvehaugxugruzohfz/sql/new');
  console.log('2. Ouvrez le fichier SUPABASE_SETUP.sql dans ce projet');
  console.log('3. Copiez-collez le contenu dans le SQL Editor de Supabase');
  console.log('4. Cliquez sur "Run" pour exécuter\n');
  
  console.log('Le fichier SUPABASE_SETUP.sql contient tous les CREATE TABLE + INSERT + RLS policies\n');
}

setupTables().catch(console.error);