'use client';
import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Typography, Space, Button,
  Table, Progress, Alert, Tabs, Spin,
} from 'antd';
import { PlusOutlined, WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { colors, especeConfig } from '@/lib/theme';
import type { StockIntrant, FormuleAliment } from '@/types';
import { FeedFormulator } from '@/components/alimentation/FeedFormulator';
import { stocksService } from '@/lib/crudService';

const { Text } = Typography;

const LOCAL_KEY = 'ferme_stocks_data';

const categorieConfig: Record<string, { icon: string; color: string }> = {
  grains: { icon: '🌽', color: '#FA8C16' },
  tourteau: { icon: '🫘', color: '#795548' },
  fourrage: { icon: '🌿', color: '#52C41A' },
  mineral: { icon: '💊', color: '#1677FF' },
  additif: { icon: '🧪', color: '#722ED1' },
  bsf: { icon: '🪲', color: '#2D7D32' },
};

interface StockLocal {
  id?: string;
  nom: string;
  categorie?: string;
  quantite?: number;
  unite?: string;
  seuil_alerte?: number;
  prix?: number;
  origine?: string;
  localisation?: string;
}

const loadLocal = (): StockLocal[] => {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveLocal = (data: StockLocal[]) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
};

export default function AlimentationPage() {
  const [stocks, setStocks] = useState<StockLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => { loadStocks(); }, []);

  const loadStocks = async () => {
    setLoading(true);
    let local = loadLocal();
    setStocks(local);
    
    try {
      const { data: supaData } = await stocksService.getAll();
      if (supaData && supaData.length > 0) {
        setStocks(supaData);
        saveLocal(supaData);
      }
    } catch {}
    
    setLoading(false);
  };

  // Calculs dynamiques
  const stocksCritiques = stocks.filter(s => (s.quantite || 0) <= (s.seuil_alerte || 0));
  const autonomieGlobale = stocks.length > 0 
    ? Math.round((stocks.filter(s => s.origine === 'local').length / stocks.length) * 100)
    : 0;
  const economieMensuelle = Math.round(
    stocks.filter(s => s.origine === 'local').reduce((sum, s) => sum + ((s.quantite || 0) * (s.prix || 0)), 0) * 0.03
  );

  const stockColumns: ColumnsType<StockLocal> = [
    {
      title: 'Intrant', render: (_, r) => (
        <Space>
          <span style={{ fontSize: 18 }}>{categorieConfig[r.categorie || 'grains']?.icon || '📦'}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{r.nom}</div>
            <Tag style={{ fontSize: 10 }} color={categorieConfig[r.categorie || '']?.color}>{r.categorie}</Tag>
          </div>
        </Space>
      )
    },
    {
      title: 'Stock', render: (_, r) => {
        const qty = r.quantite || 0;
        const seuil = r.seuil_alerte || 10;
        const pct = Math.min(100, (qty / (seuil * 3)) * 100);
        const critique = qty <= seuil;
        return (
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong style={{ color: critique ? colors.error : colors.primary }}>{qty} {r.unite || 'kg'}</Text>
              {critique && <WarningOutlined style={{ color: colors.error }} />}
            </div>
            <Progress percent={Math.round(pct)} strokeColor={critique ? colors.error : colors.success} showInfo={false} size={{ height: 6 }} />
            <Text type="secondary" style={{ fontSize: 10 }}>Seuil : {seuil}</Text>
          </div>
        );
      }
    },
    { title: 'Prix/kg', render: (_, r) => r.prix && r.prix > 0 ? <Text strong>{r.prix} FCA</Text> : <Tag color="green">Local gratuit</Tag> },
    { title: 'Origine', dataIndex: 'origine', render: v => <Tag color={v === 'local' ? 'green' : 'blue'}>{v === 'local' ? '🏡 Local' : '🛒 Achete'}</Tag> },
    { title: 'Localisation', dataIndex: 'localisation', render: v => <Tag>{v}</Tag> },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Chargement des stocks..." />
      </div>
    );
  }

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #FFF9C4, #FFF176)' }}>🌾</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Alimentation Betail</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Stocks, formules, calculateur autonomie</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadStocks}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>
          Entree stock
        </Button>
      </div>

      {stocksCritiques.length > 0 && (
        <Alert
          message={`⚠️ ${stocksCritiques.length} stock(s) critique(s): ${stocksCritiques.map(s => s.nom).join(', ')}`}
          type="warning" showIcon closable style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📦</div>
            <Statistic title="Total Stocks" value={stocks.length} valueStyle={{ fontWeight: 700, color: colors.primary }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Intrants enregistres</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>⚠️</div>
            <Statistic title="Stocks Critiques" value={stocksCritiques.length} valueStyle={{ fontWeight: 700, color: stocksCritiques.length > 0 ? colors.error : colors.success }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Sous seuil</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🌾</div>
            <Statistic title="Autonomie Locale" value={autonomieGlobale} suffix="%" valueStyle={{ fontWeight: 700, color: colors.primary }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Production eigene</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>💰</div>
            <Statistic title="Valeur Stocks" value={economieMensuelle} suffix=" FCA" valueStyle={{ fontWeight: 700, color: colors.success }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Estimation valeur</Text>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="stocks" type="card" items={[
        {
          key: 'stocks', label: '📦 Stocks',
          children: stocks.length > 0 ? (
            <Card style={{ borderRadius: 12 }}>
              <Table columns={stockColumns} dataSource={stocks} rowKey="id" pagination={{ pageSize: 8 }} />
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Aucun stock enregistre. Cliquez sur "Entree stock" pour commencer.
              </Text>
            </Card>
          )
        },
        {
          key: 'formules_avances', label: '🧪 Formulateur',
          children: (
            <FeedFormulator especeCible="poules_pondeuses" />
          )
        },
        {
          key: 'autonomie', label: '📊 Autonomie',
          children: (
            <Card title="🌾 Calculateur Autonomie Alimentaire" style={{ borderRadius: 12 }}>
              {stocks.length > 0 ? (
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <div style={{ padding: 24, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#5A7A5A', marginBottom: 4 }}>Autonomie Globale</div>
                      <div style={{ fontSize: 64, fontWeight: 800, color: colors.primary, lineHeight: 1 }}>{autonomieGlobale}%</div>
                      <Progress percent={autonomieGlobale} strokeColor={{ '0%': '#52C41A', '100%': '#2D7D32' }} size={{ height: 10 }} showInfo={false} style={{ marginTop: 12 }} />
                    </div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary">Ajoutez des stocks pour voir les recommandations d'autonomie.</Text>
                  </Col>
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Text type="secondary">Aucun stock disponible. Ajoutez des stocks pour calculer l'autonomie.</Text>
                </div>
              )}
            </Card>
          )
        },
      ]} />
    </div>
  );
}