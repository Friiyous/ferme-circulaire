'use client';

import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Typography,
  Progress,
  Modal,
  Form,
  InputNumber,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  WarningOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import type { StockIntrant } from '@/types';
import dayjs from 'dayjs';

const { Text } = Typography;

interface StockManagerProps {
  stocks: StockIntrant[];
  onAjouterStock?: (id: string, quantite: number, cout: number) => void;
  onNouveauProduit?: (data: Partial<StockIntrant>) => void;
}

export const StockManager: React.FC<StockManagerProps> = ({
  stocks,
  onAjouterStock,
  onNouveauProduit,
}) => {
  const [searchText, setSearchText] = useState('');
  const [mouvementModal, setMouvementModal] = useState<{
    visible: boolean;
    stock?: StockIntrant;
    type?: 'entree' | 'sortie';
  }>({ visible: false });
  const [form] = Form.useForm();

  // Filtrage
  const filteredStocks = stocks.filter(s => 
    s.nom.toLowerCase().includes(searchText.toLowerCase()) ||
    s.categorie.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const stats = {
    totalProduits: stocks.length,
    valeurTotale: stocks.reduce((sum, s) => sum + (s.quantite * s.prix), 0),
    alertes: stocks.filter(s => s.quantite <= s.seuilAlerte).length,
  };

  const getCategorieColor = (categorie: string) => {
    const colors: Record<string, string> = {
      'Semences': 'green',
      'Engrais': 'blue',
      'Phytosanitaire': 'red',
      'Aliment_Bétail': 'orange',
      'Matériel': 'default',
    };
    return colors[categorie] || 'default';
  };

  const handleMouvement = (values: any) => {
    if (mouvementModal.stock) {
      // Dans une vraie app, on gèrerait aussi les sorties
      if (mouvementModal.type === 'entree') {
        onAjouterStock?.(mouvementModal.stock.id, values.quantite, values.cout_unitaire);
      }
      setMouvementModal({ visible: false });
      form.resetFields();
    }
  };

  const columns = [
    {
      title: 'Produit',
      dataIndex: 'nom',
      key: 'nom',
      render: (text: string, record: StockIntrant) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Tag color={getCategorieColor(record.categorie)}>
            {record.categorie.replace('_', ' ')}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Niveau Stock',
      key: 'niveau',
      render: (_: any, record: StockIntrant) => {
        const percent = Math.min(100, (record.quantite / (record.seuilAlerte * 3)) * 100);
        const isCritical = record.quantite <= record.seuilAlerte;
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%', minWidth: 150 }}>
            <Space>
              <Text strong style={{ color: isCritical ? '#FF4D4F' : 'inherit' }}>
                {record.quantite} {record.unite}
              </Text>
              {isCritical && <WarningOutlined style={{ color: '#FF4D4F' }} />}
            </Space>
            <Progress 
              percent={percent} 
              showInfo={false}
              strokeColor={isCritical ? '#FF4D4F' : percent < 50 ? '#FA8C16' : '#52C41A'}
              size="small"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Seuil alerte: {record.seuilAlerte}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Valeur',
      key: 'valeur',
      render: (_: any, record: StockIntrant) => (
        <Space direction="vertical" size="small">
          <Text>{new Intl.NumberFormat('fr-FR').format(record.quantite * record.prix)} FCFA</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.prix} FCFA/{record.unite}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Dernier mouvement',
      dataIndex: 'dateDernierMouvement',
      key: 'date',
      render: (date: Date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StockIntrant) => (
        <Space>
          <Button 
            size="small"
            type="primary"
            ghost
            onClick={() => setMouvementModal({ visible: true, stock: record, type: 'entree' })}
          >
            + Entrée
          </Button>
          <Button 
            size="small"
            danger
            ghost
            onClick={() => setMouvementModal({ visible: true, stock: record, type: 'sortie' })}
          >
            - Sortie
          </Button>
          <Button size="small" icon={<HistoryOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Gestion des Stocks" 
      extra={
        <Space>
          <Input 
            placeholder="Rechercher un produit..." 
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Nouveau Produit
          </Button>
        </Space>
      }
    >
      {/* KPIs Stocks */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic title="Total Produits" value={stats.totalProduits} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Statistic 
              title="Valeur Totale" 
              value={stats.valeurTotale} 
              suffix="FCFA"
              formatter={(val) => new Intl.NumberFormat('fr-FR').format(val as number)}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: stats.alertes > 0 ? '#fff2f0' : '#f6ffed', borderColor: stats.alertes > 0 ? '#ffccc7' : '#b7eb8f' }}>
            <Statistic 
              title="Alertes Rupture" 
              value={stats.alertes} 
              valueStyle={{ color: stats.alertes > 0 ? '#FF4D4F' : '#52C41A' }}
            />
          </Card>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={filteredStocks} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Mouvement */}
      <Modal
        title={`${mouvementModal.type === 'entree' ? 'Entrée' : 'Sortie'} de stock - ${mouvementModal.stock?.nom}`}
        open={mouvementModal.visible}
        onCancel={() => setMouvementModal({ visible: false })}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleMouvement}>
          <Form.Item
            name="quantite"
            label={`Quantité (${mouvementModal.stock?.unite})`}
            rules={[{ required: true, type: 'number', min: 0.1 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          {mouvementModal.type === 'entree' && (
            <Form.Item
              name="cout_unitaire"
              label={`Coût unitaire (FCFA/${mouvementModal.stock?.unite})`}
              rules={[{ required: true, type: 'number', min: 0 }]}
              initialValue={mouvementModal.stock?.prix}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          )}

          {mouvementModal.type === 'sortie' && (
            <Form.Item
              name="destination"
              label="Destination / Motif"
              rules={[{ required: true }]}
            >
              <Input placeholder="Ex: Semis parcelle A, Alimentation poulets..." />
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              danger={mouvementModal.type === 'sortie'}
            >
              Confirmer {mouvementModal.type === 'entree' ? "l'entrée" : "la sortie"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};
