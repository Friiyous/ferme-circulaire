'use client';
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Statistic,
  Typography, Modal, Form, Input, Select, InputNumber,
  Popconfirm, message, Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { colors } from '@/lib/theme';
import type { Parcelle, StatutParcelle } from '@/types';
import { parcellesService, type Parcelle as DbParcelle } from '@/lib/crudService';

const { Text } = Typography;
const { Option } = Select;

const LOCAL_KEY = 'ferme_cultures_data';

const statutConfig: Record<string, { color: string; label: string }> = {
  en_culture: { color: 'green', label: '🌱 En culture' },
  fallow: { color: 'gold', label: '🏜️ Jachère' },
  prepare: { color: 'blue', label: '⛏️ Préparation' },
};

const loadLocal = (): Parcelle[] => {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveLocal = (data: Parcelle[]) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
};

export default function CulturesPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [data, setData] = useState<Parcelle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadParcelles(); }, []);

  const loadParcelles = async () => {
    setLoading(true);
    let local = loadLocal();
    
    // PLUS de rechargement automatique depuis mockParcelles
    // Si vide, on laisse vide pour que l'utilisateur ajoute ses donnees
    
    setData(local);
    
    // Charger depuis Supabase si configure
    try {
      const { data: supaData } = await parcellesService.getAll();
      if (supaData && supaData.length > 0) {
        const formatted = supaData.map((p: DbParcelle) => ({
          id: p.id || String(Date.now()),
          nom: p.nom || 'Parcelle',
          surface: p.surface || 0,
          culture_actuelle: p.culture_actuelle || '',
          statut: (p.statut || 'en_culture') as any,
          localisation: p.nom,
        })) as unknown as Parcelle[];
        setData(formatted);
        saveLocal(formatted);
      }
    } catch {}
    
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    const newData = data.filter(p => p.id !== id);
    setData(newData);
    saveLocal(newData);
    message.success('Parcelle supprimée');
    parcellesService.delete(id).catch(() => {});
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newParcelle: Parcelle = {
        id: `local-${Date.now()}`,
        nom: values.nom,
        surface: values.surface || 0,
        culture_actuelle: values.culture || '',
        statut: (values.statut || 'en_culture') as any,
        localisation: values.nom,
      } as any;
      
      const newData = [newParcelle, ...data];
      setData(newData);
      saveLocal(newData);
      
      parcellesService.create({
        nom: values.nom,
        surface: values.surface || 0,
        culture_actuelle: values.culture || '',
        statut: values.statut || 'en_culture',
      } as any).catch(() => {});
      
      message.success('Parcelle ajoutée !');
      setAddModalOpen(false);
      form.resetFields();
    } catch { message.error('Erreur lors de l\'ajout'); }
  };

  const totalSurface = data.reduce((s, p) => s + (p.surface || 0), 0);
  const enCulture = data.filter(p => p.statut === 'en_culture').length;

  const columns: ColumnsType<Parcelle> = [
    { title: 'Nom', dataIndex: 'nom', render: v => <Tag style={{ fontWeight: 600 }}>{v}</Tag> },
    { title: 'Surface (m²)', dataIndex: 'surface', render: v => <Tag color="blue">{(v || 0).toLocaleString('fr-FR')}</Tag> },
    { title: 'Culture', dataIndex: 'culture_actuelle', render: v => v ? <Tag color="green">🌱 {v}</Tag> : <Tag>—</Tag> },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      render: (v: StatutParcelle) => {
        const config = statutConfig[v] || { color: 'default', label: v };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Actions',
      render: (_, r) => (
        <Popconfirm title="Supprimer cette parcelle ?" onConfirm={() => handleDelete(r.id!)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Chargement des parcelles..." />
      </div>
    );
  }

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #C8E6C9, #A5D6A7)' }}>🌱</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Cultures</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Parcelles — Sauvegardées localement</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadParcelles}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>
          Nouvelle parcelle
        </Button>
      </div>

      {/* Stats dynamiques - basées sur les donnees reales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📊</div>
            <Statistic title="Total Parcelles" value={data.length} valueStyle={{ fontWeight: 700, color: colors.primary }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistrees</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📐</div>
            <Statistic title="Surface Totale" value={totalSurface} valueStyle={{ fontWeight: 700, color: colors.warning }} suffix="m²" />
            <Text type="secondary" style={{ fontSize: 11 }}>Superficie totale</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🌱</div>
            <Statistic title="En Culture" value={enCulture} valueStyle={{ fontWeight: 700, color: colors.success }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Parcelles actives</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🏜️</div>
            <Statistic title="Inactives" value={data.length - enCulture} valueStyle={{ fontWeight: 700 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>Jachere/Preparation</Text>
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 8 }} />
      </Card>

      {/* Message si vide */}
      {data.length === 0 && (
        <Card style={{ marginTop: 16, textAlign: 'center', borderRadius: 12 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Aucune parcelle enregistree. Cliquez sur "Nouvelle parcelle" pour commencer.
          </Text>
        </Card>
      )}

      <Modal title="🌱 Nouvelle parcelle" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields(); }} onOk={handleAdd} okText="Creer" cancelText="Annuler">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                <Input placeholder="Ex: Parcelle Nord" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="surface" label="Surface (m²)">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="culture" label="Culture actuelle">
                <Input placeholder="Ex: Mais" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="statut" label="Statut">
                <Select defaultValue="en_culture">
                  <Option value="en_culture">🌱 En culture</Option>
                  <Option value="fallow">🏜️ Jachere</Option>
                  <Option value="prepare">⛏️ Preparation</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}