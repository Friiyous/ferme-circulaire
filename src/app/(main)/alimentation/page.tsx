'use client';
import React from 'react';
import {
  Card, Row, Col, Statistic, Tag, Typography, Space, Button,
  Table, Progress, Alert, Tabs, Select, Tooltip,
} from 'antd';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { mockStocks, mockFormules } from '@/lib/mockData';
import { colors, especeConfig } from '@/lib/theme';
import type { StockIntrant, FormuleAliment } from '@/types';
import { FeedFormulator } from '@/components/alimentation/FeedFormulator';
import { StockManager } from '@/components/stocks/StockManager';

const { Text } = Typography;

const categorieConfig: Record<string, { icon: string; color: string }> = {
  grains: { icon: '🌽', color: '#FA8C16' },
  tourteau: { icon: '🫘', color: '#795548' },
  fourrage: { icon: '🌿', color: '#52C41A' },
  mineral: { icon: '💊', color: '#1677FF' },
  additif: { icon: '🧪', color: '#722ED1' },
  bsf: { icon: '🪲', color: '#2D7D32' },
};

const stockColumns: ColumnsType<StockIntrant> = [
  {
    title: 'Intrant', render: (_, r) => (
      <div>
        <Space>
          <span style={{ fontSize: 18 }}>{categorieConfig[r.categorie]?.icon}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nom}</div>
            <Tag style={{ fontSize: 10 }} color={categorieConfig[r.categorie]?.color}>{r.categorie}</Tag>
          </div>
        </Space>
      </div>
    )
  },
  {
    title: 'Stock', render: (_, r) => {
      const pct = (r.quantite / (r.seuilAlerte * 3)) * 100;
      const critique = r.quantite <= r.seuilAlerte;
      return (
        <div style={{ minWidth: 120 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text strong style={{ color: critique ? colors.error : colors.primary }}>{r.quantite} kg</Text>
            {critique && <Tooltip title="Stock critique !"><WarningOutlined style={{ color: colors.error }} /></Tooltip>}
          </div>
          <Progress
            percent={Math.min(100, Math.round(pct))}
            strokeColor={critique ? colors.error : colors.success}
            showInfo={false}
            size={{ height: 6 }}
          />
          <Text type="secondary" style={{ fontSize: 10 }}>Seuil : {r.seuilAlerte} kg</Text>
        </div>
      );
    }
  },
  { title: 'Prix/kg', render: (_, r) => r.prix > 0 ? <Text strong>{r.prix} FCFA</Text> : <Tag color="green">Local gratuit</Tag> },
  { title: 'Origine', dataIndex: 'origine', render: v => <Tag color={v === 'local' ? 'green' : 'blue'}>{v === 'local' ? '🏡 Local' : '🛒 Acheté'}</Tag> },
  { title: 'Localisation', dataIndex: 'localisation', render: v => <Tag icon={<span>📦</span>}>{v}</Tag> },
];

const radarDataVolailles = [
  { subject: 'Protéines', A: 92, fullMark: 100 },
  { subject: 'Énergie', A: 87, fullMark: 100 },
  { subject: 'Minéraux', A: 78, fullMark: 100 },
  { subject: 'Fibres', A: 65, fullMark: 100 },
  { subject: 'Vitamines', A: 72, fullMark: 100 },
  { subject: 'Autonomie', A: 72, fullMark: 100 },
];

export default function AlimentationPage() {
  const stocksCritiques = mockStocks.filter(s => s.quantite <= s.seuilAlerte);
  const autonomieGlobale = 68;
  const economieMensuelle = Math.round(
    mockStocks.filter(s => s.origine === 'local').reduce((sum, s) => sum + s.quantite * s.prix, 0) * 0.03
  );

  const formuleColumns: ColumnsType<FormuleAliment> = [
    { title: 'Formule', render: (_, r) => <div><div style={{ fontWeight: 600 }}>{r.nom}</div><Tag>{r.stade}</Tag></div> },
    { title: 'Espèce', dataIndex: 'especeCible', render: v => <Space><span>{especeConfig[v]?.emoji}</span><span>{especeConfig[v]?.label}</span></Space> },
    { title: 'Protéines', render: (_, r) => <Tag color={r.proteinesBrutes >= 16 ? 'green' : 'orange'}>{r.proteinesBrutes}%</Tag> },
    { title: 'Autonomie locale', render: (_, r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
        <Progress percent={r.autonomiePourcentage} showInfo={false} strokeColor={colors.primary} size={{ height: 6 }} style={{ flex: 1 }} />
        <Text strong style={{ fontSize: 12, color: colors.primary }}>{r.autonomiePourcentage}%</Text>
      </div>
    )},
    { title: 'Coût/100kg', render: (_, r) => <Text strong style={{ color: colors.finances }}>{r.coutPour100kg.toLocaleString('fr-FR')} FCFA</Text> },
    { title: 'vs Provende ind.', render: () => <Tag color="green">-{Math.floor(Math.random() * 20 + 15)}%</Tag> },
  ];

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #FFF9C4, #FFF176)' }}>🌾</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Alimentation Bétail</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Stocks, formules, calculateur autonomie</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>Entrée stock</Button>
      </div>

      {stocksCritiques.length > 0 && (
        <Alert
          title={`⚠️ ${stocksCritiques.length} stock(s) critique(s) : ${stocksCritiques.map(s => s.nom).join(', ')}`}
          type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Autonomie Globale', value: autonomieGlobale, suffix: '%', icon: '🌾', color: colors.primary },
          { title: 'Stocks Critiques', value: stocksCritiques.length, icon: '⚠️', color: colors.error },
          { title: 'Coût alim./jour', value: '1 977', suffix: ' FCFA', icon: '💸', color: colors.warning },
          { title: 'Économie vs achat', value: `~${economieMensuelle.toLocaleString('fr-FR')}`, suffix: ' FCFA/m', icon: '💰', color: colors.success },
        ].map(s => (
          <Col xs={12} lg={6} key={s.title}>
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} styles={{ content: { color: s.color, fontWeight: 700, fontSize: s.title === 'Économie vs achat' ? 18 : 28 } }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs defaultActiveKey="stocks" type="card" items={[
        {
          key: 'stocks', label: '📦 Stocks',
          children: (
             <StockManager stocks={mockStocks as any} />
          )
        },
        {
          key: 'formules_avances', label: '🧪 Formulateur',
          children: (
            <FeedFormulator especeCible="poules_pondeuses" />
          )
        },
        {
          key: 'autonomie', label: '📊 Calculateur Autonomie',
          children: (
            <Card title="🌾 Calculateur Autonomie Alimentaire" style={{ borderRadius: 12 }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 16 }}>Cheptel actuel</Text>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {[
                      { espece: 'poule', count: 8, besoin: 0.3, local: 0.216 },
                      { espece: 'canard', count: 1, besoin: 0.35, local: 0.21 },
                      { espece: 'chevre', count: 2, besoin: 1.6, local: 1.36 },
                      { espece: 'mouton', count: 1, besoin: 1.25, local: 1.0 },
                      { espece: 'bovin', count: 1, besoin: 12, local: 7.2 },
                    ].map(item => {
                      const autonomie = Math.round((item.local / item.besoin) * 100);
                      return (
                        <div key={item.espece} style={{ padding: '12px 16px', background: '#F5FAF5', borderRadius: 10, border: '1px solid #D9E8D9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Space>
                              <span style={{ fontSize: 20 }}>{especeConfig[item.espece]?.emoji}</span>
                              <span style={{ fontWeight: 600 }}>{especeConfig[item.espece]?.label} (×{item.count})</span>
                            </Space>
                            <Tag color={autonomie >= 80 ? 'green' : autonomie >= 60 ? 'orange' : 'red'}>{autonomie}% local</Tag>
                          </div>
                          <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
                            <div><Text type="secondary" style={{ fontSize: 11 }}>Besoin/j</Text><br/><Text strong>{item.besoin} kg</Text></div>
                            <div><Text type="secondary" style={{ fontSize: 11 }}>Local/j</Text><br/><Text strong style={{ color: colors.primary }}>{item.local} kg</Text></div>
                            <div><Text type="secondary" style={{ fontSize: 11 }}>Achat/j</Text><br/><Text strong style={{ color: colors.error }}>{+(item.besoin - item.local).toFixed(2)} kg</Text></div>
                          </div>
                          <Progress percent={autonomie} strokeColor={{ '0%': '#52C41A', '100%': '#2D7D32' }} showInfo={false} size={{ height: 6 }} />
                        </div>
                      );
                    })}
                  </Space>
                </Col>
                <Col xs={24} lg={12}>
                  <div style={{ padding: 24, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 16, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 14, color: '#5A7A5A', marginBottom: 4 }}>Autonomie Globale</div>
                    <div style={{ fontSize: 64, fontWeight: 800, color: colors.primary, lineHeight: 1 }}>{autonomieGlobale}%</div>
                    <Progress percent={autonomieGlobale} strokeColor={{ '0%': '#52C41A', '100%': '#2D7D32' }} trailColor="#A5D6A7" size={{ height: 10 }} showInfo={false} style={{ marginTop: 12 }} />
                    <div style={{ marginTop: 8, fontSize: 13, color: '#5A7A5A' }}>Objectif 2026 : 80% <strong style={{ color: colors.primary }}>(+12%)</strong></div>
                  </div>
                  <Card size="small" style={{ borderRadius: 12 }}>
                    <Text strong>💡 Recommandations pour atteindre 80%</Text>
                    <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 13 }}>
                      <li>Augmenter la production BSF de <strong>3 → 6 bacs</strong> actifs</li>
                      <li>Ensiler davantage de Brachiaria (500 kg supp.)</li>
                      <li>Cultiver de la légumineuse (mucuna) pour bovins</li>
                      <li>Agrandir la parcelle niébé de 500 m²</li>
                    </ul>
                    <div style={{ background: '#F0F9F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: colors.primary }}>✅ Impact estimé : +12% autonomie = économie <strong>~45 000 FCFA/mois</strong></Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>
          )
        },
      ]} />
    </div>
  );
}
