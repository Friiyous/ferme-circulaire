'use client';

/**
 * Service d'export de données
 * Permet d'exporter les rapports en PDF et Excel
 */
import { animalsService, stocksService, transactionsService, employeesService } from './crudService';
import type { Animal, Stock, Transaction, Employee } from './crudService';

// Types pour l'export
export type ExportFormat = 'pdf' | 'csv' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  title: string;
  dateRange?: { start: Date; end: Date };
}

// Convertir en CSV
function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les virgules et guillemets
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );
  return [headerRow, ...rows].join('\n');
}

// Formatage date
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Formatage montant
function formatMontant(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}

export const ExportService = {
  /**
   * Exporter les données en CSV
   */
  async exportToCSV(
    type: 'animals' | 'stocks' | 'transactions' | 'employees',
    options?: Partial<ExportOptions>
  ): Promise<void> {
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];

    switch (type) {
      case 'animals':
        const animals = await animalsService.getAll();
        headers = ['code', 'espece', 'race', 'sexe', 'poids', 'statut', 'localisation'];
        data = (animals.data || []).map(a => ({
          code: a.code,
          espece: a.espece,
          race: a.race,
          sexe: a.sexe,
          poids: a.poids,
          statut: a.statut,
          localisation: a.localisation,
        }));
        break;

      case 'stocks':
        const stocks = await stocksService.getAll();
        headers = ['nom', 'categorie', 'quantite', 'unite', 'prix_unitaire'];
        data = (stocks.data || []).map(s => ({
          nom: s.nom,
          categorie: s.categorie,
          quantite: s.quantite,
          unite: s.unite,
          prix_unitaire: s.prix_unitaire,
        }));
        break;

      case 'transactions':
        const transactions = await transactionsService.getAll();
        headers = ['date', 'type', 'categorie', 'montant', 'module', 'description'];
        data = (transactions.data || []).map(t => ({
          date: t.date,
          type: t.type,
          categorie: t.categorie,
          montant: t.montant,
          module: t.module,
          description: t.description,
        }));
        break;

      case 'employees':
        const employees = await employeesService.getAll();
        headers = ['nom', 'prenom', 'role', 'telephone', 'email', 'salaire', 'statut'];
        data = (employees.data || []).map(e => ({
          nom: e.nom,
          prenom: e.prenom,
          role: e.role,
          telephone: e.telephone,
          email: e.email,
          salaire: e.salaire,
          statut: e.statut,
        }));
        break;
    }

    // Créer le CSV
    const csv = convertToCSV(data, headers);
    
    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ferme_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  },

  /**
   * Générer un rapport PDF simple (utilise le navigateur)
   * Pour une vraie implémentation, utilisez jsPDF ou react-pdf
   */
  async generatePDFReport(
    title: string,
    sections: { title: string; content: string }[]
  ): Promise<void> {
    // Créer une fenêtre avec le contenu imprimable
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le rapport');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #2D7D32; border-bottom: 2px solid #2D7D32; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 20px; }
          .section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #2D7D32; color: white; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>🌿 ${title}</h1>
        <p>Généré le ${formatDate(new Date())}</p>
        
        ${sections.map(section => `
          <div class="section">
            <h2>${section.title}</h2>
            <div>${section.content}</div>
          </div>
        `).join('')}
        
        <div class="footer">
          <p>Ferme Circulaire — Côte d'Ivoire 🇨🇮</p>
          <p>Ce document a été généré automatiquement. Pour toute question, contactez l'administrateur.</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  },

  /**
   * Générer un rapport complet de la ferme
   */
  async generateFullReport(): Promise<void> {
    // Collecter toutes les données
    const [animals, stocks, transactions, employees] = await Promise.all([
      animalsService.getAll(),
      stocksService.getAll(),
      transactionsService.getAll(),
      employeesService.getAll(),
    ]);

    // Calculer les statistiques
    const totalAnimals = (animals.data || []).length;
    const activeAnimals = (animals.data || []).filter((a: Animal) => a.statut === 'actif').length;
    const totalStock = (stocks.data || []).length;
    const lowStock = (stocks.data || []).filter((s: Stock) => (s.quantite || 0) < 20).length;
    
    const monthTransactions = (transactions.data || []).filter((t: Transaction) => {
      const txDate = new Date(t.date);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    });
    
    const totalRevenus = monthTransactions
      .filter((t: Transaction) => t.type === 'revenu')
      .reduce((sum: number, t: Transaction) => sum + (t.montant || 0), 0);
    
    const totalDepenses = monthTransactions
      .filter((t: Transaction) => t.type === 'depense')
      .reduce((sum: number, t: Transaction) => sum + (t.montant || 0), 0);

    const sections = [
      {
        title: '📊 Résumé de la Ferme',
        content: `
          <ul>
            <li><strong>Animaux:</strong> ${activeAnimals} actifs sur ${totalAnimals} total</li>
            <li><strong>Stocks:</strong> ${totalStock} articles (${lowStock} en stock bas)</li>
            <li><strong>Employés:</strong> ${(employees.data || []).length} personnes</li>
          </ul>
        `,
      },
      {
        title: '💰 Finances du Mois',
        content: `
          <table>
            <tr><th>Catégorie</th><th>Montant</th></tr>
            <tr><td>Revenus</td><td style="color: green">${formatMontant(totalRevenus)}</td></tr>
            <tr><td>Dépenses</td><td style="color: red">${formatMontant(totalDepenses)}</td></tr>
            <tr><td><strong>Balance</strong></td><td><strong style="color: ${totalRevenus - totalDepenses >= 0 ? 'green' : 'red'}">${formatMontant(totalRevenus - totalDepenses)}</strong></td></tr>
          </table>
        `,
      },
      {
        title: '🔧 Stocks en Alerte',
        content: lowStock > 0
          ? `<p>⚠️ ${lowStock} article(s) nécessitent un réapprovisionnement.</p>`
          : '<p>✅ Tous les stocks sont à un niveau acceptable.</p>',
      },
    ];

    await this.generatePDFReport(
      `Rapport Ferme Circulaire — ${formatDate(new Date())}`,
      sections
    );
  },
};

export default ExportService;