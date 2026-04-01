-- Script pour vider toutes les tables de démonstration

-- Vider les tables (supprimer toutes les lignes)
TRUNCATE animals, parcelles, transactions, stocks, employees, tasks, alerts CASCADE;

-- Réinitialiser les compteurs d'ID
ALTER SEQUENCE animals_id_seq RESTART WITH 1;
ALTER SEQUENCE parcelles_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE stocks_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;
ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- Rafraîchir le cache
NOTIFY pgrst, 'reload schema';

-- Vérification
SELECT 'Tables vidées avec succès!' as status;