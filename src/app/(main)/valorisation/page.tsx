'use client';
import React, { useState } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Tag, Tabs, Steps, Typography,
  Space, Button, Table, Badge, Tooltip, Timeline, Alert,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { mockDigesteur, mockBacsCompost, mockBacsBSF } from '@/lib/mockData';
import { colors } from '@/lib/theme';
import type { BacBSF, BacCompost, MaturiteCompost, StadeBSF } from '@/types';
import { BiogasMonitor } from '@/components/valorisation/BiogasMonitor';
import { BSFTracker } from '@/components/valorisation/BSFTracker';

const { Text, Title } = Typography;

const maturiteConfig: Record<MaturiteCompost, { color: string; label: string; pct: number }> = {
  frais: { color: 'red', label: '🆕 Frais', pct: 10 },
  en_cours: { color: 'orange', label: '⏳ En cours', pct: 55 },
  pret: { color: 'green', label: '✅ Prêt', pct: 100 },
  utilise: { color: 'default', label: '✔ Utilisé', pct: 100 },
};

const stadesBSF = [
  { title: 'Œufs', description: 'J0-J3' },
  { title: 'Larves jeunes', description: 'J3-J7' },
  { title: 'Larves matures', description: 'J7-J14' },
  { title: 'Nymphe', description: 'J14-J18' },
  { title: 'Adulte/Récolte', description: 'J14+' },
];

const stadeIndex: Record<StadeBSF, number> = {
  oeufs: 0, larves_jeunes: 1, larves_matures: 2, nymphe: 3, adulte: 4
};

const biogasData = Array.from({ length: 14 }, (_, i) => ({
  jour: `J-${13 - i}`,
  gaz: +(2.8 + Math.sin(i * 0.5) * 0.8 + Math.random() * 0.3).toFixed(2),
  slurry: Math.floor(40 + Math.random() * 10),
}));

const fluxData = [
  { source: 'Fumier volailles', quantite: 45, unite: 'kg/j', destination: 'Digesteur + BSF' },
  { source: 'Fumier ruminants/bovins', quantite: 85, unite: 'kg/j', destination: 'Digesteur + Compost' },
  { source: 'Déchets cuisine', quantite: 12, unite: 'kg/j', destination: 'BSF + Compost' },
  { source: 'Résidus cultures', quantite: 30, unite: 'kg/j', destination: 'Compost' },
  { source: 'Bio-slurry (sortie)', quantite: 45, unite: 'kg/j', destination: 'Parcelles fertilisation' },
  { source: 'Compost mûr (sortie)', quantite: 15, unite: 'kg/j', destination: 'Vente + Jardins' },
  { source: 'Larves BSF (sortie)', quantite: 3, unite: 'kg/j', destination: 'Alimentation volailles' },
];

export default function ValorisationPage() {
  const { niveauActuel, productionGazJour, bioSlurryJour, volume } = mockDigesteur;

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #E1BEE7, #CE93D8)' }}>♻️</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Valorisation Déchets</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Biogaz · Compost · BSF · Flux déchets</Text>
        </div>
      </div>

      {/* Stats globales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Production Biogaz', value: productionGazJour, suffix: ' m³/j', icon: '⚡', color: colors.warning },
          { title: 'Bio-slurry Produit', value: bioSlurryJour, suffix: ' kg/j', icon: '💧', color: colors.info },
          { title: 'Compost Disponible', value: 180, suffix: ' kg', icon: '🌿', color: colors.primary },
          { title: 'Larves BSF Stock', value: 45, suffix: ' kg', icon: '🪲', color: colors.valorisation },
        ].map(s => (
          <Col xs={12} lg={6} key={s.title}>
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs defaultActiveKey="biogaz" type="card" items={[
        {
          key: 'biogaz', label: '⚡ Biogaz',
          children: (
            <BiogasMonitor digesteur={mockDigesteur as any} />
          ),
        },
        {
          key: 'compost', label: '🌿 Compost',
          children: (
            <Row gutter={[16, 16]}>
              {mockBacsCompost.map(bac => (
                <Col xs={24} md={8} key={bac.id}>
                  <Card title={bac.nom} style={{ borderRadius: 12, borderTop: `4px solid ${bac.maturite === 'pret' ? colors.success : bac.maturite === 'en_cours' ? colors.warning : colors.error}` }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text type="secondary">Maturité</Text>
                          <Tag color={maturiteConfig[bac.maturite].color}>{maturiteConfig[bac.maturite].label}</Tag>
                        </div>
                        <Progress percent={maturiteConfig[bac.maturite].pct} strokeColor={bac.maturite === 'pret' ? colors.success : colors.warning} showInfo={false} size={{ height: 8 }} />
                      </div>
                      {[
                        { l: '📦 Quantité', v: `${bac.quantiteEstimee} kg` },
                        { l: '🗓️ Créé le', v: new Date(bac.dateCreation).toLocaleDateString('fr-FR') },
                        { l: '🔬 Type', v: { chaud: 'Compost chaud', froid: 'Compost froid', vermi: 'Vermicompost', mixte: 'Compost mixte' }[bac.type] || bac.type },
                      ].map(item => (
                        <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>{item.l}</Text>
                          <Text strong style={{ fontSize: 13 }}>{item.v}</Text>
                        </div>
                      ))}
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ingrédients :</Text>
                        <Space wrap size={4}>
                          {bac.ingredients.map(ing => <Tag key={ing} style={{ fontSize: 11 }}>{ing}</Tag>)}
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ),
        },
        {
          key: 'bsf', label: '🪲 BSF (Larves)',
          children: (
             <BSFTracker bacs={mockBacsBSF as any} />
          ),
        },
        {
          key: 'flux', label: '🔄 Flux Déchets',
          children: (
            <Card title="🔄 Flux de déchets journaliers" style={{ borderRadius: 12 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F5FAF5' }}>
                      {['Source / Type', 'Quantité', 'Unité', 'Destination'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '2px solid #E8F5E9' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fluxData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F0F5F0', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FDF9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>
                          <span style={{ fontWeight: 500 }}>{row.source}</span>
                          {row.source.includes('sortie') && <Tag style={{ marginLeft: 6, fontSize: 10 }} color="blue">sortie</Tag>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: colors.primary }}>{row.quantite}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#5A7A5A' }}>{row.unite}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12 }}>
                          <Tag color={row.destination.includes('Digesteur') ? 'orange' : row.destination.includes('Vente') ? 'blue' : 'green'}>{row.destination}</Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 20, padding: 16, background: '#F0F5F0', borderRadius: 12 }}>
                <Text strong>🌟 Impact positif estimé</Text>
                <Row gutter={[16, 8]} style={{ marginTop: 12 }}>
                  {[
                    { label: 'Engrais chimiques économisés', value: '~12 000 FCFA/mois' },
                    { label: 'Farine poisson remplacée par BSF', value: '~8 500 FCFA/mois' },
                    { label: 'Gaz butane économisé', value: '~52 500 FCFA/mois' },
                  ].map(item => (
                    <Col xs={24} sm={8} key={item.label}>
                      <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, borderLeft: `3px solid ${colors.primary}` }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{item.label}</Text>
                        <Text strong style={{ color: colors.primary }}>{item.value}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>
          ),
        },
      ]} />
    </div>
  );
}
