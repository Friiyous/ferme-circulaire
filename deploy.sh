#!/bin/bash
# Script de déploiement - Ferme Circulaire

echo "🚀 Déploiement sur GitHub..."

# Vérifier si Git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
fi

# Ajouter tous les fichiers
echo "📝 Ajout des fichiers..."
git add .

# Commit
echo "💾 Commit des changements..."
git commit -m "Ferme Circulaire - Application de gestion agricole"

# Demander le nom du dépôt
echo ""
echo "Quel est votre dépôt GitHub ? (ex: https://github.com/votre-nom/ferme-circulaire.git)"
read -p "URL du dépôt: " REPO_URL

if [ -n "$REPO_URL" ]; then
    git remote add origin $REPO_URL 2>/dev/null || git remote set-url origin $REPO_URL
    git branch -M main
    echo "📤 Push vers GitHub..."
    git push -u origin main
    echo ""
    echo "✅ Code poussé sur GitHub!"
    echo ""
    echo "Pour déployer sur Vercel:"
    echo "1. Allez sur https://vercel.com"
    echo "2. Importez votre dépôt"
    echo "3. Ajoutez les variables d'environnement:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "4. Deploy!"
else
    echo "❌ URL non valide"
fi