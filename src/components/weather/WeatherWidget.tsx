// =============================================
// WIDGET MÉTÉO - Pour le dashboard (OPTIMISÉ)
// =============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Typography, Space, Tag, Spin } from 'antd';
import { CloudOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCurrentWeather, getWeatherForecast, getWeatherRecommendations, getSimulatedWeather, type WeatherData, type DayForecast } from '@/lib/weatherService';

const { Text, Title } = Typography;

// Intervalle minimum entre les refreshs (30 secondes)
const MIN_REFRESH_INTERVAL = 30000;

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const lastRefreshRef = useRef<number>(0);
  
  // Memoizer les recommandations pour éviter les recalculs
  const recommendations = weather ? getWeatherRecommendations(weather) : [];
  
  // Fonction debounced pour éviter les reloads trop fréquents
  const loadWeather = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Empêcher les refreshs trop rapprochés (sauf forcé)
    if (!force && now - lastRefreshRef.current < MIN_REFRESH_INTERVAL) {
      return;
    }
    
    lastRefreshRef.current = now;
    setLoading(true);
    setError(false);
    
    try {
      const data = await getCurrentWeather();
      const forecast = await getWeatherForecast();
      data.forecast = forecast;
      setWeather(data);
    } catch (e) {
      setWeather(getSimulatedWeather());
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    
    // Auto-refresh toutes les 5 minutes
    const interval = setInterval(() => loadWeather(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  if (loading) {
    return (
      <Card size="small" style={{ textAlign: 'center', padding: 20 }}>
        <Spin />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">Chargement météo...</Text>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card 
      size="small" 
      title={
        <Space>
          <CloudOutlined />
          <span>Météo - Abidjan</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {error ? '(données simulées)' : ''}
          </Text>
        </Space>
      }
      extra={
        <ReloadOutlined 
          onClick={() => loadWeather(true)} 
          style={{ cursor: 'pointer' }}
          title="Actualiser"
        />
      }
    >
      {/* Temps actuel */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 48 }}>{weather.icon}</div>
        <Title level={2} style={{ margin: 0 }}>
          {weather.temperature}°C
        </Title>
        <Text>{weather.description}</Text>
      </div>

      {/* Détails */}
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">Humidité</Text>
          <Text>{weather.humidity}%</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">Vent</Text>
          <Text>{weather.windSpeed} km/h</Text>
        </div>
        {weather.precipitation > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">Précipitations</Text>
            <Text>{weather.precipitation} mm</Text>
          </div>
        )}
      </Space>

      {/* Prévisions */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ fontSize: 12 }}>Prévisions 7 jours:</Text>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 8,
            overflowX: 'auto',
            gap: 4
          }}>
            {weather.forecast.slice(0, 5).map((day: DayForecast, i: number) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 45 }}>
                <div style={{ fontSize: 16 }}>{day.icon}</div>
                <Text style={{ fontSize: 11 }} type="secondary">
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </Text>
                <div>
                  <Text strong style={{ fontSize: 11 }}>{day.tempMax}°</Text>
                  <Text type="secondary" style={{ fontSize: 10 }}> / {day.tempMin}°</Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
          <Text strong style={{ fontSize: 12 }}>💡 Conseils du jour:</Text>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, fontSize: 11 }}>
            {recommendations.map((rec: string, i: number) => (
              <li key={i} style={{ color: '#666' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default WeatherWidget;