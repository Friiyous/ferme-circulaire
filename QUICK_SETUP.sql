-- =============================================
-- QUICK SETUP - Tables manquantes
-- Exécuter dans Supabase > SQL Editor
-- Lien: https://supabase.com/dashboard/project/jpdkvehaugxugruzohfz/sql/new
-- =============================================

-- Table employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  prenom text,
  role text,
  telephone text,
  email text,
  statut text DEFAULT 'actif',
  salaire decimal,
  date_embauche date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  type text NOT NULL,
  categorie text,
  montant decimal NOT NULL,
  description text,
  module text,
  created_at timestamp with time zone DEFAULT now()
);

-- Table stocks (version simple)
CREATE TABLE IF NOT EXISTS stocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  categorie text,
  quantite decimal,
  unite text,
  prix_unitaire decimal,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  assigned_to uuid,
  due_date date,
  status text DEFAULT 'pending',
  priority text DEFAULT 'normal',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table alerts
CREATE TABLE IF NOT EXISTS alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  severity text DEFAULT 'info',
  resolved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour toutes les tables
DO $$
BEGIN
  -- Employees policies
  IF NOT EXISTS (SELECT FROM pg_policy WHERE polname = 'Allow read' AND polrelid = 'employees'::regclass) THEN
    CREATE POLICY "Allow read" ON employees FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON employees FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON employees FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON employees FOR DELETE USING (true);
  END IF;
  
  -- Transactions policies
  IF NOT EXISTS (SELECT FROM pg_policy WHERE polname = 'Allow read' AND polrelid = 'transactions'::regclass) THEN
    CREATE POLICY "Allow read" ON transactions FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON transactions FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON transactions FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON transactions FOR DELETE USING (true);
  END IF;
  
  -- Stocks policies
  IF NOT EXISTS (SELECT FROM pg_policy WHERE polname = 'Allow read' AND polrelid = 'stocks'::regclass) THEN
    CREATE POLICY "Allow read" ON stocks FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON stocks FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON stocks FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON stocks FOR DELETE USING (true);
  END IF;
  
  -- Tasks policies
  IF NOT EXISTS (SELECT FROM pg_policy WHERE polname = 'Allow read' AND polrelid = 'tasks'::regclass) THEN
    CREATE POLICY "Allow read" ON tasks FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON tasks FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON tasks FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON tasks FOR DELETE USING (true);
  END IF;
  
  -- Alerts policies
  IF NOT EXISTS (SELECT FROM pg_policy WHERE polname = 'Allow read' AND polrelid = 'alerts'::regclass) THEN
    CREATE POLICY "Allow read" ON alerts FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON alerts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON alerts FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON alerts FOR DELETE USING (true);
  END IF;
END $$;

-- Rafraîchir le cache après création
NOTIFY pgrst, 'reload schema';