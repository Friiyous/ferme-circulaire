'use client';
import { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Typography, Row, Col, Statistic, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { StockService, type Stock } from '@/lib/stockService';

const { Title, Text } = Typography;
const { Option } = Select;

const categories = [
  { key: 'Aliment', label: '🌾 Aliment', color: 'gold' },
  { key: 'Veterinaire', label: '💉 Vétérinaire', color: 'red' },
  { key: 'Intrant', label: '🌱 Intrant', color: 'green' },
  { key: 'Complement', label: '🧂 Complément', color: 'blue' },
];

export default function InventairePage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    try {
      const data = await StockService.getAll();
      setStocks(data);
    } catch {
      message.error('Erreur chargement');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await StockService.delete(id);
    if (success) {
      setStocks(s => s.filter(st => st.id !== id));
      message.success('Stock supprimé');
    } else {
      message.error('Erreur suppression');
    }
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newStock = await StockService.create({
        nom: values.nom,
        categorie: values.categorie,
        quantite: values.quantite || 0,
        unite: values.unite || '',
        prix_unitaire: values.prix_unitaire,
      });
      
      if (newStock) {
        setStocks(s => [newStock, ...s]);
        message.success('Stock ajouté !');
        setAddModalVisible(false);
        form.resetFields();
      }
    } catch {
      message.error('Erreur ajout');
    }
  };

  const columns = [
    { 
      title: 'Nom', 
      dataIndex: 'nom', 
      render: (v: string) => <Text strong>{v}</Text>
    },
    { 
      title: 'Catégorie', 
      dataIndex: 'categorie',
      render: (v: string) => {
        const cat = categories.find(c => c.key === v);
        return <Tag color={cat?.color || 'default'}>{cat?.label || v}</Tag>;
      }
    },
    { 
      title: 'Quantité', 
      dataIndex: 'quantite',
      render: (v: number, r: Stock) => (
        <Text strong style={{ color: v < 20 ? '#FF4D4F' : '#52C41A' }}>
          {v} {r.unite}
        </Text>
      )
    },
    { title: 'Unité', dataIndex: 'unite' },
    { 
      title: 'Prix unitaire', 
      dataIndex: 'prix_unitaire',
      render: (v?: number) => v ? `${v.toLocaleString('fr-FR')} FCFA` : '-'
    },
    {
      title: 'Actions',
      render: (_: any, r: Stock) => (
        <Popconfirm title="Supprimer ce stock ?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Chargement des stocks..." />
      </div>
    );
  }

  const totalValue = stocks.reduce((s, st) => s + (st.quantite * (st.prix_unitaire || 0)), 0);
  const lowStock = stocks.filter(s => s.quantite < 20).length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' }}>🔧</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Inventaire</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Stocks — Données sauvegardées dans Supabase</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadStocks}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)} style={{ marginLeft: 8 }}>
          Nouveau stock
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Articles" value={stocks.length} prefix={<span style={{ fontSize: 24 }}>📦</span>} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Stock bas ⚠️" value={lowStock} valueStyle={{ color: '#FF4D4F' }} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Valeur totale" value={totalValue} formatter={(v) => `${Number(v).toLocaleString('fr-FR')} FCFA`} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Catégories" value={categories.length} />
          </Card>
        </Col>
      </Row>

      {/* Tableau */}
      <Card title="📋 Liste des stocks" style={{ borderRadius: 12 }}>
        <Table 
          columns={columns} 
          dataSource={stocks} 
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal ajout */}
      <Modal
        title="➕ Ajouter un stock"
        open={addModalVisible}
        onCancel={() => { setAddModalVisible(false); form.resetFields(); }}
        onOk={handleAdd}
        okText="Ajouter" cancelText="Annuler"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Ex: Provenda Poules" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categorie" label="Catégorie" rules={[{ required: true }]}>
                <Select>
                  {categories.map(c => <Option key={c.key} value={c.key}>{c.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unite" label="Unité">
                <Select>
                  <Option value="kg">kg</Option>
                  <Option value="L">Litre</Option>
                  <Option value="doses">Doses</Option>
                  <Option value="sacs">Sacs</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantite" label="Quantité">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prix_unitaire" label="Prix unitaire (FCFA)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}