// =============================================
// SERVICE MÉTÉO - Intégration API Open-Meteo (gratuite)
// =============================================

// Pas de dépendance externe - utilise fetch natif

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  precipitation: number;
  forecast: DayForecast[];
}

export interface DayForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  description: string;
  icon: string;
}

// Coordonnées Abidjan, Côte d'Ivoire
const LAT = 5.3600;
const LON = -4.1000;

// Mapping des codes météo Open-Meteo vers descriptions
const WEATHER_CODES: Record<number, { desc: string; icon: string }> = {
  0: { desc: 'Ciel dégagé', icon: '☀️' },
  1: { desc: 'Mostly clear', icon: '🌤️' },
  2: { desc: 'Partiellement nuageux', icon: '⛅' },
  3: { desc: 'Nuageux', icon: '☁️' },
  45: { desc: 'Brouillard', icon: '🌫️' },
  48: { desc: 'Brouillard givrant', icon: '🌫️' },
  51: { desc: 'Bruine légère', icon: '🌧️' },
  53: { desc: 'Bruine modérée', icon: '🌧️' },
  55: { desc: 'Bruine dense', icon: '🌧️' },
  61: { desc: 'Pluie légère', icon: '🌧️' },
  63: { desc: 'Pluie modérée', icon: '🌧️' },
  65: { desc: 'Forte pluie', icon: '⛈️' },
  71: { desc: 'Neige légère', icon: '🌨️' },
  73: { desc: 'Neige modérée', icon: '🌨️' },
  75: { desc: 'Forte neige', icon: '❄️' },
  80: { desc: 'Averses légères', icon: '🌦️' },
  81: { desc: 'Averses modérées', icon: '🌦️' },
  82: { desc: 'Fortes averses', icon: '⛈️' },
  95: { desc: 'Orage', icon: '⛈️' },
  96: { desc: 'Orage avec grêle', icon: '⛈️' },
  99: { desc: 'Orage violent', icon: '⛈️' },
};

// Format date pourAPI
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Récupérer la météo actuelle
export const getCurrentWeather = async (): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const current = data.current;
    const weatherCode = current.weather_code || 0;
    const weatherInfo = WEATHER_CODES[weatherCode] || { desc: 'Inconnu', icon: '❓' };
    
    return {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      description: weatherInfo.desc,
      icon: weatherInfo.icon,
      windSpeed: Math.round(current.wind_speed_10m),
      precipitation: current.precipitation || 0,
      forecast: [],
    };
  } catch (error) {
    // Retourner des données simulées en cas d'erreur
    console.warn('Météo API échouée, utilisation données simulées');
    return getSimulatedWeather();
  }
};

// Récupérer les prévisions 7 jours
export const getWeatherForecast = async (): Promise<DayForecast[]> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=7`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    
    const data = await response.json();
    const daily = data.daily;
    
    return daily.time.map((date: string, i: number) => {
      const code = daily.weather_code[i];
      const info = WEATHER_CODES[code] || { desc: 'Inconnu', icon: '❓' };
      
      return {
        date,
        tempMin: Math.round(daily.temperature_2m_min[i]),
        tempMax: Math.round(daily.temperature_2m_max[i]),
        precipitation: daily.precipitation_sum[i] || 0,
        description: info.desc,
        icon: info.icon,
      };
    });
  } catch (error) {
    // Retourner des données simulées
    return getSimulatedForecast();
  }
};

// Données simulées (quand pas de connexion)
export const getSimulatedWeather = (): WeatherData => {
  const codes = [0, 1, 2, 3];
  const randomCode = codes[Math.floor(Math.random() * codes.length)];
  const info = WEATHER_CODES[randomCode];
  
  return {
    temperature: Math.round(28 + Math.random() * 6), // 28-34°C
    humidity: Math.round(70 + Math.random() * 20), // 70-90%
    description: info.desc,
    icon: info.icon,
    windSpeed: Math.round(5 + Math.random() * 10),
    precipitation: 0,
    forecast: getSimulatedForecast(),
  };
};

// Prévisions simulées
export const getSimulatedForecast = (): DayForecast[] => {
  const forecasts: DayForecast[] = [];
  const codes = [0, 1, 2, 3, 61, 80];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const code = codes[Math.floor(Math.random() * codes.length)];
    const info = WEATHER_CODES[code];
    
    forecasts.push({
      date: formatDate(date),
      tempMin: Math.round(24 + Math.random() * 4),
      tempMax: Math.round(30 + Math.random() * 5),
      precipitation: code >= 60 ? Math.round(Math.random() * 20) : 0,
      description: info.desc,
      icon: info.icon,
    });
  }
  
  return forecasts;
};

// Recommandations basées sur la météo
export const getWeatherRecommendations = (weather: WeatherData): string[] => {
  const recommendations: string[] = [];
  
  // Température
  if (weather.temperature > 35) {
    recommendations.push('🌡️ Forte chaleur - augmenter l\'arrosage des cultures');
  } else if (weather.temperature < 20) {
    recommendations.push('🌡️ Température fraîche - surveiller les animaux');
  }
  
  // Humidité
  if (weather.humidity < 50) {
    recommendations.push('💧 Humidité basse - irriguer les parcelles');
  } else if (weather.humidity > 85) {
    recommendations.push('💧 Humidité élevée - risque de moisissures');
  }
  
  // Précipitation
  if (weather.precipitation > 5) {
    recommendations.push('🌧️ Précipitations - reporter les traitements');
  }
  
  // Vent
  if (weather.windSpeed > 30) {
    recommendations.push('💨 Vent fort - sécuriser les structures');
  }
  
  return recommendations;
};

// Widget météo formaté pour l'affichage
export const formatWeatherWidget = (weather: WeatherData): string => {
  return `${weather.icon} ${weather.temperature}°C - ${weather.description}`;
};