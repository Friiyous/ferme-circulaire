// Script pour supprimer toutes les donnees Supabase
const https = require('https');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGt2ZWhhdWd4dWdydXpvaGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjM1MDIsImV4cCI6MjA5MDMzOTUwMn0.R1JedxuyxKlz60Tf3YGEWV-Cxr4AVzTkd3Fs6hDNYMU';

async function deleteAll(table) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'jpdkvehaugxugruzohfz.supabase.co',
      port: 443,
      path: `/rest/v1/${table}`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function resetDB() {
  console.log('🗑️ Suppression de toutes les donnees...\n');
  
  await deleteAll('animals');
  console.log('✓ Animaux supprimes');
  
  await deleteAll('parcelles');
  console.log('✓ Parcelles supprimees');
  
  await deleteAll('transactions');
  console.log('✓ Transactions supprimees');
  
  await deleteAll('stocks');
  console.log('✓ Stocks supprimes');
  
  await deleteAll('employees');
  console.log('✓ Employes supprimes');
  
  await deleteAll('tasks');
  console.log('✓ Taches supprimees');
  
  await deleteAll('alerts');
  console.log('✓ Alertes supprimees');
  
  console.log('\n✅ Base de donnees videe!');
}

resetDB().catch(console.error);