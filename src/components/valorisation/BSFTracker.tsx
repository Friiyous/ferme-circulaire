'use client';

import { 
  Card, 
  Timeline, 
  Tag, 
  Progress, 
  Button, 
  Modal, 
  Form, 
  InputNumber, 
  DatePicker,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Alert
} from 'antd';
import { 
  BugOutlined, 
  PlusOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

interface BSFBac {
  id: string;
  dateDemarrage: Date;
  stade: 'oeufs' | 'larves_jeunes' | 'larves_matures' | 'nymphe' | 'adulte';
  quantiteRecoltee?: number; // kg
  statut: 'actif' | 'termine' | 'abandonne';
}

const STADES_BSf = [
  { nom: 'Œufs', duree: '0-3 jours', couleur: 'default' },
  { nom: 'Larves jeunes', duree: '3-7 jours', couleur: 'blue' },
  { nom: 'Larves matures', duree: '7-14 jours', couleur: 'green' },
  { nom: 'Nymphes', duree: '14-21 jours', couleur: 'purple' },
  { nom: 'Adultes', duree: '21+ jours', couleur: 'orange' },
];

interface BSFTrackerProps {
  bacs: BSFBac[];
  onNouveauBac?: (data: Partial<BSFBac>) => void;
  onRecolte?: (bacId: string, quantite: number) => void;
}

export const BSFTracker: React.FC<BSFTrackerProps> = ({
  bacs,
  onNouveauBac,
  onRecolte,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [recolteModal, setRecolteModal] = useState<{ visible: boolean; bacId?: string }>({
    visible: false,
  });
  const [form] = Form.useForm();
  const [recolteForm] = Form.useForm();

  const calculerJoursEcoulés = (dateDemarrage: Date) => {
    const today = new Date();
    const start = new Date(dateDemarrage);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const determinerStade = (jours: number): BSFBac['stade'] => {
    if (jours <= 3) return 'oeufs';
    if (jours <= 7) return 'larves_jeunes';
    if (jours <= 14) return 'larves_matures';
    if (jours <= 21) return 'nymphe';
    return 'adulte';
  };

  const getProgressPourcentage = (stade: BSFBac['stade']) => {
    const stages = ['oeufs', 'larves_jeunes', 'larves_matures', 'nymphe', 'adulte'];
    const index = stages.indexOf(stade);
    return ((index + 1) / stages.length) * 100;
  };

  const handleNouveauBac = (values: any) => {
    onNouveauBac?.({
      dateDemarrage: values.dateDemarrage.toDate(),
      stade: 'oeufs',
      statut: 'actif',
    });
    setModalVisible(false);
    form.resetFields();
  };

  const handleRecolte = (values: any) => {
    if (recolteModal.bacId) {
      onRecolte?.(recolteModal.bacId, values.quantite);
      setRecolteModal({ visible: false });
      recolteForm.resetFields();
    }
  };

  // Stats globales
  const stats = {
    bacsActifs: bacs.filter(b => b.statut === 'actif').length,
    recolteCeMoisi: bacs.reduce((sum, b) => sum + (b.quantiteRecoltee || 0), 0),
    proteineProduite: bacs.reduce((sum, b) => sum + (b.quantiteRecoltee || 0) * 0.6, 0), // 60% protéines
    dechetsValorises: bacs.reduce((sum, b) => sum + (b.quantiteRecoltee || 0) * 5, 0), // 1kg larves = 5kg déchets
  };

  return (
    <>
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Bacs Actifs"
              value={stats.bacsActifs}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#1890FF' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Récolte ce Mois"
              value={stats.recolteCeMoisi}
              suffix="kg"
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Protéines Produites"
              value={stats.proteineProduite}
              suffix="kg"
              valueStyle={{ color: '#FA8C16' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Déchets Valorises"
              value={stats.dechetsValorises}
              suffix="kg"
              valueStyle={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bouton nouveau bac */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 24 }}
      >
        Nouveau Bac BSF
      </Button>

      {/* Liste des bacs */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {bacs.map((bac) => {
          const joursEcoulés = calculerJoursEcoulés(bac.dateDemarrage);
          const stadeActuel = bac.statut === 'actif' ? determinerStade(joursEcoulés) : bac.stade;
          const progress = getProgressPourcentage(stadeActuel);

          return (
            <Card
              key={bac.id}
              title={`Bac ${bac.id}`}
              extra={
                <Tag color={bac.statut === 'actif' ? 'green' : 'default'}>
                  {bac.statut}
                </Tag>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Progression */}
                <div>
                  <Text strong>Progression du cycle</Text>
                  <Progress
                    percent={progress}
                    strokeColor={progress >= 100 ? '#52C41A' : '#1890FF'}
                    format={() => `Jour ${joursEcoulés}/21`}
                  />
                </div>

                {/* Stade actuel */}
                <Space>
                  <Text>Stade actuel:</Text>
                  <Tag color={STADES_BSf.find(s => s.nom.toLowerCase().includes(stadeActuel))?.couleur || 'default'}>
                    {STADES_BSf.find(s => s.nom.toLowerCase().includes(stadeActuel))?.nom || stadeActuel}
                  </Tag>
                </Space>

                {/* Timeline */}
                <Timeline
                  items={STADES_BSf.map((stade, index) => {
                    const currentIndexNum = ['oeufs', 'larves_jeunes', 'larves_matures', 'nymphe', 'adulte'].indexOf(stadeActuel);
                    
                    return {
                      children: `${stade.nom} (${stade.duree})`,
                      color: index <= currentIndexNum ? 'green' : 'gray',
                      dot: index <= currentIndexNum ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                    };
                  })}
                />

                {/* Actions */}
                {bac.statut === 'actif' && stadeActuel === 'larves_matures' && (
                  <Button
                    type="primary"
                    onClick={() => setRecolteModal({ visible: true, bacId: bac.id })}
                    icon={<BugOutlined />}
                  >
                    Récolter les Larves
                  </Button>
                )}

                {bac.quantiteRecoltee && (
                  <Alert
                    message={`Récolté: ${bac.quantiteRecoltee} kg de larves`}
                    type="success"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          );
        })}
      </Space>

      {/* Modal Nouveau Bac */}
      <Modal
        title="Nouveau Bac d'Élevage BSF"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleNouveauBac} layout="vertical">
          <Form.Item
            name="dateDemarrage"
            label="Date de démarrage"
            rules={[{ required: true }]}
            initialValue={dayjs()}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Démarrer l'Élevage
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Récolte */}
      <Modal
        title="Récolte des Larves"
        open={recolteModal.visible}
        onCancel={() => setRecolteModal({ visible: false })}
        footer={null}
      >
        <Form form={recolteForm} onFinish={handleRecolte} layout="vertical">
          <Form.Item
            name="quantite"
            label="Quantité récoltée (kg)"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber 
              min={0} 
              step={0.1} 
              style={{ width: '100%' }}
              addonAfter="kg"
            />
          </Form.Item>

          <Alert
            message="Informations"
            description={
              <Text>
                • 1 kg de larves = 600g de protéines pures
                <br />
                • Équivalent à ~3 kg de farine de poisson
                <br />
                • A valorisé ~5 kg de déchets organiques
              </Text>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Confirmer la Récolte
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
