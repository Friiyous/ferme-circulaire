'use client';
import React, { useState } from 'react';
import {
  Card, Row, Col, Tag, Typography, Space, Button, Table,
  Progress, Alert, Tabs, message, Spin,
} from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend, ResponsiveContainer, Area,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { getAutonomieEvolution, getCashflowMois } from '@/lib/mockData';
import { colors } from '@/lib/theme';
import { ExportService } from '@/lib/exportService';

const { Text } = Typography;

const kpiAnnuels = [
  { indicateur: 'Autonomie alimentaire', valeur: '-', objectif: '80%', statut: 'En attente', color: colors.primary },
  { indicateur: 'Taux de mortalité animaux', valeur: '-', objectif: '< 5%', statut: 'En attente', color: colors.primary },
  { indicateur: 'Rendement maïs (t/ha)', valeur: '-', objectif: '4.0', statut: 'En attente', color: colors.primary },
  { indicateur: 'Taux valorisation déchets', valeur: '-', objectif: '> 75%', statut: 'En attente', color: colors.primary },
  { indicateur: 'Coût alimentation (FCFA/kg viande)', valeur: '-', objectif: '< 1 500', statut: 'En attente', color: colors.primary },
  { indicateur: 'ROI mensuel', valeur: '-', objectif: '> 150%', statut: 'En attente', color: colors.primary },
  { indicateur: 'Économie engrais chimiques', valeur: '-', objectif: '> 60%', statut: 'En attente', color: colors.primary },
  { indicateur: 'Production œufs/poule/an', valeur: '-', objectif: '260', statut: 'En attente', color: colors.primary },
];

const kpiColumns = [
  { title: 'Indicateur', dataIndex: 'indicateur', render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
  { title: 'Valeur actuelle', dataIndex: 'valeur', render: (v: string, r: any) => <Text strong style={{ color: r.color, fontSize: 14 }}>{v}</Text> },
  { title: 'Objectif', dataIndex: 'objectif', render: (v: string) => <Tag>{v}</Tag> },
  { title: 'Statut', dataIndex: 'statut', render: (v: string) => (
    <Tag color={v.includes('✅') ? 'green' : v.includes('Excellent') ? 'green' : v.includes('Bon') ? 'orange' : 'blue'}>{v}</Tag>
  )},
];

const radialData = [
  { name: 'Autonomie', value: 0, fill: colors.primary },
  { name: 'Valorisation', value: 0, fill: colors.valorisation },
  { name: 'Santé animale', value: 0, fill: colors.success },
  { name: 'ROI', value: 0, fill: colors.info },
];

const cashflowData = getCashflowMois();
const autonomieData = getAutonomieEvolution();

const composedData = cashflowData.map((m: { revenus: number; depenses: number }) => ({
  ...m,
  benefice: m.revenus - m.depenses,
}));

export default function RapportsPage() {
  const [loading, setLoading] = useState(false);

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await ExportService.generateFullReport();
      message.success('Rapport PDF généré !');
    } catch (error) {
      message.error('Erreur lors de la génération du PDF');
    }
    setLoading(false);
  };

  const handleExportCSV = async (type: 'animals' | 'stocks' | 'transactions' | 'employees') => {
    setLoading(true);
    try {
      await ExportService.exportToCSV(type);
      message.success(`Export ${type} téléchargé !`);
    } catch (error) {
      message.error('Erreur lors de l\'export CSV');
    }
    setLoading(false);
  };

  return (
    <div>
      {loading && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(255,255,255,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Spin size="large" tip="Génération en cours..." />
        </div>
      )}

      {/* Header */}
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #B2EBF2, #80DEEA)' }}>📊</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Rapports & Analytics</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Indicateurs clés, comparaisons, exports</Text>
        </div>
        <Space>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={handleExportPDF}
            loading={loading}
          >
            Rapport PDF
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => handleExportCSV('transactions')}
            loading={loading}
          >
            Export Excel
          </Button>
        </Space>
      </div>

      {/* Score global */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', border: 'none', textAlign: 'center', height: '100%' }}>
            <div style={{ fontSize: 14, color: '#5A7A5A', marginBottom: 4 }}>Score Global Performance</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: colors.primary, lineHeight: 1 }}>-</div>
            <div style={{ fontSize: 13, color: '#5A7A5A', marginTop: 4 }}>En attente de données</div>
            <div style={{ marginTop: 16 }}>
              {[
                { label: 'Productivité', score: 0 },
                { label: 'Durabilité', score: 0 },
                { label: 'Financier', score: 0 },
                { label: 'Autonomie', score: 0 },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ fontSize: 12 }}>{item.label}</Text>
                    <Text strong style={{ fontSize: 12 }}>0%</Text>
                  </div>
                  <Progress percent={0} showInfo={false} strokeColor={colors.primary} trailColor="#A5D6A7" size={{ height: 6 }} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16, height: '100%' }} title="📡 Tableau de bord performance">
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart innerRadius={20} outerRadius={120} data={radialData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={6} label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 700 }} />
                <ReTooltip formatter={(v: any, name: any) => [`${v}%`, name]} contentStyle={{ borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="kpi" type="card" items={[
        {
          key: 'kpi', label: '📈 Indicateurs Clés',
          children: (
            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
              <Table
                columns={kpiColumns}
                dataSource={kpiAnnuels}
                rowKey="indicateur"
                pagination={false}
                size="middle"
              />
            </Card>
          ),
        },
        {
          key: 'evolution', label: '📊 Évolution Annuelle',
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title="📈 Cashflow + Bénéfice — 6 derniers mois" style={{ borderRadius: 12 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={composedData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#5A7A5A' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#5A7A5A' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <ReTooltip formatter={(v: any) => `${Number(v).toLocaleString('fr-FR')} FCFA`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="revenus" name="Revenus" fill={colors.success} radius={[4,4,0,0]} barSize={18} />
                      <Bar dataKey="depenses" name="Dépenses" fill="#FFAB91" radius={[4,4,0,0]} barSize={18} />
                      <Line type="monotone" dataKey="benefice" name="Bénéfice net" stroke={colors.primary} strokeWidth={2.5} dot={{ r: 5, fill: colors.primary }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={14}>
                <Card title="🌾 Évolution Autonomie Alimentaire" style={{ borderRadius: 12 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={autonomieData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                      <XAxis dataKey="mois" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[30, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                      <ReTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8 }} />
                      <Area type="monotone" dataKey="autonomie" stroke={colors.primary} fill="#E8F5E9" strokeWidth={2.5} name="Autonomie %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={10}>
                <Card title="📋 Résumé mensuel" style={{ borderRadius: 12, height: '100%' }}>
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">Aucune donnée enregistrée</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          ),
        },
        {
          key: 'export', label: '📤 Exports',
          children: (
            <Row gutter={[16, 16]}>
              {[
                { title: 'Rapport Complet', desc: 'Synthèse globale de la ferme', icon: '📄', format: 'PDF', color: colors.error, action: () => handleExportPDF() },
                { title: 'Export Animaux', desc: 'Registre cheptel avec statut', icon: '🐔', format: 'CSV', color: colors.elevage, action: () => handleExportCSV('animals') },
                { title: 'Export Stocks', desc: 'Inventaire complet', icon: '📦', format: 'CSV', color: colors.warning, action: () => handleExportCSV('stocks') },
                { title: 'Export Finances', desc: 'Toutes les transactions', icon: '💰', format: 'CSV', color: colors.success, action: () => handleExportCSV('transactions') },
                { title: 'Export Employés', desc: 'Liste du personnel', icon: '👥', format: 'CSV', color: colors.info, action: () => handleExportCSV('employees') },
                { title: 'Rapport Financier', desc: 'Bilan mensuel détaillé', icon: '📊', format: 'PDF', color: colors.primary, action: () => handleExportPDF() },
              ].map(doc => (
                <Col xs={24} md={12} lg={8} key={doc.title}>
                  <Card
                    style={{ borderRadius: 12, borderTop: `4px solid ${doc.color}`, cursor: 'pointer', transition: 'all 0.2s' }}
                    hoverable
                    bodyStyle={{ padding: 20 }}
                    onClick={doc.action}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: 32 }}>{doc.icon}</span>
                      <Tag color={doc.format === 'PDF' ? 'red' : 'green'}>{doc.format}</Tag>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#1A2E1A' }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: '#5A7A5A', marginBottom: 16 }}>{doc.desc}</div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      size="small"
                      style={{ background: doc.color, borderColor: doc.color }}
                      onClick={e => { e.stopPropagation(); doc.action(); }}
                    >
                      Télécharger
                    </Button>
                  </Card>
                </Col>
              ))}
              <Col xs={24}>
                <Alert
                  message="💡 Cliquez sur une carte pour télécharger le fichier. Les données sont exportées depuis Supabase."
                  type="success" showIcon style={{ borderRadius: 10 }}
                />
              </Col>
            </Row>
          ),
        },
      ]} />
    </div>
  );
}