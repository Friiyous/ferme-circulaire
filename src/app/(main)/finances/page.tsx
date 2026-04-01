'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Typography, Space, Button,
  Table, Select, Modal, Form, Input, InputNumber, message, Popconfirm, Spin,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
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

const loadLocal = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveLocal = (txs: Transaction[]) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(txs)); } catch (e) { console.error(e); }
};

export default function FinancesPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('tous');
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const localData = loadLocal();
    setData(localData);
    
    try {
      const { data: txs } = await transactionsService.getAll();
      if (txs && txs.length > 0) {
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
    } catch {}
    
    setLoading(false);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleDelete = async (id: string) => {
    const newData = data.filter(t => t.id !== id);
    setData(newData);
    saveLocal(newData);
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
      
      const newData = [newTx, ...data];
      setData(newData);
      saveLocal(newData);
      
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
    { title: 'Date', dataIndex: 'date', width: 100, render: v => new Date(v).toLocaleDateString('fr-FR') },
    { title: 'Type', dataIndex: 'type', width: 100, render: (v: TypeTransaction) => <Tag color={v === 'revenu' ? 'green' : 'red'}>{v === 'revenu' ? 'Revenu' : 'Depense'}</Tag> },
    { title: 'Module', dataIndex: 'module', width: 120, render: (v: ModuleFerme) => <Tag color={moduleConfig[v]?.color}>{moduleConfig[v]?.icon} {v}</Tag> },
    { title: 'Categorie', dataIndex: 'categorie', render: v => <Text strong>{v}</Text> },
    { title: 'Montant', dataIndex: 'montant', width: 140, align: 'right', render: (v, r) => <Text strong style={{ color: r.type === 'revenu' ? colors.success : colors.error }}>{r.type === 'revenu' ? '+' : '-'}{v.toLocaleString()} FCA</Text> },
    { title: 'Actions', width: 80, render: (_, r) => <Popconfirm title="Supprimer ?" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm> },
  ];

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #BBDEFB, #90CAF9)' }}>💰</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module Finances</h1>
          <Text type="secondary">Transactions</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadTransactions}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>Nouvelle transaction</Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}><Card style={{ borderRadius: 12 }}><Statistic title="Revenus" value={totalRevenus} valueStyle={{ color: colors.success, fontWeight: 700 }} suffix="FCA" /></Card></Col>
        <Col xs={12} lg={6}><Card style={{ borderRadius: 12 }}><Statistic title="Depenses" value={totalDepenses} valueStyle={{ color: colors.error, fontWeight: 700 }} suffix="FCA" /></Card></Col>
        <Col xs={12} lg={6}><Card style={{ borderRadius: 12 }}><Statistic title="Benefice net" value={beneficeNet} valueStyle={{ color: beneficeNet >= 0 ? colors.primary : colors.error, fontWeight: 700 }} suffix="FCA" /></Card></Col>
        <Col xs={12} lg={6}><Card style={{ borderRadius: 12 }}><Statistic title="Transactions" value={data.length} valueStyle={{ fontWeight: 700 }} /></Card></Col>
      </Row>

      <Card style={{ borderRadius: 12 }} title={<Select value={filterType} onChange={setFilterType} style={{ width: 140 }}><Option value="tous">Tous</Option><Option value="revenu">Revenus</Option><Option value="depense">Depenses</Option></Select>}>
        {filteredData.length > 0 ? (
          <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 10 }} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">Aucune transaction. Cliquez sur "Nouvelle transaction" pour commencer.</Text>
          </div>
        )}
      </Card>

      <Modal title="Nouvelle transaction" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields(); }} onOk={handleAdd} okText="Enregistrer">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue="revenu"><Select><Option value="revenu">Revenu</Option><Option value="depense">Depense</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="montant" label="Montant" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item name="module" label="Module" rules={[{ required: true }]}><Select>{Object.entries(moduleConfig).map(([k, v]) => <Option key={k} value={k}>{v.icon} {k}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="categorie" label="Categorie" rules={[{ required: true }]}><Input placeholder="Ex: Vente œufs" /></Form.Item></Col>
            <Col span={24}><Form.Item name="description" label="Description"><Input placeholder="Details" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}