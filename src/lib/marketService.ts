// =============================================
// SERVICE PRIX DU MARCHE - API AGRI/CLIMAT (Simulation)
// Pour une vraie integration, utiliser: FAO Food Price Data
// =============================================

export interface MarketPrice {
  product: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
  location: string;
}

export interface MarketData {
  date: string;
  location: string;
  prices: MarketPrice[];
}

// Prix du marche local (Cote d'Ivoire - Simulation)
const LOCAL_PRICES: MarketPrice[] = [
  { product: 'Maïs', price: 150, unit: 'kg', trend: 'stable', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Riz', price: 350, unit: 'kg', trend: 'up', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Manioc', price: 200, unit: 'kg', trend: 'down', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Tomate', price: 500, unit: 'kg', trend: 'up', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Piment', price: 800, unit: 'kg', trend: 'stable', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Haricot', price: 600, unit: 'kg', trend: 'up', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Poule', price: 5000, unit: 'tête', trend: 'stable', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Chèvre', price: 45000, unit: 'tête', trend: 'up', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Lait', price: 250, unit: 'L', trend: 'stable', lastUpdate: '2026-03-30', location: 'Korhogo' },
  { product: 'Œuf', price: 100, unit: 'unité', trend: 'down', lastUpdate: '2026-03-30', location: 'Korhogo' },
];

// Fonction pour recuperer les prix du marche
export const getMarketPrices = async (location: string = 'Korhogo'): Promise<MarketData> => {
  // Simulation avec donnees locales
  // Pour une vraie API: utiliser FAO Commodities Prices API
  
  return {
    date: new Date().toISOString().split('T')[0],
    location,
    prices: LOCAL_PRICES.map(p => ({
      ...p,
      lastUpdate: new Date().toISOString().split('T')[0]
    }))
  };
};

// Rechercher un produit specifique
export const searchProduct = (productName: string): MarketPrice | undefined => {
  return LOCAL_PRICES.find(p => 
    p.product.toLowerCase().includes(productName.toLowerCase())
  );
};

// Calculer le prix moyen
export const getAveragePrice = (): number => {
  return Math.round(
    LOCAL_PRICES.reduce((sum, p) => sum + p.price, 0) / LOCAL_PRICES.length
  );
};

// Tendances du marche
export const getMarketTrends = (): { up: number; down: number; stable: number } => {
  return {
    up: LOCAL_PRICES.filter(p => p.trend === 'up').length,
    down: LOCAL_PRICES.filter(p => p.trend === 'down').length,
    stable: LOCAL_PRICES.filter(p => p.trend === 'stable').length,
  };
};

// Recommandations de vente basées sur les prix
export const getSellingRecommendations = (): string[] => {
  const recommendations: string[] = [];
  
  const trendingUp = LOCAL_PRICES.filter(p => p.trend === 'up');
  const trendingDown = LOCAL_PRICES.filter(p => p.trend === 'down');
  
  if (trendingUp.length > 0) {
    recommendations.push(`📈 Prix en hausse: ${trendingUp.map(p => p.product).join(', ')}`);
  }
  
  if (trendingDown.length > 0) {
    recommendations.push(`📉 Prix en baisse: ${trendingDown.map(p => p.product).join(', ')}`);
  }
  
  // Recommandations specifiques
  const tomatoPrice = LOCAL_PRICES.find(p => p.product === 'Tomate');
  if (tomatoPrice && tomatoPrice.trend === 'up') {
    recommendations.push('🍅 Bon moment pour vendre les tomates');
  }
  
  const chickenPrice = LOCAL_PRICES.find(p => p.product === 'Poule');
  if (chickenPrice && chickenPrice.trend === 'stable') {
    recommendations.push('🐔 Prix稳定 -可以考虑育肥增加体重');
  }
  
  return recommendations;
};

// Widget formaté pour dashboard
export const formatMarketWidget = (): string => {
  const trends = getMarketTrends();
  return `📊 Marché Korhogo: ${trends.up}↑ ${trends.down}↓ ${trends.stable}→`;
};