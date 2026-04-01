// =============================================
// COMPOSANT ALERTES - Dropdown dans le header
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, List, Tag, Typography, Space, Empty } from 'antd';
import { BellOutlined, WarningOutlined, CloseCircleOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { NotificationsService, type Notification } from '@/lib/notificationsService';

const { Text } = Typography;

const getAlertIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'high': return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'low': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    default: return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  }
};

const getAlertColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'low': return 'green';
    default: return 'blue';
  }
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    stock: 'Stock',
    animal: 'Élevage',
    culture: 'Cultures',
    finance: 'Finances',
    task: 'Tâches',
    system: 'Système',
  };
  return labels[category] || category;
};

export const AlertDropdown: React.FC = () => {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Charger les alertes intelligentes depuis Supabase
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const notifications = await NotificationsService.getAllNotifications();
        setAlerts(notifications);
      } catch (error) {
        console.error('Erreur chargement alertes:', error);
      }
      setLoading(false);
    };
    
    loadAlerts();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.priority === 'critical').length;

  const handleAlertClick = (alert: Notification) => {
    if (alert.actionUrl) {
      router.push(alert.actionUrl);
    }
  };

  const dropdownContent = (
    <div style={{ 
      width: 360, 
      maxHeight: 400, 
      overflow: 'auto',
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space>
          <BellOutlined />
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Tag color="red">{unreadCount}</Tag>
          )}
        </Space>
        {criticalCount > 0 && (
          <Tag color="red" style={{ margin: 0 }}>
            {criticalCount} critique(s)
          </Tag>
        )}
      </div>

      {/* Liste des alertes */}
      {alerts.length === 0 ? (
        <Empty 
          description="Aucune alerte" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={alerts.slice(0, 10)}
          renderItem={(alert) => (
            <List.Item
              onClick={() => handleAlertClick(alert)}
              style={{ 
                padding: '12px 16px',
                cursor: 'pointer',
                background: !alert.read ? '#f6ffed' : '#fff',
                borderLeft: `3px solid ${alert.priority === 'critical' ? '#ff4d4f' : alert.priority === 'high' ? '#faad14' : '#1890ff'}`,
              }}
              className="alert-item"
            >
              <List.Item.Meta
                avatar={getAlertIcon(alert.priority)}
                title={
                  <Space>
                    <Text strong style={{ fontSize: 13 }}>{alert.title}</Text>
                    <Tag color={getAlertColor(alert.priority)} style={{ margin: 0, fontSize: 10 }}>
                      {getCategoryLabel(alert.category)}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text style={{ fontSize: 12, color: '#666' }}>{alert.message}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(alert.createdAt).toLocaleString('fr-FR')}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* Footer */}
      {alerts.length > 0 && (
        <div style={{ 
          padding: '8px 16px', 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Button type="link" size="small" onClick={() => router.push('/dashboard')}>
            Voir toutes les alertes →
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown 
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ color: '#5A7A5A' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default AlertDropdown;