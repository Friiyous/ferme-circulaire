#!/bin/bash

# Configuration
SUPABASE_URL="https://jpdkvehaugxugruzohfz.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGt2ZWhhdWd4dWdydXpvaGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjM1MDIsImV4cCI6MjA5MDMzOTUwMn0.R1JedxuyxKlz60Tf3YGEWV-Cxr4AVzTkd3Fs6hDNYMU"

echo "🚀 Inserting sample data into Supabase..."

# Employees
echo "1️⃣ Inserting employees..."
curl -s -X POST "$SUPABASE_URL/rest/v1/employees" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"nom":"Kouamé","prenom":"Jean-Pierre","role":"Responsable Elevage","telephone":"+225 07XX XXX XX","statut":"actif","salaire":180000},{"nom":"Traoré","prenom":"Fatou","role":"Responsable Cultures","telephone":"+225 07XX XXX XX","statut":"actif","salaire":160000},{"nom":"Diallo","prenom":"Mamadou","role":"Ouvrier Polyvalent","telephone":"+225 07XX XXX XX","statut":"actif","salaire":80000},{"nom":"Koné","prenom":"Aminata","role":"Technicienne Valorisation","telephone":"+225 07XX XXX XX","statut":"actif","salaire":100000},{"nom":"Touré","prenom":"Boubacar","role":"Magasinier","telephone":"+225 07XX XXX XX","statut":"actif","salaire":90000}]'

echo ""
echo "2️⃣ Inserting transactions..."
curl -s -X POST "$SUPABASE_URL/rest/v1/transactions" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"date":"2026-03-01","type":"revenu","categorie":"Vente œufs","montant":45000,"description":"Vente mercado","module":"elevage"},{"date":"2026-03-02","type":"revenu","categorie":"Vente œufs","montant":38000,"description":"Vente tienda","module":"elevage"},{"date":"2026-03-03","type":"revenu","categorie":"Vente légumes","montant":25000,"description":"Paniers semana","module":"cultures"},{"date":"2026-03-05","type":"revenu","categorie":"Vente poulets","montant":85000,"description":"3 poulets","module":"elevage"},{"date":"2026-03-08","type":"depense","categorie":"Alimentation","montant":12000,"description":"Provenda poules","module":"alimentation"},{"date":"2026-03-10","type":"revenu","categorie":"Vente lait","montant":8000,"description":"5L chèvre","module":"elevage"},{"date":"2026-03-12","type":"depense","categorie":"Veterinaire","montant":15000,"description":"Vaccins","module":"elevage"},{"date":"2026-03-15","type":"revenu","categorie":"Vente œufs","montant":52000,"description":"Marché semanal","module":"elevage"},{"date":"2026-03-18","type":"revenu","categorie":"Vente compost","montant":15000,"description":"Client externe","module":"valorisation"},{"date":"2026-03-20","type":"depense","categorie":"Intrants","montant":8500,"description":"Semences","module":"cultures"},{"date":"2026-03-22","type":"revenu","categorie":"Vente légumes","montant":35000,"description":"Restaurante","module":"cultures"},{"date":"2026-03-25","type":"revenu","categorie":"Vente œufs","montant":48000,"description":"Marché semanal","module":"elevage"},{"date":"2026-03-28","type":"depense","categorie":"Maintenance","montant":5000,"description":"Clôture","module":"infrastructure"}]'

echo ""
echo "3️⃣ Inserting stocks..."
curl -s -X POST "$SUPABASE_URL/rest/v1/stocks" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"nom":"Provenda Poules","categorie":"Aliment","quantite":250,"unite":"kg","prix_unitaire":450},{"nom":"Maïs moulu","categorie":"Aliment","quantite":180,"unite":"kg","prix_unitaire":350},{"nom":"Sel minéral","categorie":"Complement","quantite":25,"unite":"kg","prix_unitaire":2000},{"nom":"Vaccin Newcastle","categorie":"Veterinaire","quantite":50,"unite":"doses","prix_unitaire":1500},{"nom":"Antiparasitaire","categorie":"Veterinaire","quantite":30,"unite":"doses","prix_unitaire":2500},{"nom":"Engrais compost","categorie":"Intrant","quantite":500,"unite":"kg","prix_unitaire":100},{"nom":"Semences maïs","categorie":"Intrant","quantite":20,"unite":"kg","prix_unitaire":800},{"nom":"Fongicide bio","categorie":"Intrant","quantite":15,"unite":"L","prix_unitaire":3500}]'

echo ""
echo "4️⃣ Inserting tasks..."
curl -s -X POST "$SUPABASE_URL/rest/v1/tasks" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"title":"Nourrir les animaux","description":"Distribution nourriture et eau fraîche","status":"pending","priority":"high"},{"title":"Vérifier clôtures","description":"Inspection état des clôtures","status":"pending","priority":"normal"},{"title":"Récolte légumes","description":"Récolte tomates Parcelle D","status":"pending","priority":"normal"}]'

echo ""
echo "5️⃣ Inserting alerts..."
curl -s -X POST "$SUPABASE_URL/rest/v1/alerts" \
  -H "apikey: $API_KEY" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"type":"animal","title":"Poule malade détectée","message":"PL-003 nécessite attention","severity":"warning"},{"type":"stock","title":"Stock bas - Provenda","message":"Il reste 250kg, réapprovisionnement bientôt","severity":"info"},{"type":"maintenance","title":"Clôture à réparer","message":"Section sud-enclos 1","severity":"normal"}]'

echo ""
echo "✅ Data insertion complete!"