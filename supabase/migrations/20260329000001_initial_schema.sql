-- =============================================
-- SCRIPT SQL POUR SUPABASE - Ferme Circulaire
-- =============================================

-- =============================================
-- TABLE: animals (Registre des animaux)
-- =============================================
create table if not exists animals (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  espece text not null,
  race text,
  sexe text,
  poids decimal,
  statut text default 'actif' check (statut in ('actif', 'malade', 'vendu', 'mort')),
  localisation text,
  date_naissance date,
  date_entree date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- TABLE: parcelles (Parcelles cultivées)
-- =============================================
create table if not exists parcelles (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  surface decimal,
  culture_actuelle text,
  statut text default 'en_culture' check (statut in ('en_culture', 'fallow', 'prepare')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- POLICIES RLS (Row Level Security)
-- =============================================
alter table animals enable row level security;
alter table parcelles enable row level security;

create policy "Allow read" on animals for select using (true);
create policy "Allow insert" on animals for insert with check (true);
create policy "Allow update" on animals for update using (true);
create policy "Allow delete" on animals for delete using (true);

create policy "Allow read" on parcelles for select using (true);
create policy "Allow insert" on parcelles for insert with check (true);
create policy "Allow update" on parcelles for update using (true);
create policy "Allow delete" on parcelles for delete using (true);

-- =============================================
-- FIN DU SCRIPT
-- =============================================