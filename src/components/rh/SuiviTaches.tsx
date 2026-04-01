'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Tag, Typography, Avatar, Tooltip, Progress, Space, Badge } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  AlertOutlined,
  UserOutlined 
} from '@ant-design/icons';
import type { TacheHR, Employe, StatutTache } from '@/types';
import { mockEmployes } from '@/lib/mockData';

const { Text, Title } = Typography;

interface SuiviTachesProps {
  taches: TacheHR[];
}

export const SuiviTaches: React.FC<SuiviTachesProps> = ({ taches }) => {
  const [tasks] = useState<TacheHR[]>(taches);

  // Helper pour trouver les employés
  const getAssignee = (id: string) => mockEmployes.find(e => e.id === id);

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return '#F5222D';
      case 'haute': return '#FA8C16';
      case 'moyenne': return '#1677FF';
      default: return '#52C41A';
    }
  };

  const getPrioriteLabel = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return <><FireOutlined /> Urgente</>;
      case 'haute': return <><AlertOutlined /> Haute</>;
      case 'moyenne': return 'Moyenne';
      default: return 'Basse';
    }
  };

  const aFaire = tasks.filter(t => t.statut === 'a_faire');
  const enCours = tasks.filter(t => t.statut === 'en_cours');
  const termines = tasks.filter(t => t.statut === 'termine');

  const renderColumn = (title: string, columnTasks: TacheHR[], icon: React.ReactNode, bgColor: string) => (
    <Card 
      title={<Space>{icon} <Text strong style={{ fontSize: 16 }}>{title}</Text> <Badge count={columnTasks.length} style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }} /></Space>}
      style={{ background: bgColor, borderRadius: 12, height: '100%' }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {columnTasks.map(task => {
          const assignee = getAssignee(task.assigneeId);
          return (
            <Card 
              key={task.id} 
              size="small" 
              style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'grab' }}
              bodyStyle={{ padding: 12 }}
            >
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text strong style={{ fontSize: 13, lineHeight: '1.4' }}>{task.titre}</Text>
                <Tag color={getPrioriteColor(task.priorite)} style={{ margin: 0, border: 'none' }}>
                  {getPrioriteLabel(task.priorite)}
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {task.description}
              </Text>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={8}>
                  {task.moduleLie && (
                    <Tag style={{ fontSize: 10, border: '1px solid #E8E8E8', background: '#FAFAFA' }}>
                      {task.moduleLie.toUpperCase()}
                    </Tag>
                  )}
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <ClockCircleOutlined /> {new Date(task.dateEcheance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </Text>
                </Space>
                
                <Space size={8}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>{task.points} pts</Text>
                  <Tooltip title={`${assignee?.preNom} ${assignee?.nom}`}>
                    <Avatar size={24} src={assignee?.avatar} icon={<UserOutlined />} style={{ border: '2px solid #fff' }} />
                  </Tooltip>
                </Space>
              </div>
            </Card>
          );
        })}
        {columnTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>
            <Text type="secondary">Aucune tâche</Text>
          </div>
        )}
      </Space>
    </Card>
  );

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={5} style={{ margin: 0 }}>Performance de l'équipe</Title>
            <Text type="secondary">Avancement global des tâches de la semaine</Text>
          </Col>
          <Col>
            <Space size={24}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Tâches complétées</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52C41A' }}>{termines.length} / {tasks.length}</div>
              </div>
              <Progress type="circle" percent={Math.round((termines.length / tasks.length) * 100)} size={50} />
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          {renderColumn('À faire', aFaire, <ClockCircleOutlined style={{ color: '#FA8C16' }} />, '#FFF7E6')}
        </Col>
        <Col xs={24} lg={8}>
          {renderColumn('En cours', enCours, <CheckCircleOutlined style={{ color: '#1677FF' }} />, '#E6F4FF')}
        </Col>
        <Col xs={24} lg={8}>
          {renderColumn('Terminé', termines, <CheckCircleOutlined style={{ color: '#52C41A' }} />, '#F6FFED')}
        </Col>
      </Row>
    </div>
  );
};
