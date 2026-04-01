'use client';

import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Progress, Button, Tooltip, List } from 'antd';
import { 
  SyncOutlined, 
  ApiOutlined, 
  ArrowRightOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ShopOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { colors } from '@/lib/theme';
import type { LiaisonCirculaire, CircuitCircularite } from '@/types';

const { Text, Title } = Typography;

// =============================================
// CONFIGURATION DES FLUX CIRCULAIRES
// =============================================

const FLUX_CIRCULAIRES: LiaisonCirculaire[] = [
  // ÉLEVAGE → VALORISATION
  { id: '1', entree: 'Fumier volailles', sortie: 'Biogaz', typeLiaison: 'fumier', eficacite: 85 },
  { id: '2', entree: 'Fumier ruminants', sortie: 'Compost', typeLiaison: 'fumier', eficacite: 90 },
  { id: '3', entree: 'Déjections porcs', sortie: 'Biogaz + Compost', typeLiaison: 'fumier', eficacite: 80 },
  
  // VALORISATION → CULTURES
  { id: '4', entree: 'Bio-slurry', sortie: 'Engrais cultures', typeLiaison: 'biogaz', eficacite: 95 },
  { id: '5', entree: 'Compost mûr', sortie: 'Fertilisation parcelles', typeLiaison: 'compost', eficacite: 100 },
  { id: '6', entree: 'Eau biogaz', sortie: 'Irrigation', typeLiaison: 'biogaz', eficacite: 75 },
  
  // CULTURES → ÉLEVAGE
  { id: '7', entree: 'Maïs/Sorgho', sortie: 'Alimentation bétail', typeLiaison: 'residus', eficacite: 100 },
  { id: '8', entree: 'Brachiaria', sortie: 'Fourrage ruminants', typeLiaison: 'residus', eficacite: 100 },
  { id: '9', entree: 'Résidus niébé', sortie: 'Complément proteines', typeLiaison: 'residus', eficacite: 85 },
  
  // BSF (Insectes)
  { id: '10', entree: 'Déchets organiques', sortie: 'Larves BSF', typeLiaison: 'larves', eficacite: 80 },
  { id: '11', entree: 'Larves BSF', sortie: 'Alimentation volailles', typeLiaison: 'larves', eficacite: 90 },
  { id: '12', entree: 'Fientes BSF', sortie: 'Engrais cultures', typeLiaison: 'compost', eficacite: 95 },
];

// Circuits de circularité
const CIRCUITS: CircuitCircularite[] = [
  {
    id: 'c1',
    nom: 'Circuit Fumier → Biogaz → Slurry → Cultures',
    flux: [
      { entree: 'Fumier animaux', sortie: 'Biogaz', pourcentage: 85 },
      { entree: 'Biogaz', sortie: 'Bio-slurry', pourcentage: 95 },
      { entree: 'Bio-slurry', sortie: 'Engrais', pourcentage: 100 },
    ],
    coutEconomie: 45000,
  },
  {
    id: 'c2',
    nom: 'Circuit Déchets → BSF → Alimentation → Fumier',
    flux: [
      { entree: 'Déchets cuisine', sortie: 'BSF', pourcentage: 80 },
      { entree: 'BSF', sortie: 'Alimentation', pourcentage: 90 },
      { entree: 'Alimentation', sortie: 'Fumier', pourcentage: 85 },
    ],
    coutEconomie: 35000,
  },
  {
    id: 'c3',
    nom: 'Circuit Cultures → Résidus → Alimentation → Fumier → Compost → Cultures',
    flux: [
      { entree: 'Récolte', sortie: 'Résidus', pourcentage: 100 },
      { entree: 'Résidus', sortie: 'Alimentation', pourcentage: 90 },
      { entree: 'Alimentation', sortie: 'Fumier', pourcentage: 80 },
      { entree: 'Fumier', sortie: 'Compost', pourcentage: 90 },
      { entree: 'Compost', sortie: 'Engrais', pourcentage: 100 },
    ],
    coutEconomie: 85000,
  },
];

// =============================================
// COMPOSANT PRINCIPAL
// =============================================

export const CircularEconomyFlow: React.FC = () => {
  const [circuitActif, setCircuitActif] = useState<string>('c1');

  // Calcul du score de circularité global
  const scoreCircularite = useMemo(() => {
    const totalEfficacite = FLUX_CIRCULAIRES.reduce((sum, f) => sum + f.eficacite, 0);
    return Math.round(totalEfficacite / FLUX_CIRCULAIRES.length);
  }, []);

  // Économies totales
  const economieTotale = useMemo(() => {
    return CIRCUITS.reduce((sum, c) => sum + c.coutEconomie, 0);
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* En-tête */}
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', 
          borderRadius: 16 
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <SyncOutlined style={{ fontSize: 32, color: colors.primary }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Économie Circulaire</Title>
                <Text type="secondary">
                  Flux de matières entre les différents ateliers de la ferme
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: colors.primary }}>
                {scoreCircularite}%
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Score de circularité</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Circuits de circularité */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><ApiOutlined /> Flux de Matières</Space>}
            style={{ borderRadius: 16 }}
          >
            {/* Visualisation des flux */}
            <div style={{ 
              padding: 20, 
              background: '#F9FBE7', 
              borderRadius: 12,
              marginBottom: 20 
            }}>
              <Row gutter={[8, 8]}>
                {/* ÉLEVAGE */}
                <Col xs={8}>
                  <Card size="small" style={{ background: '#FFF3E0', borderColor: colors.elevage }}>
                    <div style={{ textAlign: 'center' }}>
                      <ExperimentOutlined style={{ fontSize: 24, color: colors.elevage }} />
                      <div style={{ fontWeight: 600, marginTop: 8 }}>ÉLEVAGE</div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        Poulailler, Bergerie, Étable
                      </Text>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Text strong style={{ fontSize: 11 }}>Sorties:</Text>
                      <Tag color="orange" style={{ margin: 2 }}>Fumier</Tag>
                      <Tag color="orange" style={{ margin: 2 }}>Lait</Tag>
                      <Tag color="orange" style={{ margin: 2 }}>Œufs</Tag>
                    </div>
                  </Card>
                </Col>

                {/* FLÈCHE → */}
                <Col xs={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRightOutlined style={{ fontSize: 24, color: colors.warning }} />
                </Col>

                {/* VALORISATION */}
                <Col xs={4}>
                  <Card size="small" style={{ background: '#F3E5F5', borderColor: colors.valorisation }}>
                    <div style={{ textAlign: 'center' }}>
                      <SyncOutlined style={{ fontSize: 24, color: colors.valorisation }} />
                      <div style={{ fontWeight: 600, marginTop: 8 }}>VALORISATION</div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        Biogaz, Compost, BSF
                      </Text>
                    </div>
                  </Card>
                </Col>

                {/* FLÈCHE → */}
                <Col xs={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRightOutlined style={{ fontSize: 24, color: colors.success }} />
                </Col>

                {/* CULTURES */}
                <Col xs={4}>
                  <Card size="small" style={{ background: '#E8F5E9', borderColor: colors.cultures }}>
                    <div style={{ textAlign: 'center' }}>
                      <ShopOutlined style={{ fontSize: 24, color: colors.cultures }} />
                      <div style={{ fontWeight: 600, marginTop: 8 }}>CULTURES</div>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        Parcelles, Maraichage
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* FLÈCHE RETOUR */}
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <ArrowRightOutlined rotate={180} style={{ color: colors.primary }} />
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  Retour: Engrais → Alimentation animale
                </Text>
              </div>
            </div>

            {/* Liste des flux */}
            <List
              size="small"
              dataSource={FLUX_CIRCULAIRES}
              renderItem={(flux) => (
                <List.Item>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 12px',
                    background: '#FAFFF5',
                    borderRadius: 8
                  }}>
                    <Space>
                      <span style={{ color: colors.primary }}>→</span>
                      <Text>{flux.entree}</Text>
                      <ArrowRightOutlined style={{ fontSize: 10, color: '#999' }} />
                      <Text strong>{flux.sortie}</Text>
                    </Space>
                    <Tag color={flux.eficacite >= 90 ? 'green' : flux.eficacite >= 80 ? 'blue' : 'orange'}>
                      {flux.eficacite}% efficace
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Économies */}
        <Col xs={24} lg={8}>
          <Card 
            title={<Space><CheckCircleOutlined style={{ color: colors.success }} /> Économies Réalisées</Space>}
            style={{ borderRadius: 16, height: '100%' }}
          >
            <div style={{ 
              padding: 20, 
              background: 'linear-gradient(135deg, #F6FFED, #D9F7BE)',
              borderRadius: 12,
              textAlign: 'center',
              marginBottom: 16
            }}>
              <div style={{ fontSize: 14, color: '#5A7A5A' }}>Économie mensuelle totale</div>
              <div style={{ 
                fontSize: 36, 
                fontWeight: 800, 
                color: colors.success,
                marginTop: 8
              }}>
                {economieTotale.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontSize: 14, color: '#5A7A5A' }}>FCFA/mois</div>
            </div>

            <Text strong style={{ display: 'block', marginBottom: 12 }}>Par circuit:</Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              {CIRCUITS.map(circuit => (
                <div 
                  key={circuit.id}
                  style={{ 
                    padding: 12, 
                    background: circuitActif === circuit.id ? '#F0FFF0' : '#FAFAFA',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: circuitActif === circuit.id ? `2px solid ${colors.primary}` : '1px solid #E8E8E8'
                  }}
                  onClick={() => setCircuitActif(circuit.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12 }}>{circuit.nom}</Text>
                    <Text strong style={{ color: colors.success }}>
                      +{circuit.coutEconomie.toLocaleString('fr-FR')} FCA
                    </Text>
                  </div>
                  <Progress 
                    percent={Math.min(100, circuit.flux.length * 20)} 
                    showInfo={false}
                    strokeColor={colors.primary}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tableau de bord circularité */}
      <Card 
        title={<Space><DatabaseOutlined /> Tableau de Bord Circularité</Space>}
        style={{ borderRadius: 16 }}
      >
        <Row gutter={[16, 16]}>
          {[
            { label: 'Intrants locaux', value: 72, unite: '%', color: colors.primary },
            { label: 'Déchets valorisés', value: 95, unite: '%', color: colors.success },
            { label: 'Recyclage engrais', value: 88, unite: '%', color: colors.warning },
            { label: 'Auto-consommation', value: 65, unite: '%', color: colors.info },
          ].map((item, idx) => (
            <Col xs={12} sm={6} key={idx}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="circle" 
                  percent={item.value} 
                  size={80}
                  strokeColor={item.color}
                  format={(percent) => (
                    <span style={{ fontSize: 18, fontWeight: 700, color: item.color }}>
                      {percent}{item.unite}
                    </span>
                  )}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>{item.label}</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  );
};

export default CircularEconomyFlow;