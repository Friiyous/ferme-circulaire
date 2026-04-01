// =============================================
// Script pour créer les tables Supabase
// Utilise l'API Supabase via HTTP
// =============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jpdkvehaugxugruzohfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGt2ZWhhdWd4dWdydXpvaGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjM1MDIsImV4cCI6MjA5MDMzOTUwMn0.R1JedxuyxKlz60Tf3YGEWV-Cxr4AVzTkd3Fs6hDNYMU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTable(tableName, columns) {
  console.log(`Creating table: ${tableName}`);
  // Using raw SQL via pg_execute is needed but we can use the REST API
  // For now, we'll try to insert data and see what happens
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      console.log(`   Table ${tableName} does not exist yet`);
      return false;
    }
    console.log(`   ✅ Table ${tableName} already exists`);
    return true;
  } catch (e) {
    console.log(`   Table ${tableName} does not exist`);
    return false;
  }
}

async function checkTables() {
  console.log('🔍 Checking existing tables...\n');
  
  const tables = ['animals', 'parcelles', 'transactions', 'stocks', 'employees', 'tasks', 'alerts'];
  
  for (const table of tables) {
    await createTable(table);
  }
  
  console.log('\n⚠️  NOTE: Tables must be created via Supabase Dashboard SQL Editor.');
  console.log('\n📋 To create tables manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/jpdkvehaugxugruzohfz/sql/new');
  console.log('2. Copy the content from SUPABASE_SETUP.sql');
  console.log('3. Run the SQL\n');
}

checkTables();