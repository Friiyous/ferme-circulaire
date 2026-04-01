-- Script pour créer les tables manquantes

-- Table transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  type text not null,
  categorie text,
  montant decimal not null,
  description text,
  module text,
  created_at timestamp with time zone default now()
);

-- Insert sample transactions
insert into transactions (date, type, categorie, montant, description, module) values
  ('2026-03-01', 'revenu', 'Vente œufs', 45000, 'Vente mercado', 'elevage'),
  ('2026-03-02', 'revenu', 'Vente œufs', 38000, 'Vente tienda', 'elevage'),
  ('2026-03-03', 'revenu', 'Vente légumes', 25000, 'Paniers semana', 'cultures'),
  ('2026-03-05', 'revenu', 'Vente poulets', 85000, '3 poulets', 'elevage'),
  ('2026-03-08', 'depense', 'Alimentation', 12000, 'Provenda poules', 'alimentation'),
  ('2026-03-10', 'revenu', 'Vente lait', 8000, '5L chèvre', 'elevage'),
  ('2026-03-12', 'depense', 'Veterinaire', 15000, 'Vaccins', 'elevage'),
  ('2026-03-15', 'revenu', 'Vente œufs', 52000, 'Marché semanal', 'elevage'),
  ('2026-03-18', 'revenu', 'Vente compost', 15000, 'Client externe', 'valorisation'),
  ('2026-03-20', 'depense', 'Intrants', 8500, 'Semences', 'cultures'),
  ('2026-03-22', 'revenu', 'Vente légumes', 35000, 'Restaurante', 'cultures'),
  ('2026-03-25', 'revenu', 'Vente œufs', 48000, 'Marché semanal', 'elevage'),
  ('2026-03-28', 'depense', 'Maintenance', 5000, 'Clôture', 'infrastructure');

-- Table stocks
create table if not exists stocks (
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
);

-- Insert sample stocks
insert into stocks (nom, categorie, quantite, unite, seuil_alerte, prix_unitaire, fournisseur) values
  ('Provenda Poules', 'Aliment', 250, 'kg', 50, 450, 'COPAZ'),
  ('Maïs moulu', 'Aliment', 180, 'kg', 30, 350, 'Local'),
  ('Sel minéral', 'Complement', 25, 'kg', 5, 2000, 'Veto'),
  ('Vaccin Newcastle', 'Veterinaire', 50, 'doses', 10, 1500, 'SEN-CRV'),
  ('Antiparasitaire', 'Veterinaire', 30, 'doses', 5, 2500, 'SEN-CRV'),
  ('Engrais compost', 'Intrant', 500, 'kg', 100, 100, 'Production eigene'),
  ('Semences maïs', 'Intrant', 20, 'kg', 5, 800, 'ONG Agriculture'),
  ('Fongicide bio', 'Intrant', 15, 'L', 3, 3500, 'Bioferme');

-- Table employees
create table if not exists employees (
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
);

-- Insert sample employees
insert into employees (nom, prenom, role, telephone, statut, salaire, date_embauche) values
  ('Kouamé', 'Jean-Pierre', 'Responsable Elevage', '+225 07XX XXX XX', 'actif', 180000, '2024-01-15'),
  ('Traoré', 'Fatou', 'Responsable Cultures', '+225 07XX XXX XX', 'actif', 160000, '2024-02-01'),
  ('Diallo', 'Mamadou', 'Ouvrier Polyvalent', '+225 07XX XXX XX', 'actif', 80000, '2025-01-10'),
  ('Koné', 'Aminata', 'Technicienne Valorisation', '+225 07XX XXX XX', 'actif', 100000, '2024-06-01'),
  ('Touré', 'Boubacar', 'Magasinier', '+225 07XX XXX XX', 'actif', 90000, '2024-03-15');

-- Table tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  assigned_to uuid,
  due_date date,
  status text default 'pending',
  priority text default 'normal',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Insert sample tasks
insert into tasks (title, description, assigned_to, due_date, status, priority)
select 
  'Nourrir les animaux',
  'Distribution nourriture et eau fraîche',
  id,
  current_date,
  'pending',
  'high'
from employees where role like '%Elevage%'
limit 1;

insert into tasks (title, description, assigned_to, due_date, status, priority)
select 
  'Vérifier clôtures',
  'Inspection état des clôtures',
  id,
  current_date + 3,
  'pending',
  'normal'
from employees limit 1;

-- Table alerts
create table if not exists alerts (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  title text not null,
  message text,
  severity text default 'info',
  resolved boolean default false,
  created_at timestamp with time zone default now()
);

-- Insert sample alerts
insert into alerts (type, title, message, severity) values
  ('animal', 'Poule malade détectée', 'PL-003 nécessite attention', 'warning'),
  ('stock', 'Stock bas - Provenda', 'Il reste 250kg, réapprovisionnement bientôt', 'info'),
  ('maintenance', 'Clôture à réparer', 'Section sud-enclos 1', 'normal');

-- Enable RLS on all tables
alter table transactions enable row level security;
alter table stocks enable row level security;
alter table employees enable row level security;
alter table tasks enable row level security;
alter table alerts enable row level security;

-- Create policies
create policy "Allow read" on transactions for select using (true);
create policy "Allow insert" on transactions for insert with check (true);
create policy "Allow update" on transactions for update using (true);
create policy "Allow delete" on transactions for delete using (true);

create policy "Allow read" on stocks for select using (true);
create policy "Allow insert" on stocks for insert with check (true);
create policy "Allow update" on stocks for update using (true);
create policy "Allow delete" on stocks for delete using (true);

create policy "Allow read" on employees for select using (true);
create policy "Allow insert" on employees for insert with check (true);
create policy "Allow update" on employees for update using (true);
create policy "Allow delete" on employees for delete using (true);

create policy "Allow read" on tasks for select using (true);
create policy "Allow insert" on tasks for insert with check (true);
create policy "Allow update" on tasks for update using (true);
create policy "Allow delete" on tasks for delete using (true);

create policy "Allow read" on alerts for select using (true);
create policy "Allow insert" on alerts for insert with check (true);
create policy "Allow update" on alerts for update using (true);
create policy "Allow delete" on alerts for delete using (true);

-- Update animals table with data
insert into animals (code, espece, race, sexe, poids, statut, localisation, date_naissance, date_entree) values
  ('PL-001', 'poule', 'Cobb 500', 'F', 2.1, 'actif', 'Poulailler A', '2025-01-15', '2025-03-01'),
  ('PL-002', 'poule', 'Cobb 500', 'F', 2.3, 'actif', 'Poulailler A', '2025-01-20', '2025-03-05'),
  ('PL-003', 'poule', 'Isa Brown', 'F', 1.9, 'actif', 'Poulailler B', '2025-02-10', '2025-03-10'),
  ('CO-001', 'coq', 'Rhode Island', 'M', 3.2, 'actif', 'Poulailler A', '2024-06-15', '2024-08-01'),
  ('CH-001', 'chevre', 'Saanen', 'F', 42, 'actif', 'Enclos 1', '2024-03-20', '2024-05-01'),
  ('CH-002', 'chevre', 'Alpine', 'F', 38, 'actif', 'Enclos 1', '2024-04-10', '2024-06-01'),
  ('BO-001', 'bovin', 'Ndama', 'M', 280, 'actif', 'Pâturage', '2023-01-10', '2023-03-01'),
  ('CA-001', 'canard', 'Muscovy', 'F', 1.5, 'actif', 'Bassin', '2025-02-01', '2025-03-15'),
  ('PI-001', 'pintade', 'Commune', 'F', 1.2, 'malade', 'Poulailler B', '2025-01-25', '2025-02-15'),
  ('LA-001', 'lapin', 'Nouvelle Zélande', 'M', 2.8, 'actif', 'Cages', '2025-03-01', '2025-03-20')
on conflict (code) do nothing;

-- Update parcelles table with data (without localisation column)
insert into parcelles (nom, surface, culture_actuelle, statut) values
  ('Parcelle A', 2500, 'Maïs', 'en_culture'),
  ('Parcelle B', 1800, 'Manioc', 'en_culture'),
  ('Parcelle C', 1200, 'Haricots verts', 'en_culture'),
  ('Parcelle D', 2200, 'Tomates', 'en_culture'),
  ('Serre 1', 400, 'Piments', 'en_culture'),
  ('Jardin', 800, 'Légumes mixtes', 'en_culture')
on conflict do nothing;