// Script pour initialiser la base de donnees Supabase
const https = require('https');

const SUPABASE_URL = 'https://jpdkvehaugxugruzohfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGt2ZWhhdWd4dWdydXpvaGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjM1MDIsImV4cCI6MjA5MDMzOTUwMn0.R1JedxuyxKlz60Tf3YGEWV-Cxr4AVzTkd3Fs6hDNYMU';

function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'jpdkvehaugxugruzohfz.supabase.co',
      port: 443,
      path: '/rest/v1/' + path,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function initDB() {
  console.log('📦 Initialisation de la base de donnees...\n');
  
  // Animals
  console.log('1. Creation des animaux...');
  await postRequest('animals', [
    { code: 'PP-001', espece: 'poule', race: 'ISA Brown', sexe: 'F', poids: 1.8, statut: 'actif', localisation: 'Poulailler 1', date_entree: '2025-06-15' },
    { code: 'PP-002', espece: 'poule', race: 'ISA Brown', sexe: 'F', poids: 1.9, statut: 'actif', localisation: 'Poulailler 1', date_entree: '2025-06-15' },
    { code: 'PP-003', espece: 'poule', race: 'ISA Brown', sexe: 'F', poids: 1.7, statut: 'actif', localisation: 'Poulailler 1', date_entree: '2025-06-15' },
    { code: 'CH-001', espece: 'chevre', race: 'Sahelienne', sexe: 'F', poids: 35, statut: 'actif', localisation: 'Bergerie', date_entree: '2024-03-01' },
    { code: 'CH-002', espece: 'chevre', race: 'Sahelienne', sexe: 'F', poids: 30, statut: 'actif', localisation: 'Bergerie', date_entree: '2024-03-01' },
    { code: 'MO-001', espece: 'mouton', race: 'Djallonké', sexe: 'M', poids: 28, statut: 'actif', localisation: 'Bergerie', date_entree: '2024-02-01' },
    { code: 'LB-001', espece: 'lapin', race: 'Local', sexe: 'F', poids: 2.0, statut: 'actif', localisation: 'Clapiers', date_entree: '2025-02-01' },
  ]);

  // Parcelles
  console.log('2. Creation des parcelles...');
  await postRequest('parcelles', [
    { nom: 'Parcelle Mais', surface: 2500, culture_actuelle: 'Mais', statut: 'en_culture', localisation: 'Zone Nord' },
    { nom: 'Parcelle Niebe', surface: 1200, culture_actuelle: 'Niebe', statut: 'en_culture', localisation: 'Zone Est' },
    { nom: 'Brachiaria', surface: 3500, culture_actuelle: 'Brachiaria', statut: 'en_culture', localisation: 'Zone Ouest' },
  ]);

  // Transactions
  console.log('3. Creation des transactions...');
  await postRequest('transactions', [
    { date: '2026-03-01', type: 'revenu', categorie: 'Vente œufs', montant: 45000, description: '450 œufs', module: 'elevage' },
    { date: '2026-03-03', type: 'revenu', categorie: 'Vente légumes', montant: 28000, description: 'Tomates', module: 'cultures' },
    { date: '2026-03-05', type: 'depense', categorie: 'Alimentation', montant: 18500, description: 'Tourteau', module: 'alimentation' },
    { date: '2026-03-08', type: 'depense', categorie: 'Veterinaire', montant: 12000, description: 'Vaccins', module: 'elevage' },
    { date: '2026-03-10', type: 'revenu', categorie: 'Vente compost', montant: 15000, description: 'Compost', module: 'valorisation' },
    { date: '2026-03-12', type: 'revenu', categorie: 'Vente lait', montant: 22000, description: 'Lait chevre', module: 'elevage' },
  ]);

  // Stocks
  console.log('4. Creation des stocks...');
  await postRequest('stocks', [
    { nom: 'Mais grain', categorie: 'grains', quantite: 850, unite: 'kg', seuil_alerte: 200, prix_unitaire: 150 },
    { nom: 'Tourteau arachide', categorie: 'tourteau', quantite: 180, unite: 'kg', seuil_alerte: 100, prix_unitaire: 350 },
    { nom: 'Larves BSF', categorie: 'bsf', quantite: 45, unite: 'kg', seuil_alerte: 20, prix_unitaire: 0 },
    { nom: 'Brachiaria ensile', categorie: 'fourrage', quantite: 1200, unite: 'kg', seuil_alerte: 500, prix_unitaire: 30 },
  ]);

  // Employees
  console.log('5. Creation des employes...');
  await postRequest('employees', [
    { nom: 'Kone', prenom: 'Amadou', role: 'gestionnaire', telephone: '+225 0102030405', statut: 'actif', salaire: 250000, date_embauche: '2023-01-15' },
    { nom: 'Traore', prenom: 'Seydou', role: 'ouvrier_elevage', telephone: '+225 0506070809', statut: 'actif', salaire: 120000, date_embauche: '2023-03-10' },
    { nom: 'Yao', prenom: 'Koffi', role: 'ouvrier_cultures', telephone: '+225 0708091011', statut: 'actif', salaire: 120000, date_embauche: '2024-06-01' },
  ]);

  // Alerts
  console.log('6. Creation des alertes...');
  await postRequest('alerts', [
    { type: 'vaccination', title: 'Vaccin Newcastle', message: 'Rappel vaccin - Poulailler A', severity: 'warning' },
    { type: 'stock', title: 'Stock critique', message: 'Stock Son de ble sous seuil', severity: 'error' },
  ]);

  console.log('\n✅ Base de donnees initialisee avec succes!');
  console.log('   - 7 animaux');
  console.log('   - 3 parcelles');
  console.log('   - 6 transactions');
  console.log('   - 4 stocks');
  console.log('   - 3 employes');
  console.log('   - 2 alertes');
}

initDB().catch(console.error);