'use client';

import React from 'react';
import { Card, Avatar, Typography, Row, Col, Space, Tag, Badge } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  TeamOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { Employe } from '@/types';
import { colors } from '@/lib/theme';

const { Text, Title } = Typography;

interface OrganigrammeProps {
  employes: Employe[];
}

export const Organigramme: React.FC<OrganigrammeProps> = ({ employes }) => {
  // Trouver le directeur technique / gestionnaire (racine)
  const racine = employes.find(e => !e.managerId);
  const directs = employes.filter(e => e.managerId === racine?.id);
  
  const getRoleLabel = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  
  const getSubordinates = (managerId: string) => employes.filter(e => e.managerId === managerId);

  const renderEmployeCard = (employe: Employe, type: 'racine' | 'manager' | 'worker') => {
    const isRacine = type === 'racine';
    const cardBg = isRacine ? '#F0F5F0' : '#FFFFFF';
    const cardBorder = isRacine ? `2px solid ${colors.primary}` : '1px solid #f0f0f0';
    const subs = getSubordinates(employe.id);
    
    return (
      <Card 
        size="small" 
        style={{ 
          borderRadius: 12, 
          background: cardBg, 
          border: cardBorder,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          height: '100%',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          {employe.statut === 'actif' ? 
            <Badge status="success" /> : 
            <Badge status="warning" />
          }
        </div>
        
        <Avatar 
          size={type === 'racine' ? 80 : 64} 
          src={employe.avatar} 
          icon={<UserOutlined />} 
          style={{ marginBottom: 12, border: `2px solid ${colors.primary}`, background: '#FFF' }} 
        />
        
        <Title level={isRacine ? 4 : 5} style={{ margin: '0 0 4px 0' }}>
          {employe.preNom} {employe.nom}
        </Title>
        
        <Tag color="green" style={{ marginBottom: 12, borderRadius: 12, border: 'none' }}>
          {getRoleLabel(employe.role)}
        </Tag>
        
        <div style={{ textAlign: 'left', background: isRacine ? '#FFF' : '#FAFAFA', padding: 12, borderRadius: 8 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <TeamOutlined /> Dpt: <Text strong>{employe.departement.toUpperCase()}</Text>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {employe.contact}
            </Text>
            {isRacine && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <DollarOutlined /> {employe.salaireMensuel.toLocaleString('fr-FR')} FCFA/mois
              </Text>
            )}
            {subs.length > 0 && (
              <div style={{ marginTop: 8, borderTop: '1px solid #E8E8E8', paddingTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Supervise {subs.length} ressource(s)
                </Text>
              </div>
            )}
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px 0', overflowX: 'auto' }}>
      {/* Niveau 1: Racine */}
      {racine && (
        <Row justify="center" style={{ marginBottom: 32 }}>
          <Col xs={24} sm={16} md={10} lg={8}>
            {renderEmployeCard(racine, 'racine')}
          </Col>
        </Row>
      )}

      {/* Niveau 2: Team Leads */}
      <div style={{ position: 'relative', borderTop: '2px solid #E8E8E8', paddingTop: 32, margin: '0 24px' }}>
        <Row gutter={[24, 32]} justify="center">
          {directs.map(lead => {
            const workers = getSubordinates(lead.id);
            return (
              <Col xs={24} sm={12} lg={8} key={lead.id}>
                {renderEmployeCard(lead, 'manager')}
                
                {/* Niveau 3: Ouvriers/Manoeuvres pour ce lead */}
                {workers.length > 0 && (
                  <div style={{ marginTop: 24, paddingLeft: 24, borderLeft: '2px solid #E8E8E8' }}>
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {workers.map(worker => (
                        <div key={worker.id}>
                          {renderEmployeCard(worker, 'worker')}
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};
