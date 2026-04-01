'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Typography, Space, Button,
  Table, Select, Modal, Form, Input, InputNumber, message, Popconfirm, Spin,
} from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockTransactions } from '@/lib/mockData';
import { colors } from '@/lib/theme';
import type { Transaction, TypeTransaction, ModuleFerme } from '@/types';
import { transactionsService, type Transaction as DbTransaction } from '@/lib/crudService';

const { Text } = Typography;
const { Option } = Select;

const LOCAL_KEY = 'ferme_crud_transactions';

const moduleConfig: Record<ModuleFerme, { icon: string; color: string }> = {
  elevage: { icon: '🐔', color: '#FF6B35' },
  cultures: { icon: '🌱', color: '#2D7D32' },
  valorisation: { icon: '♻️', color: '#722ED1' },
  alimentation: { icon: '🌾', color: '#FA8C16' },
  infrastructure: { icon: '🏗️', color: '#5A7A5A' },
};

export default function FinancesPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('tous');
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // localStorage helpers
  const loadLocal = (): Transaction[] => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveLocal = (txs: Transaction[]) => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(txs)); } catch (e) { console.error(e); }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const localData = loadLocal();
    
    try {
      const { data: txs, error } = await transactionsService.getAll();
      
      if (error || !txs || txs.length === 0) {
        if (localData.length > 0) {
          setData(localData);
        } else {
          const seed = mockTransactions.slice(0, 5) as Transaction[];
          setData(seed);
          saveLocal(seed);
        }
      } else {
        const formatted = (txs || []).map((t: DbTransaction) => ({
          id: t.id || String(Date.now()),
          date: t.date,
          type: t.type as TypeTransaction,
          categorie: t.categorie || '',
          montant: t.montant || 0,
          description: t.description || '',
          module: (t.module || 'elevage') as ModuleFerme,
        }));
        setData(formatted);
        saveLocal(formatted);
      }
    } catch {
      if (localData.length > 0) {
        setData(localData);
      } else {
        setData(mockTransactions.slice(0, 5) as Transaction[]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleDelete = async (id: string) => {
    // Immediate local delete
    const newData = data.filter(t => t.id !== id);
    setData(newData);
    saveLocal(newData);
    
    // Background Supabase sync
    try { await transactionsService.delete(id); } catch {}
    message.success('Transaction supprimée');
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newTx: Transaction = {
        id: `local-${Date.now()}`,
        date: values.date?.format('YYYY-MM-DD') || new Date().toISOString().slice(0, 10),
        type: values.type as TypeTransaction,
        categorie: values.categorie || '',
        montant: values.montant || 0,
        description: values.description || '',
        module: (values.module || 'elevage') as ModuleFerme,
      };
      
      // Save locally first
      const newData = [newTx, ...data];
      setData(newData);
      saveLocal(newData);
      
      // Background Supabase sync
      try {
        await transactionsService.create({
          date: newTx.date,
          type: newTx.type as 'revenu' | 'depense',
          categorie: newTx.categorie,
          montant: newTx.montant,
          description: newTx.description,
          module: newTx.module,
        });
      } catch {}
      
      message.success('Transaction ajoutée !');
      setAddModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Erreur lors de l\'ajout');
    }
  };

  const totalRevenus = data.filter(t => t.type === 'revenu').reduce((s, t) => s + t.montant, 0);
  const totalDepenses = data.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0);
  const beneficeNet = totalRevenus - totalDepenses;
  const filteredData = filterType === 'tous' ? data : data.filter(t => t.type === filterType);

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Date', dataIndex: 'date', width: 100,
      render: v => new Date(v).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Type', dataIndex: 'type', width: 100,
      render: (v: TypeTransaction) => (
        <Tag color={v === 'revenu' ? 'green' : 'red'}>
          {v === 'revenu' ? 'Revenu' : 'Dépense'}
        </Tag>
      ),
    },
    {
      title: 'Module', dataIndex: 'module', width: 120,
      render: (v: ModuleFerme) => {
        const config = moduleConfig[v] || { icon: '📦', color: 'default' };
        return <Tag color={config.color}>{config.icon} {v}</Tag>;
      }
    },
    { title: 'Catégorie', dataIndex: 'categorie', render: v => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: 'Montant', dataIndex: 'montant', width: 140, align: 'right',
      render: (v, r) => (
        <Text strong style={{ fontSize: 14, color: r.type === 'revenu' ? colors.success : colors.error }}>
          {r.type === 'revenu' ? '+' : '-'}{v.toLocaleString('fr-FR')} FCFA
        </Text>
      ),
    },
    {
      title: 'Actions', width: 80,
      render: (_, r) => (
        <Popconfirm title="Supprimer cette transaction ?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" description="Chargement des transactions..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #BBDEFB, #90CAF9)' }}>💰</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Finances</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Transactions — Sauvegardées localement</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadTransactions}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>
          Nouvelle transaction
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Revenus du mois', value: totalRevenus, color: colors.success, icon: '📈' },
          { title: 'Dépenses du mois', value: totalDepenses, color: colors.error, icon: '📉' },
          { title: 'Bénéfice net', value: beneficeNet, color: beneficeNet >= 0 ? colors.primary : colors.error, icon: beneficeNet >= 0 ? '💰' : '⚠️' },
          { title: 'Transactions', value: data.length, color: colors.info, icon: '📋' },
        ].map(s => (
          <Col xs={12} lg={6} key={s.title}>
            <Card style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{s.title}</Text>}
                  value={s.value}
                  suffix="FCFA"
                  styles={{ content: { color: s.color, fontWeight: 800, fontSize: 22 } }}
                  formatter={typeof s.value === 'number' ? (v) => Number(v).toLocaleString('fr-FR') : undefined}
                />
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tableau */}
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}
        title={
          <Select value={filterType} onChange={setFilterType} style={{ width: 140 }}>
            <Option value="tous">Tous</Option>
            <Option value="revenu">Revenus</Option>
            <Option value="depense">Dépenses</Option>
          </Select>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: t => `${t} transactions` }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title="💰 Nouvelle transaction"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields(); }}
        onOk={handleAdd}
        okText="Enregistrer" cancelText="Annuler"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue="revenu">
                <Select>
                  <Option value="revenu">📈 Revenu</Option>
                  <Option value="depense">📉 Dépense</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="montant" label="Montant (FCFA)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="module" label="Module" rules={[{ required: true }]}>
                <Select>
                  {Object.entries(moduleConfig).map(([k, v]) => (
                    <Option key={k} value={k}>{v.icon} {k.charAt(0).toUpperCase() + k.slice(1)}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categorie" label="Catégorie" rules={[{ required: true }]}>
                <Input placeholder="Ex: Vente œufs" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <Input placeholder="Détails optionnels" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}