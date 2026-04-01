'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Space, Tag, Progress, Badge, Tooltip, Table, Statistic } from 'antd';
import { 
  BellOutlined, HomeOutlined, ThunderboltOutlined, CarOutlined, ShoppingOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer
} from 'recharts';
import { getMarketPrices, getMarketTrends, getSellingRecommendations } from '@/lib/marketService';
import { colors } from '@/lib/theme';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { stocksService } from '@/lib/crudService';
import { transactionsService } from '@/lib/crudService';
import Link from 'next/link';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

// =============================================
// HEADER PRO
// =============================================

const DashboardHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const shortcuts = [
    { icon: '🐔', label: 'Élevage', href: '/elevage', color: '#FFE0B2' },
    { icon: '🌱', label: 'Cultures', href: '/cultures', color: '#C8E6C9' },
    { icon: '⚡', label: 'Biogaz', href: '/valorisation', color: '#E1F5FE' },
    { icon: '💰', label: 'Finances', href: '/finances', color: '#F3E5F5' },
    { icon: '📦', label: 'Stock', href: '/inventaire', color: '#FFF3E0' },
  ];

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1A2E1A 0%, #2D5A2D 100%)', 
      padding: '20px 24px', 
      borderRadius: 16, 
      marginBottom: 24,
      color: 'white'
    }}>
      <Row align="middle" justify="space-between">
        <Col>
          <Row align="middle" gutter={16}>
            <Col>
              <div style={{ fontSize: 36 }}>🌿</div>
            </Col>
            <Col>
              <Title level={3} style={{ margin: 0, color: 'white' }}>Ferme Circulaire 1 Ha</Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                Korhogo, Nord Côte d'Ivoire
              </Text>
            </Col>
          </Row>
        </Col>
        
        <Col>
          <Space size={24}>
            {shortcuts.map((s, i) => (
              <Link key={i} href={s.href}>
                <Tooltip title={s.label}>
                  <div style={{ 
                    background: s.color, 
                    padding: '10px 14px', 
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                  </div>
                </Tooltip>
              </Link>
            ))}
          </Space>
        </Col>

        <Col>
          <Space size={16}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'long' })}
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                {currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

// =============================================
// KPI DYNAMIQUE DEPUIS SUPABASE
// =============================================

const KPIRow: React.FC = () => {
  const [kpis, setKpis] = useState({
    animaux: 0,
    stocks: 0,
    revenus: 0,
    depenses: 0,
    stocksBas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKPIs() {
      try {
        // Charger depuis Supabase
        const [animalsRes, stocksRes, transactionsRes] = await Promise.all([
          stocksService.getAll(),
          stocksService.getAll(),
          transactionsService.getAll()
        ]);
        
        const animals = animalsRes.data || [];
        const stocks = stocksRes.data || [];
        const transactions = transactionsRes.data || [];
        
        const stocksBas = stocks.filter((s: any) => s.quantite <= s.seuil_alerte).length;
        const revenus = transactions
          .filter((t: any) => t.type === 'revenu')
          .reduce((sum: number, t: any) => sum + Number(t.montant || 0), 0);
        const depenses = transactions
          .filter((t: any) => t.type === 'depense')
          .reduce((sum: number, t: any) => sum + Number(t.montant || 0), 0);
        
        setKpis({
          animaux: animals.length,
          stocks: stocks.length,
          revenus,
          depenses,
          stocksBas
        });
      } catch (e) {
        console.error('Erreur chargement KPIs:', e);
      }
      setLoading(false);
    }
    loadKPIs();
  }, []);

  if (loading) return <Card loading style={{ borderRadius: 16 }} />;

  const items = [
    { icon: '🐔', title: 'Animaux', value: kpis.animaux, suffix: 'têtes', color: colors.warning },
    { icon: '📦', title: 'Stocks', value: kpis.stocks, suffix: 'items', color: colors.info },
    { icon: '💰', title: 'Revenus', value: kpis.revenus, suffix: 'FCA', color: colors.success },
    { icon: '📉', title: 'Dépenses', value: kpis.depenses, suffix: 'FCA', color: colors.error },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {items.map((kpi, i) => (
        <Col xs={12} lg={6} key={i}>
          <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>{kpi.title}</Text>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>
                    {kpi.value.toLocaleString()}
                  </span>
                  <Text style={{ fontSize: 14, color: '#888', marginLeft: 4 }}>{kpi.suffix}</Text>
                </div>
              </div>
              <div style={{ fontSize: 36, opacity: 0.8 }}>{kpi.icon}</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// =============================================
// PRIX DU MARCHE
// =============================================

const MarketSection: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketPrices('Korhogo').then(data => {
      setMarketData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Card loading style={{ borderRadius: 16 }} />;

  const trends = getMarketTrends();
  const recommendations = getSellingRecommendations();

  const columns = [
    { title: 'Produit', dataIndex: 'product', key: 'product' },
    { title: 'Prix', dataIndex: 'price', key: 'price', render: (v: number, r: any) => `${v.toLocaleString()} ${r.unit}` },
    { title: 'Tendance', dataIndex: 'trend', key: 'trend', render: (v: string) => {
      if (v === 'up') return <Tag color="green">↑</Tag>;
      if (v === 'down') return <Tag color="red">↓</Tag>;
      return <Tag>→</Tag>;
    }},
  ];

  return (
    <Card 
      title={<Space><ShoppingOutlined style={{ color: colors.warning }} /><Text strong>📊 Prix du Marché</Text></Space>}
      style={{ borderRadius: 16, marginBottom: 24 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 12, background: '#F6FFED', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.success }}>{trends.up}</div>
                <Text type="secondary">Hausse</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 12, background: '#FFF2F0', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.error }}>{trends.down}</div>
                <Text type="secondary">Baisse</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: 12, background: '#F0F5FF', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: colors.info }}>{trends.stable}</div>
                <Text type="secondary">Stable</Text>
              </div>
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={12}>
          <Table 
            dataSource={marketData?.prices.slice(0, 5)} 
            columns={columns} 
            pagination={false} 
            size="small"
            rowKey="product"
          />
        </Col>
      </Row>
    </Card>
  );
};

// =============================================
// PRODUCTION (VIDE AU DEBUT)
// =============================================

const ProductionDuJour: React.FC = () => {
  return (
    <Card title="📊 Production du Jour" style={{ borderRadius: 16, marginBottom: 24 }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Ajoutez des données de production pour voir les statistiques
        </Text>
        <div style={{ marginTop: 16 }}>
          <Link href="/elevage">
            <Button type="primary">Aller au module Élevage</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

// =============================================
// GRAPHIQUES (VIDES)
// =============================================

const ChartsSection: React.FC = () => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} lg={14}>
        <Card title="🥚 Production" style={{ borderRadius: 16, height: '100%' }}>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="secondary">Aucune donnée de production</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title="💰 Cashflow" style={{ borderRadius: 16, height: '100%' }}>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="secondary">Aucune transaction</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

// =============================================
// PIED DE PAGE
// =============================================

const DashboardFooter: React.FC = () => {
  return (
    <div style={{ 
      background: '#F5F5F5', 
      padding: '16px 24px', 
      borderRadius: 12,
      marginTop: 24
    }}>
      <Row align="middle" justify="space-between">
        <Col>
          <Space>
            <Link href="/dashboard"><Button icon={<HomeOutlined />}>Dashboard</Button></Link>
            <Link href="/elevage"><Button>🐔 Élevage</Button></Link>
            <Link href="/cultures"><Button>🌱 Cultures</Button></Link>
            <Link href="/valorisation"><Button icon={<ThunderboltOutlined />}>Valorisation</Button></Link>
            <Link href="/finances"><Button icon={<CarOutlined />}>Finances</Button></Link>
          </Space>
        </Col>
        <Col>
          <Tag color="green">● Connecté Supabase</Tag>
          <Text type="secondary" style={{ marginLeft: 16 }}>Ferme Circulaire v2.2</Text>
        </Col>
      </Row>
    </div>
  );
};

// =============================================
// PAGE PRINCIPALE
// =============================================

export default function DashboardPage() {
  return (
    <div style={{ padding: '0 24px 24px' }}>
      <DashboardHeader />
      <KPIRow />
      <MarketSection />
      <ProductionDuJour />
      <ChartsSection />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="📈 Autonomie" style={{ borderRadius: 16 }}>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Text type="secondary">Aucune donnée</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <WeatherWidget />
        </Col>
      </Row>
      <DashboardFooter />
    </div>
  );
}