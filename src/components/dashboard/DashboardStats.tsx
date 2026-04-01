// =============================================
// COMPOSANT STATISTIQUES DASHBOARD (OPTIMISÉ)
// =============================================

'use client';

import React, { memo } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag } from 'antd';
import { 
  FallOutlined, 
  RiseOutlined, 
  ShoppingOutlined, 
  WalletOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons';

interface DashboardStatsProps {
  autonomieAlimentaire: number;
  revenusMois: number;
  economieEngrais: number;
  productionBiogaz: number;
  animauxActifs: number;
  alertesCritiques: number;
}

// Style pré-calculé pour éviter les recréations
const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

// Memoizer le composant principal pour éviter les re-rendus inutiles
export const DashboardStats: React.FC<DashboardStatsProps> = memo(({
  autonomieAlimentaire,
  revenusMois,
  economieEngrais,
  productionBiogaz,
  animauxActifs,
  alertesCritiques,
}) => {
  // Couleur calculée une seule fois
  const autonomyColor = autonomieAlimentaire >= 80 ? '#52C41A' : '#FA8C16';
  const alertColor = alertesCritiques > 0 ? '#FF4D4F' : '#52C41A';
  
  return (
    <Row gutter={[16, 16]}>
      {/* Autonomie Alimentaire */}
      <Col xs={24} sm={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="Autonomie Alimentaire"
            value={autonomieAlimentaire}
            suffix="%"
            prefix={<FallOutlined style={{ color: '#2D7D32' }} />}
            styles={{ content: { 
              color: autonomyColor,
              fontSize: 28,
              fontWeight: 'bold'
            } }}
          />
          <Progress
            percent={autonomieAlimentaire}
            strokeColor={autonomyColor}
            showInfo={false}
            style={{ marginTop: 12 }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Objectif: 80-100%
          </div>
        </Card>
      </Col>

      {/* Revenus du Mois */}
      <Col xs={24} sm={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="Revenus ce Mois"
            value={revenusMois}
            prefix={<WalletOutlined style={{ color: '#2D7D32' }} />}
            suffix="FCFA"
            styles={{ content: { 
              color: '#2D7D32',
              fontSize: 24,
              fontWeight: 'bold'
            } }}
            formatter={(value) => 
              new Intl.NumberFormat('fr-FR').format(value as number)
            }
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#52C41A' }}>
            <RiseOutlined /> +12% vs mois dernier
          </div>
        </Card>
      </Col>

      {/* Économie Engrais */}
      <Col xs={24} sm={12} lg={8}>
        <Card style={cardStyle}>
          <Statistic
            title="Économie Engrais"
            value={economieEngrais}
            suffix="%"
            prefix={<BulbOutlined style={{ color: '#1890FF' }} />}
            styles={{ content: { 
              color: '#1890FF',
              fontSize: 28,
              fontWeight: 'bold'
            } }}
          />
          <Progress
            percent={economieEngrais}
            strokeColor="#1890FF"
            showInfo={false}
            style={{ marginTop: 12 }}
          />
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            Grâce au compost/biogaz
          </div>
        </Card>
      </Col>

      {/* Production Biogaz */}
      <Col xs={24} sm={12} lg={6}>
        <Card style={cardStyle}>
          <Statistic
            title="Biogaz Aujourd'hui"
            value={productionBiogaz}
            suffix="m³"
            prefix={<ThunderboltOutlined style={{ color: '#FA8C16' }} />}
            styles={{ content: { fontSize: 24, fontWeight: 'bold' } }}
          />
          <Tag color="green" style={{ marginTop: 8 }}>
            ✓ Suffisant pour cuisine
          </Tag>
        </Card>
      </Col>

      {/* Animaux Actifs */}
      <Col xs={24} sm={12} lg={6}>
        <Card style={cardStyle}>
          <Statistic
            title="Animaux Actifs"
            value={animauxActifs}
            prefix={<ShoppingOutlined style={{ color: '#722ED1' }} />}
            styles={{ content: { fontSize: 24, fontWeight: 'bold' } }}
          />
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <Tag color="blue">Poules: 200</Tag>
            <Tag color="orange">Caprins: 5</Tag>
          </div>
        </Card>
      </Col>

      {/* Alertes Critiques */}
      <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{
            ...cardStyle,
            border: alertesCritiques > 0 ? '2px solid #FF4D4F' : undefined,
          }}
        >
          <Statistic
            title="Alertes"
            value={alertesCritiques}
            styles={{ content: { 
              color: alertColor,
              fontSize: 24,
              fontWeight: 'bold'
            } }}
          />
          {alertesCritiques > 0 ? (
            <Tag color="red" style={{ marginTop: 8 }}>
              Action requise
            </Tag>
          ) : (
            <Tag color="success" style={{ marginTop: 8 }}>
              Tout va bien ✓
            </Tag>
          )}
        </Card>
      </Col>
    </Row>
  );
});