'use client';
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tag, Button, Space, Modal, Form, Input, Select,
  DatePicker, InputNumber, Tabs, Statistic, Row, Col,
  Typography, Tooltip, Popconfirm, message, Spin, Alert,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProductionOeufs, mockAnimaux, mockTransactions } from '@/lib/mockData';
import { especeConfig, colors } from '@/lib/theme';
import type { Animal, StatutAnimal } from '@/types';
import { AnimalCard } from '@/components/elevage/AnimalCard';
import { animalsService, type Animal as DbAnimal } from '@/lib/crudService';
import { getResumeCheptel, getAlertesVaccination, calculerMargeAnimal, getAnimauxAPrevoirVente, simulerVente, getMargeAnnuelle } from '@/lib/elevageService';

const productionData = getProductionOeufs();
const { Text } = Typography;
const { Option } = Select;

const LOCAL_KEY = 'ferme_elevage_data';

const statutConfig: Record<StatutAnimal, { color: string; label: string }> = {
  actif: { color: 'green', label: 'Actif' },
  malade: { color: 'orange', label: 'Malade' },
  vendu: { color: 'blue', label: 'Vendu' },
  mort: { color: 'red', label: 'Mort' },
};

const vaccins = [
  { id: 'v1', animal: 'PL-001', type: 'Newcastle', date: '2026-03-01', prochaine: '2026-03-30', vet: 'Dr Kouamé' },
  { id: 'v2', animal: 'PL-002', type: 'Gumboro', date: '2026-02-20', prochaine: '2026-04-15', vet: 'Dr Kouamé' },
];

// helpers localStorage
const loadLocal = (): Animal[] => {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveLocal = (data: Animal[]) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) { console.error(e); }
};

export default function ElevagePage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailAnimal, setDetailAnimal] = useState<Animal | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceReset: boolean = false) => {
    setLoading(true);
    
    // 1. TOUJOURS charger localStorage d'abord (source de vérité)
    let local = loadLocal();
    
    // 2. Si localStorage vide ET pas de forçage, creer seulement si premier lancement
    // Pour eviter que les donnees supprimées reviennent, on ne recharge plus automatiquement depuis mock
    // L'utilisateur doit explicitly reinitialiser via le bouton "Reinitialiser" si besoin
    if (local.length === 0 && forceReset) {
      local = mockAnimaux.slice(0, 3).map((a, i) => ({
        ...a,
        id: `seed-${Date.now()}-${i}`,
        code: a.code || `AN-${String(i + 1).padStart(4, '0')}`,
      }));
      saveLocal(local);
    }
    
    setData(local);
    
    // 3. Background sync avec Supabase
    try {
      const { data: supaData } = await animalsService.getAll();
      if (supaData && supaData.length > 0) {
        const formatted = supaData.map((a: DbAnimal) => ({
          id: a.id || String(Date.now()),
          code: a.code || 'AN-0000',
          espece: a.espece || 'poule',
          race: a.race || '',
          sexe: a.sexe || 'F',
          poids: a.poids || 1,
          statut: (a.statut || 'actif') as StatutAnimal,
          localisation: a.localisation || '',
          dateNaissance: a.date_naissance || '',
          dateEntree: a.date_entree || '',
        } as Animal));
        setData(formatted);
        saveLocal(formatted);
        setIsOnline(true);
      }
    } catch (e) {
      // Pas de Supabase
    }
    
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    // Supprimer immédiatement et localement
    const newData = data.filter(a => a.id !== id);
    setData(newData);
    saveLocal(newData);
    message.success('Animal supprimé');
    
    // Background: supprimer de Supabase aussi
    animalsService.delete(id).catch(() => {});
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      
      const newAnimal: Animal = {
        id: `local-${Date.now()}`,
        code: `AN-${Date.now().toString().slice(-4)}`,
        espece: values.espece,
        race: values.race || '',
        sexe: values.sexe || 'F',
        poids: values.poids || 1,
        statut: 'actif',
        localisation: values.localisation || '',
        dateNaissance: values.dateNaissance?.format('YYYY-MM-DD') || '',
        dateEntree: new Date().toISOString().slice(0, 10),
      };
      
      // Sauvegarder localement
      const newData = [newAnimal, ...data];
      setData(newData);
      saveLocal(newData);
      
      // Background: sync Supabase
      animalsService.create({
        code: newAnimal.code,
        espece: newAnimal.espece,
        race: newAnimal.race,
        sexe: newAnimal.sexe,
        poids: newAnimal.poids,
        statut: newAnimal.statut,
        localisation: newAnimal.localisation,
        date_naissance: newAnimal.dateNaissance,
        date_entree: newAnimal.dateEntree,
      }).catch(() => {});
      
      message.success('Animal ajouté !');
      setAddModalOpen(false);
      form.resetFields();
    } catch { message.error('Erreur lors de l\'ajout'); }
  };

  const actifs = data.filter(a => a.statut === 'actif').length;
  const malades = data.filter(a => a.statut === 'malade').length;

  const columns: ColumnsType<Animal> = [
    { title: 'Code', dataIndex: 'code', width: 90, render: v => <Tag style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag> },
    {
      title: 'Espèce', dataIndex: 'espece', width: 110,
      render: (v: string) => (
        <Space>
          <span>{especeConfig[v]?.emoji}</span>
          <span>{especeConfig[v]?.label}</span>
        </Space>
      ),
    },
    { title: 'Race', dataIndex: 'race' },
    { title: 'Sexe', dataIndex: 'sexe', width: 70, render: v => <Tag>{v === 'M' ? '♂ Mâle' : '♀ Femelle'}</Tag> },
    { title: 'Poids', dataIndex: 'poids', width: 80, render: v => <strong>{v} kg</strong> },
    { title: 'Localisation', dataIndex: 'localisation', render: v => <Tag>{v}</Tag> },
    {
      title: 'Statut', dataIndex: 'statut', width: 110,
      render: (v: StatutAnimal) => <Tag color={statutConfig[v]?.color || 'default'}>{statutConfig[v]?.label || v}</Tag>,
    },
    {
      title: 'Actions', width: 100,
      render: (_, rec) => (
        <Space size="small">
          <Tooltip title="Détail"><Button size="small" icon={<EyeOutlined />} onClick={() => setDetailAnimal(rec)} /></Tooltip>
          <Popconfirm title="Supprimer cet animal ?" onConfirm={() => handleDelete(rec.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Chargement des animaux..." />
      </div>
    );
  }

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #FFE0B2, #FFCC80)' }}>🐔</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Élevage</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {isOnline ? '🌐 Synchronisé avec Supabase' : '💾 Mode local only'}
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadData}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>
          Ajouter
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🐔</div>
            <Statistic title="Poules" value={data.filter(a => a.espece === 'poule').length} styles={{ content: { color: colors.warning, fontWeight: 700 }} } />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistrées</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🐐</div>
            <Statistic title="Chèvres" value={data.filter(a => a.espece === 'chevre').length} styles={{ content: { color: colors.success, fontWeight: 700 }} } />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistrées</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🐑</div>
            <Statistic title="Moutons" value={data.filter(a => a.espece === 'mouton').length} styles={{ content: { color: colors.info, fontWeight: 700 }} } />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistrés</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🐇</div>
            <Statistic title="Lapins" value={data.filter(a => a.espece === 'lapin').length} styles={{ content: { color: '#722ED1', fontWeight: 700 }} } />
            <Text type="secondary" style={{ fontSize: 11 }}>Enregistrés</Text>
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="registre"
        type="card"
        items={[
          {
            key: 'registre', label: '📋 Registre',
            children: (
              <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
                <Table columns={columns} dataSource={data} rowKey="id" scroll={{ x: 900 }} size="middle" pagination={{ pageSize: 8, showTotal: t => `${t} animal(aux)` }} />
              </Card>
            ),
          },
          {
            key: 'vaccins', label: '💉 Vaccins',
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card title="📅 Calendrier Vaccinal Automatique" style={{ background: '#F0FFF0', marginBottom: 16 }}>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={8}>
                          <Tag color="blue">🐔 Poule: Newcastle (J7, Rappel J30)</Tag>
                        </Col>
                        <Col xs={24} md={8}>
                          <Tag color="blue">🐔 Poule: Gumboro (J14, Rappel J60)</Tag>
                        </Col>
                        <Col xs={24} md={8}>
                          <Tag color="green">🐐 Chèvre: Pasteurellose (J60, Rappel 6 mois)</Tag>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Alert type="warning" message="💡 Les alertes de vaccination sont générées automatiquement selon l'âge de chaque animal" showIcon />
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'marges', label: '💰 Marges',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="📊 Répartition du Cheptel" style={{ borderRadius: 12 }}>
                    {data.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <Text type="secondary">Aucun animal enregistré</Text>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie 
                            data={Object.entries(
                              data.reduce((acc, a) => {
                                acc[a.espece] = (acc[a.espece] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([name, value]) => ({ 
                              name: especeConfig[name]?.label || name, 
                              value 
                            }))} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={80}
                          >
                            {Object.keys(data.reduce((acc, a) => { acc[a.espece] = true; return acc; }, {} as Record<string, boolean>)).map((key, i) => (
                              <Cell key={i} fill={[colors.warning, colors.success, colors.info, '#722ED1', '#FA8C16'][i % 5]} />
                            ))}
                          </Pie>
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="💵 Marge Potentielle par Animal" style={{ borderRadius: 12 }}>
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">Enregistrez des animaux pour voir les marges</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'production', label: '📊 Production',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="🥚 Production œufs" style={{ borderRadius: 12 }}>
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">Enregistrez des animaux et productions pour voir les graphiques</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'ventes', label: '💸 Ventes',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="🔔 Animaux prets pour vente (Reforme)" style={{ borderRadius: 12 }}>
                    {data.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <Text type="secondary">Aucun animal enregistré</Text>
                      </div>
                    ) : (
                      <Table 
                        columns={[
                          { title: 'Code', dataIndex: ['animal', 'code'], render: (v: string) => <Tag style={{ fontFamily: 'monospace' }}>{v}</Tag> },
                          { title: 'Espece', dataIndex: ['animal', 'espece'], render: (v: string) => especeConfig[v]?.emoji + ' ' + (especeConfig[v]?.label || v) },
                          { title: 'Prix vente', dataIndex: 'prixVente', render: (v: number) => v.toLocaleString() + ' FCA' },
                          { title: 'Jours restants', dataIndex: 'joursRestants', render: (v: number) => v <= 0 ? <Tag color="red">Maintenant!</Tag> : <Tag color="orange">{v} jours</Tag> },
                          { title: 'Action', render: () => <Button type="primary" size="small">Vendre</Button> },
                        ]}
                        dataSource={getAnimauxAPrevoirVente(data)}
                        pagination={false}
                        size="small"
                      />
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="📈 Suivi Marge en Temps Reel" style={{ borderRadius: 12 }}>
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <Text type="secondary">Enregistrez des transactions pour voir les marges</Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Modal title="🐔 Ajouter un animal" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields(); }} onOk={handleAdd} okText="Ajouter" cancelText="Annuler">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="espece" label="Espèce" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner">
                  {Object.entries(especeConfig).map(([k, v]) => (
                    <Option key={k} value={k}>{v.emoji} {v.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="race" label="Race"><Input placeholder="Ex: Cobb 500" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sexe" label="Sexe" rules={[{ required: true }]}>
                <Select><Option value="M">♂ Mâle</Option><Option value="F">♀ Femelle</Option></Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="poids" label="Poids (kg)"><InputNumber style={{ width: '100%' }} min={0.1} step={0.1} /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dateNaissance" label="Date naissance"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="localisation" label="Localisation"><Input placeholder="Ex: Poulailler A" /></Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={detailAnimal ? `Fiche — ${detailAnimal.code}` : ''} open={!!detailAnimal} onCancel={() => setDetailAnimal(null)} footer={null} width={600}>
        {detailAnimal && <AnimalCard animal={detailAnimal} />}
      </Modal>
    </div>
  );
}