// =============================================
// COMPOSANT: TABLEAU DE BORD EMPLOYÉ
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, List, Button, Space, Tag, Progress, Typography, Modal, Input, message, Statistic, Row, Col, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons';
import { TeamService } from '@/lib/teamService';
import type { DailyTask, TaskStatus, TeamMember, TeamBadge, MemberStats } from '@/types/team';
import { ROLE_CONFIG } from '@/types/team';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface EmployeeDashboardProps {
  member: TeamMember;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ member }) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [badges, setBadges] = useState<TeamBadge[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [member.id]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [tasksData, checkins, badgesData] = await Promise.all([
        Promise.resolve(TeamService.getTodayTasks(member.id)),
        Promise.resolve(TeamService.getTodayCheckins(member.id)),
        Promise.resolve(TeamService.getMemberBadges(member.id)),
      ]);
      
      setTasks(tasksData);
      setCheckinDone(checkins.some(c => c.type === 'checkin'));
      setCheckoutDone(checkins.some(c => c.type === 'checkout'));
      setBadges(badgesData);
      setStats(TeamService.getMemberStats(member.id));
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      message.error('Échec chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (type: 'checkin' | 'checkout') => {
    try {
      await TeamService.createCheckin({
        member_id: member.id,
        type,
        timestamp: new Date().toISOString(),
        device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      });

      if (type === 'checkin') {
        setCheckinDone(true);
        await TeamService.addPoints(member.id, 10, 'Check-in matinal');
      } else {
        setCheckoutDone(true);
      }

      message.success(type === 'checkin' ? '✅ Check-in enregistré' : '✅ Check-out enregistré');
    } catch (error) {
      message.error('Échec enregistrement');
    }
  };

  const handleCompleteTask = async (task: DailyTask) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const submitTaskCompletion = async () => {
    if (!selectedTask) return;

    try {
      await TeamService.updateTaskStatus(selectedTask.id, 'done', { notes });

      const points = selectedTask.priority === 'urgent' ? 30 : 
                     selectedTask.priority === 'high' ? 20 : 10;
      await TeamService.addPoints(member.id, points, `Tâche: ${selectedTask.title}`);

      message.success('✅ Tâche complétée !');
      setModalVisible(false);
      setNotes('');
      loadDashboard();
    } catch (error) {
      message.error('Échec validation tâche');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'red',
      high: 'orange',
      normal: 'blue',
      low: 'green',
    };
    return colors[priority] || 'default';
  };

  const getStationIcon = (station?: string) => {
    const icons: Record<string, string> = {
      poulailler: '🐔',
      cultures: '🌱',
      biogaz: '⚡',
      compost: '♻️',
    };
    return icons[station || ''] || '📋';
  };

  const roleConfig = ROLE_CONFIG[member.role];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* En-tête employé */}
      <Card>
        <Space style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}>
          <Space>
            <div style={{ 
              fontSize: 32, 
              background: '#f5f5f5', 
              borderRadius: '50%', 
              width: 64, 
              height: 64, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {member.nom?.charAt(0) || '?'}
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {member.prenom} {member.nom}
              </Title>
              <Tag color={roleConfig?.color}>{roleConfig?.icon} {roleConfig?.label}</Tag>
            </div>
          </Space>
          
          {/* Check-in / Check-out */}
          <Space>
            <Button
              type={checkinDone ? 'default' : 'primary'}
              disabled={checkinDone}
              onClick={() => handleCheckin('checkin')}
            >
              {checkinDone ? '✅ Check-in fait' : '📍 Check-in'}
            </Button>
            <Button
              type={checkoutDone ? 'default' : 'primary'}
              disabled={!checkinDone || checkoutDone}
              icon={<ClockCircleOutlined />}
              onClick={() => handleCheckin('checkout')}
            >
              {checkoutDone ? '✅ Check-out fait' : '🕐 Check-out'}
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Stats rapides */}
      {stats && (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Tâches aujourd'hui"
                value={tasks.length}
                valueStyle={{ fontSize: 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Complétées"
                value={stats.completion_rate || 0}
                suffix="%"
                valueStyle={{ 
                  fontSize: 24, 
                  color: (stats.completion_rate || 0) >= 80 ? '#52C41A' : '#FA8C16' 
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Points semaine"
                value={stats.total_points || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ fontSize: 24, color: '#FA8C16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Badges"
                value={badges.length}
                prefix={<StarOutlined />}
                valueStyle={{ fontSize: 24, color: '#722ED1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tâches du jour */}
      <Card 
        title={`📋 Tâches du Jour (${tasks.length})`}
        extra={
          <Tag color="orange">{tasks.filter(t => t.status === 'pending').length} à faire</Tag>
        }
      >
        <List
          loading={loading}
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                task.status === 'pending' ? (
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleCompleteTask(task)}
                  >
                    Valider
                  </Button>
                ) : (
                  <Tag color={task.status === 'done' ? 'green' : 'default'}>
                    {task.status === 'done' ? '✅ Fait' : '⏸️ Skip'}
                  </Tag>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={<span style={{ fontSize: 24 }}>{getStationIcon(task.station)}</span>}
                title={
                  <Space>
                    <Text strong>{task.title}</Text>
                    <Tag color={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      <ClockCircleOutlined /> {task.scheduled_time || 'À tout moment'} • 
                      {task.estimated_duration} min
                    </Text>
                    {task.description && <Text>{task.description}</Text>}
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Aucune tâche pour aujourd\'hui' }}
        />
      </Card>

      {/* Badges */}
      {badges.length > 0 && (
        <Card title="🏅 Tes Badges">
          <Space wrap>
            {badges.map(badge => (
              <Tooltip title={badge.description} key={badge.id}>
                <Card size="small" hoverable style={{ width: 100, textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{badge.badge_icon}</div>
                  <Text strong style={{ fontSize: 11 }}>{badge.badge_name}</Text>
                </Card>
              </Tooltip>
            ))}
          </Space>
        </Card>
      )}

      {/* Modal validation tâche */}
      <Modal
        title={`✅ Valider: ${selectedTask?.title}`}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setNotes(''); }}
        onOk={submitTaskCompletion}
        okText="Valider la tâche"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Notes / Observations:</Text>
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Tout s'est bien passé, aucun problème..."
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>

          <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 8 }}>
            <Text strong style={{ color: '#52C41A' }}>
              🎉 +{selectedTask?.priority === 'urgent' ? 30 : selectedTask?.priority === 'high' ? 20 : 10} points
            </Text>
          </div>
        </Space>
      </Modal>
    </Space>
  );
};

export default EmployeeDashboard;