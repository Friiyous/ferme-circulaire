'use client';

import { 
  Card, 
  Progress, 
  Statistic, 
  Tag, 
  Alert, 
  Button, 
  Modal, 
  Form, 
  InputNumber, 
  Space, 
  Typography, 
  Row, 
  Col,
  Table
} from 'antd';
import { 
  ThunderboltOutlined, 
  InboxOutlined, 
  FireOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

interface BiogasData {
  id: string;
  volume: number; // m³
  niveauActuel: number; // %
  productionGazJour: number; // m³/jour
  bioSlurryProduite: number; // kg/jour
  temperature: number; // °C
  pH: number;
  dernierNettoyage: Date;
  prochainNettoyage: Date;
  statut: 'optimal' | 'attention' | 'critique';
  historique: BiogasHistory[];
}

interface BiogasHistory {
  date: Date;
  production: number; // m³
  slurry: number; // kg
  intrants: number; // kg
}

interface BiogasMonitorProps {
  digesteur: BiogasData;
  onAjoutIntrants?: (quantite: number) => void;
  onNettoyage?: () => void;
  onMaintenance?: () => void;
}

export const BiogasMonitor: React.FC<BiogasMonitorProps> = ({
  digesteur,
  onAjoutIntrants,
  onNettoyage,
  onMaintenance,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Calcul autonomie énergétique
  const autonomieCuisine = Math.min(100, (digesteur.productionGazJour / 2) * 100); // 2m³ = 100% cuisine familiale
  const autonomieElectricite = Math.min(100, (digesteur.productionGazJour / 5) * 100); // 5m³ = 100% électricité

  // Alertes
  const alertes = [];
  if (digesteur.niveauActuel < 30) {
    alertes.push({ type: 'error', message: 'Niveau critique - Ajouter intrants urgents' });
  }
  if (digesteur.temperature < 30 || digesteur.temperature > 40) {
    alertes.push({ type: 'warning', message: 'Température hors optimum (35-38°C idéal)' });
  }
  if (digesteur.pH < 6.5 || digesteur.pH > 8) {
    alertes.push({ type: 'warning', message: 'pH hors optimum (7-7.5 idéal)' });
  }
  const joursAvantNettoyage = Math.ceil(
    (new Date(digesteur.prochainNettoyage).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (joursAvantNettoyage <= 7) {
    alertes.push({ type: 'warning', message: `Nettoyage prévu dans ${joursAvantNettoyage} jours` });
  }

  const getStatusColor = (statut: string) => {
    const colors = { optimal: 'success', attention: 'warning', critique: 'error' };
    return colors[statut as keyof typeof colors] || 'default';
  };

  const handleAjoutIntrants = (values: any) => {
    onAjoutIntrants?.(values.quantite);
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: Date) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Production (m³)', dataIndex: 'production', key: 'production' },
    { title: 'Bio-slurry (kg)', dataIndex: 'slurry', key: 'slurry' },
    { title: 'Intrants (kg)', dataIndex: 'intrants', key: 'intrants' },
  ];

  return (
    <>
      {/* Alertes */}
      {alertes.map((alerte, index) => (
        <Alert
          key={index}
          message={alerte.message}
          type={alerte.type as 'success' | 'info' | 'warning' | 'error'}
          showIcon
          style={{ marginBottom: 16 }}
          icon={
            alerte.type === 'error' ? <WarningOutlined /> :
            alerte.type === 'warning' ? <WarningOutlined /> :
            <CheckCircleOutlined />
          }
        />
      ))}

      {/* Stats principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Niveau Digesteur"
              value={digesteur.niveauActuel}
              suffix="%"
              prefix={<InboxOutlined />}
              valueStyle={{ 
                color: digesteur.niveauActuel >= 50 ? '#52C41A' : digesteur.niveauActuel >= 30 ? '#FA8C16' : '#FF4D4F' 
              }}
            />
            <Progress
              percent={digesteur.niveauActuel}
              strokeColor={
                digesteur.niveauActuel >= 50 ? '#52C41A' : digesteur.niveauActuel >= 30 ? '#FA8C16' : '#FF4D4F'
              }
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Production Gaz Jour"
              value={digesteur.productionGazJour}
              suffix="m³"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#FA8C16' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Volume: {digesteur.volume} m³
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Bio-slurry Jour"
              value={digesteur.bioSlurryProduite}
              suffix="kg"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890FF' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pour fertilisation cultures
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Statut"
              value={digesteur.statut === 'optimal' ? 'Optimal' : digesteur.statut === 'attention' ? 'Attention' : 'Critique'}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ 
                color: digesteur.statut === 'optimal' ? '#52C41A' : digesteur.statut === 'attention' ? '#FA8C16' : '#FF4D4F' 
              }}
            />
            <Tag color={getStatusColor(digesteur.statut)} style={{ marginTop: 8 }}>
              {digesteur.statut.toUpperCase()}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* Paramètres techniques */}
      <Card title="Paramètres Techniques" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Température"
              value={digesteur.temperature}
              suffix="°C"
              valueStyle={{ 
                fontSize: 20,
                color: digesteur.temperature >= 35 && digesteur.temperature <= 38 ? '#52C41A' : '#FA8C16' 
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Optimum: 35-38°C</Text>
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="pH"
              value={digesteur.pH}
              valueStyle={{ 
                fontSize: 20,
                color: digesteur.pH >= 7 && digesteur.pH <= 7.5 ? '#52C41A' : '#FA8C16' 
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Optimum: 7-7.5</Text>
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="Dernier Nettoyage"
              value={dayjs(digesteur.dernierNettoyage).format('DD/MM')}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <Statistic
              title="Prochain Nettoyage"
              value={dayjs(digesteur.prochainNettoyage).format('DD/MM')}
              valueStyle={{ 
                fontSize: 20,
                color: joursAvantNettoyage <= 7 ? '#FA8C16' : '#52C41A' 
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Autonomie énergétique */}
      <Card title="Autonomie Énergétique" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Space>
              <FireOutlined style={{ color: '#FA8C16' }} />
              <Text strong>Cuisine familiale</Text>
            </Space>
            <Progress
              percent={autonomieCuisine}
              strokeColor={autonomieCuisine >= 80 ? '#52C41A' : '#FA8C16'}
              format={() => `${Math.round(autonomieCuisine)}% (${digesteur.productionGazJour.toFixed(1)}/2 m³)`}
            />
          </div>

          <div>
            <Space>
              <ThunderboltOutlined style={{ color: '#1890FF' }} />
              <Text strong>Électricité (générateur)</Text>
            </Space>
            <Progress
              percent={autonomieElectricite}
              strokeColor={autonomieElectricite >= 80 ? '#52C41A' : '#FA8C16'}
              format={() => `${Math.round(autonomieElectricite)}% (${digesteur.productionGazJour.toFixed(1)}/5 m³)`}
            />
          </div>

          <Alert
            message="Économie réalisée"
            description={
              <Text>
                Gaz butane économisé: ~{Math.round(digesteur.productionGazJour * 0.5)} kg/jour
                <br />
                Économie mensuelle: ~{Math.round(digesteur.productionGazJour * 0.5 * 30 * 500)} FCFA
              </Text>
            }
            type="success"
            showIcon
          />
        </Space>
      </Card>

      {/* Actions */}
      <Card title="Actions" style={{ marginBottom: 24 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Ajouter Intrants
          </Button>
          <Button
            icon={<InboxOutlined />}
            onClick={onNettoyage}
            disabled={joursAvantNettoyage > 7}
          >
            Nettoyage
          </Button>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={onMaintenance}
          >
            Maintenance
          </Button>
        </Space>
      </Card>

      {/* Historique production */}
      <Card title="Historique Production (7 derniers jours)">
        <Table 
          columns={columns} 
          dataSource={digesteur.historique?.slice(-7) || []} 
          rowKey="date"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Modal Ajout Intrants */}
      <Modal
        title="Ajouter Intrants au Digesteur"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAjoutIntrants} layout="vertical">
          <Alert
            message="Recommandations"
            description={
              <Text>
                • Ratio idéal: 1 kg fumier + 1 L eau
                <br />
                • Quantité quotidienne: 20-30 kg pour 200 poules + 5 bovins
                <br />
                • Mélanger avec déchets cuisine pour booster méthane
              </Text>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="quantite"
            label="Quantité d'intrants (kg)"
            rules={[{ required: true, type: 'number', min: 1 }]}
          >
            <InputNumber 
              min={1} 
              step={5} 
              style={{ width: '100%' }}
              addonAfter="kg"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Confirmer l'Ajout
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
