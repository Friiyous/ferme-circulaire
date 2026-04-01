// =============================================
// PAGE PORTAIL ÉQUIPE
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, Tabs, Space, Button, Table, Tag, Typography, Modal, Form, Input, Select, message, Progress, Row, Col, Statistic } from 'antd';
import { PlusOutlined, TrophyOutlined, TeamOutlined, StarOutlined } from '@ant-design/icons';
import { TeamService } from '@/lib/teamService';
import { EmployeeDashboard } from '@/components/team/EmployeeDashboard';
import type { TeamMember, MemberStats } from '@/types/team';
import { ROLE_CONFIG } from '@/types/team';

const { Title, Text } = Typography;

export default function EquipePage() {
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const [current, members, leaderboard, stats] = await Promise.all([
        Promise.resolve(TeamService.getCurrentMember()),
        Promise.resolve(TeamService.getAllMembers()),
        Promise.resolve(TeamService.getLeaderboard()),
        Promise.resolve(TeamService.getTeamStats()),
      ]);
      
      setCurrentMember(current);
      setAllMembers(members);
      setMemberStats(leaderboard);
      setTeamStats(stats);
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
      message.error('Échec chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (values: any) => {
    try {
      TeamService.createMember({
        nom: values.nom,
        prenom: values.prenom,
        role: values.role,
        telephone: values.telephone,
        actif: true,
      });
      
      message.success('✅ Membre ajouté !');
      setAddModalVisible(false);
      form.resetFields();
      loadTeamData();
    } catch (error) {
      message.error('Échec ajout membre');
    }
  };

  // Si pas de membre connecté (devrait toujours avoir au moins un en mode mock)
  if (!currentMember) {
    return (
      <Card>
        <Title level={3}>👤 Connexion requise</Title>
        <Text>Veuillez vous connecter pour accéder au portail équipe.</Text>
      </Card>
    );
  }

  const isManager = ['proprietaire', 'contremaître'].includes(currentMember.role);

  const columns = [
    { 
      title: 'Membre', 
      key: 'name',
      render: (_: any, r: MemberStats) => {
        const member = allMembers.find(m => m.id === r.id);
        return member ? `${member.prenom} ${member.nom}` : r.prenom + ' ' + r.nom;
      }
    },
    { 
      title: 'Rôle', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => {
        const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];
        return <Tag color={config?.color}>{config?.icon} {config?.label}</Tag>;
      }
    },
    { 
      title: 'Tâches', 
      key: 'tasks',
      render: (_: any, r: MemberStats) => `${r.completed_tasks}/${r.total_tasks}`
    },
    { 
      title: 'Complétion', 
      dataIndex: 'completion_rate', 
      key: 'completion_rate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          strokeColor={rate >= 80 ? '#52C41A' : '#FA8C16'}
          size="small"
          style={{ width: 80 }}
        />
      )
    },
    { title: 'Points', dataIndex: 'total_points', key: 'total_points' },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>👥 Portail Équipe</Title>

      <Tabs
        items={[
          {
            key: 'my-dashboard',
            label: '📋 Mon Tableau de Bord',
            children: currentMember && <EmployeeDashboard member={currentMember} />,
          },
          {
            key: 'team-overview',
            label: '👥 Vue Équipe',
            children: isManager ? (
              <>
                {/* Stats globales */}
                {teamStats && (
                  <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic 
                          title="Membres actifs" 
                          value={teamStats.activeMembers} 
                          prefix={<TeamOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic 
                          title="Tâches aujourd'hui" 
                          value={teamStats.totalTasksToday} 
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic 
                          title="Complétées" 
                          value={teamStats.completedTasksToday} 
                          suffix={`/ ${teamStats.totalTasksToday}`}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic 
                          title="Taux équipe" 
                          value={teamStats.completionRate} 
                          suffix="%"
                          valueStyle={{ color: teamStats.completionRate >= 70 ? '#52C41A' : '#FA8C16' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                )}
                
                <Card 
                  title="Membres de l'équipe"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                      Ajouter Membre
                    </Button>
                  }
                  style={{ marginTop: 16 }}
                >
                  <Table 
                    columns={columns} 
                    dataSource={memberStats} 
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                  />
                </Card>
              </>
            ) : (
              <Card>
                <Text type="secondary">🔒 Réservé au contremaître et propriétaire</Text>
              </Card>
            ),
          },
          {
            key: 'leaderboard',
            label: '🏆 Classement',
            children: (
              <Card title="🏆 Classement Semaine">
                <Table 
                  columns={[
                    { title: 'Rang', key: 'rang', width: 60, render: (_: any, __: any, index: number) => `#${index + 1}` },
                    { title: 'Nom', key: 'name', render: (_: any, r: MemberStats) => {
                      const member = allMembers.find(m => m.id === r.id);
                      return member ? `${member.prenom} ${member.nom}` : r.prenom + ' ' + r.nom;
                    }},
                    { title: 'Rôle', dataIndex: 'role', key: 'role', render: (r: string) => ROLE_CONFIG[r as keyof typeof ROLE_CONFIG]?.label },
                    { title: 'Points', dataIndex: 'total_points', key: 'total_points', sorter: (a: any, b: any) => a.total_points - b.total_points },
                    { title: 'Tâches', dataIndex: 'completed_tasks', key: 'completed_tasks' },
                    { title: 'Taux', dataIndex: 'completion_rate', key: 'completion_rate', render: (v: number) => `${v}%` },
                  ]}
                  dataSource={memberStats.sort((a, b) => b.total_points - a.total_points)}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal ajout membre */}
      <Modal
        title="👤 Ajouter un Membre d'Équipe"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddMember} layout="vertical">
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
            <Input placeholder="Ex: Kouamé" />
          </Form.Item>
          <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Ex: Koné" />
          </Form.Item>
          <Form.Item name="role" label="Rôle" rules={[{ required: true }]}>
            <Select placeholder="Sélectionner">
              <Select.Option value="contremaître">👨‍💼 Contremaître</Select.Option>
              <Select.Option value="ouvrier_elevage">🐔 Ouvrier Élevage</Select.Option>
              <Select.Option value="ouvrier_culture">🌱 Ouvrier Culture</Select.Option>
              <Select.Option value="technicien">⚡ Technicien</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone">
            <Input placeholder="0707XXXXXX" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Ajouter le Membre
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}