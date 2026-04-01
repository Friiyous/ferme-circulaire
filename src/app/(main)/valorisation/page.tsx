'use client';
import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Tag, Tabs, Typography, Button, Space,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { colors } from '@/lib/theme';
import { BiogasMonitor } from '@/components/valorisation/BiogasMonitor';
import { BSFTracker } from '@/components/valorisation/BSFTracker';

const { Text } = Typography;

const LOCAL_KEY = 'ferme_valorisation_data';

interface ValorisationData {
  digesteur?: { niveau: number; production: number; slurry: number; volume: number };
  compost?: any[];
  bsf?: any[];
}

const loadLocal = (): ValorisationData | null => {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

const saveLocal = (data: ValorisationData) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
};

export default function ValorisationPage() {
  const [data, setData] = useState<ValorisationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const local = loadLocal();
    setData(local);
    setLoading(false);
  };

  // Stats based on saved data
  const digesteur = data?.digesteur;
  const compostCount = data?.compost?.length || 0;
  const bsfCount = data?.bsf?.length || 0;

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #E1BEE7, #CE93D8)' }}>♻️</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Valorisation Dechets</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Biogaz · Compost · BSF</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData}>Actualiser</Button>
      </div>

      {/* Stats - dynamiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>⚡</div>
            <Statistic title="Biogaz" value={digesteur?.production || 0} suffix="m³/j" valueStyle={{ fontWeight: 700, color: colors.warning }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Production journaliere</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>💧</div>
            <Statistic title="Bio-slurry" value={digesteur?.slurry || 0} suffix="kg/j" valueStyle={{ fontWeight: 700, color: colors.info }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Engrais produit</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🌿</div>
            <Statistic title="Compost" value={compostCount} suffix="bacs" valueStyle={{ fontWeight: 700, color: colors.primary }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistres</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🪲</div>
            <Statistic title="BSF" value={bsfCount} suffix="bacs" valueStyle={{ fontWeight: 700, color: colors.valorisation }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Larves actifs</Text>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="biogaz" type="card" items={[
        {
          key: 'biogaz', label: '⚡ Biogaz',
          children: digesteur ? (
            <BiogasMonitor digesteur={digesteur as any} />
          ) : (
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Aucun digesteur configure. Ajoutez vos donnees de biogaz.
              </Text>
            </Card>
          ),
        },
        {
          key: 'compost', label: '🌿 Compost',
          children: compostCount > 0 ? (
            <Row gutter={[16, 16]}>
              {data?.compost?.map((bac: any, i: number) => (
                <Col xs={24} md={8} key={i}>
                  <Card title={bac.nom} style={{ borderRadius: 12 }}>
                    <Text type="secondary">Bac de compost</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Aucun bac de compost enregistre.
              </Text>
            </Card>
          ),
        },
        {
          key: 'bsf', label: '🪲 BSF',
          children: bsfCount > 0 ? (
            <BSFTracker bacs={data?.bsf as any} />
          ) : (
            <Card style={{ textAlign: 'center', borderRadius: 12 }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Aucun bac BSF enregistre.
              </Text>
            </Card>
          ),
        },
      ]} />
    </div>
  );
}