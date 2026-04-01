'use client';
import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Table, Tag, Button, Space, Modal, Form, Input, Select, InputNumber, DatePicker, Popconfirm, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { employeesService, type Employee as DbEmployee } from '@/lib/crudService';
import { mockEmployes } from '@/lib/mockData';
import type { Employe } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function RessourcesHumainesPage() {
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await employeesService.getAll();
      if (error) throw error;
      
      const formatted = (data || []).map((e: DbEmployee) => ({
        id: e.id || String(Date.now()),
        matricule: `EMP-${(e.id || '001').slice(-3)}`,
        nom: e.nom || '',
        preNom: e.prenom || '',
        role: (e.role || 'ouvrier').replace('_', ' '),
        departement: e.role?.includes('Elevage') ? 'elevage' : e.role?.includes('Culture') ? 'cultures' : 'general',
        telephone: e.telephone || '',
        email: e.email || '',
        statut: e.statut || 'actif',
        salaireMensuel: e.salaire || 0,
        dateEmbauche: e.date_embauche || '',
      }));
      
      setEmployees(formatted.length > 0 ? formatted : (mockEmployes as Employe[]).slice(0, 3));
    } catch {
      setEmployees((mockEmployes as Employe[]).slice(0, 3));
      message.warning('Données de démonstration affichées');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await employeesService.delete(id);
      setEmployees(e => e.filter(emp => emp.id !== id));
      message.success('Employé supprimé');
    } catch {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const newEmployee = {
        nom: values.nom,
        prenom: values.prenom || '',
        role: values.role || 'Ouvrier Polyvalent',
        telephone: values.telephone || '',
        email: values.email || '',
        statut: 'actif' as const,
        salaire: values.salaire || 0,
        date_embauche: values.date_embauche?.format('YYYY-MM-DD'),
      };
      
      const { data: created, error } = await employeesService.create(newEmployee);
      if (error) throw error;
      
      setEmployees(e => [{
        id: created?.id || String(Date.now()),
        matricule: `EMP-${String(Date.now()).slice(-3)}`,
        ...newEmployee,
        role: newEmployee.role.replace('_', ' '),
        departement: 'general',
        statut: 'actif' as any,
        salaireMensuel: newEmployee.salaire || 0,
      } as Employe, ...e]);
      
      message.success('Employé ajouté !');
      setAddModalOpen(false);
      form.resetFields();
    } catch {
      message.error('Erreur lors de l\'ajout');
    }
  };

  const columns = [
    { title: 'Matricule', dataIndex: 'matricule', render: (t: string) => <Text strong style={{ fontFamily: 'monospace' }}>{t}</Text> },
    { 
      title: 'Employé', 
      key: 'nom',
      render: (_: any, r: Employe) => (
        <div>
          <Text strong>{r.preNom} {r.nom}</Text>
          <br/>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.role}</Text>
        </div>
      )
    },
    { title: 'Téléphone', dataIndex: 'telephone', render: (t: string) => <Text type="secondary">{t}</Text> },
    { 
      title: 'Salaire', 
      dataIndex: 'salaireMensuel', 
      render: (s: number) => <Text strong style={{ color: '#1677FF' }}>{s.toLocaleString('fr-FR')} FCFA</Text> 
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      render: (s: string) => <Tag color={s === 'actif' ? 'success' : 'warning'}>{s.toUpperCase()}</Tag> 
    },
    {
      title: 'Actions',
      render: (_: any, r: Employe) => (
        <Popconfirm title="Supprimer cet employé ?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Chargement des employés..." />
      </div>
    );
  }

  const totalSalaires = employees.reduce((acc, emp) => acc + (emp.salaireMensuel || 0), 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="module-header">
        <div className="module-icon" style={{ background: 'linear-gradient(135deg, #E1BEE7, #CE93D8)' }}>👥</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Module RH</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Employés — Données sauvegardées dans Supabase</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadEmployees}>Actualiser</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)} style={{ marginLeft: 8 }}>
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={4}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>👥</div>
            <Title level={4} style={{ margin: 0 }}>{employees.length}</Title>
            <Text type="secondary">Employés</Text>
          </Card>
        </Col>
        <Col xs={12} lg={8}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#FFF8E1' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>💰</div>
            <Title level={4} style={{ margin: 0, color: '#E65100' }}>
              {Math.round(totalSalaires / 1000)}k FCFA
            </Title>
            <Text type="secondary">Masse salariale / mois</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12, background: '#E8F5E9' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>✅</div>
            <Title level={4} style={{ margin: 0, color: '#2E7D32' }}>
              {employees.filter(e => e.statut === 'actif').length}
            </Title>
            <Text type="secondary">Actifs</Text>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📊</div>
            <Title level={4} style={{ margin: 0 }}>{(totalSalaires / (employees.length || 1)).toLocaleString('fr-FR')}</Title>
            <Text type="secondary">Salaire moyen</Text>
          </Card>
        </Col>
      </Row>

      {/* Tableau */}
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={employees} 
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal Ajout */}
      <Modal
        title="👤 Nouvel employé"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields(); }}
        onOk={handleAdd}
        okText="Ajouter" cancelText="Annuler"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
                <Input placeholder="Ex: Kouamé" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="prenom" label="Prénom">
                <Input placeholder="Ex: Jean-Pierre" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Rôle" rules={[{ required: true }]}>
                <Select>
                  <Option value="Responsable Elevage">Responsable Elevage</Option>
                  <Option value="Responsable Cultures">Responsable Cultures</Option>
                  <Option value="Technicienne Valorisation">Technicienne Valorisation</Option>
                  <Option value="Ouvrier Polyvalent">Ouvrier Polyvalent</Option>
                  <Option value="Magasinier">Magasinier</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salaire" label="Salaire (FCFA)">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="telephone" label="Téléphone">
                <Input placeholder="+225 07XX XXX XX" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="email@exemple.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="date_embauche" label="Date d'embauche">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}