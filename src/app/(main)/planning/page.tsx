// =============================================
// PAGE PLANNING - Calendrier agricole
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, Calendar, Badge, Typography, Space, Tag, Button, Modal, Form, Input, Select, DatePicker, message, Row, Col, Statistic, List } from 'antd';
import { PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { PlanningService } from '@/lib/planningService';
import type { PlanningEvent, PlanningStats, EventType } from '@/types/planning';
import { EVENT_TYPE_CONFIG, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/planning';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [stats, setStats] = useState<PlanningStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<PlanningEvent[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = () => {
    const year = currentDate.year();
    const month = currentDate.month() + 1;
    setEvents(PlanningService.getEventsByMonth(year, month));
    setStats(PlanningService.getPlanningStats());
    setUpcomingEvents(PlanningService.getUpcomingEvents(14));
  };

  const handleAddEvent = (values: any) => {
    try {
      PlanningService.createEvent({
        title: values.title,
        description: values.description,
        type: values.type,
        status: 'planifie',
        start_date: values.date.format('YYYY-MM-DD'),
        priority: values.priority,
      });
      
      message.success('✅ Événement ajouté !');
      setAddModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('Échec ajout événement');
    }
  };

  const getEventsForDate = (date: Dayjs): PlanningEvent[] => {
    const dateStr = date.format('YYYY-MM-DD');
    return events.filter(e => e.start_date === dateStr);
  };

  const getEventsForCalendar = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return 0;
    
    // Priorité la plus haute
    const hasUrgent = dayEvents.some(e => e.priority === 'urgent');
    const hasHigh = dayEvents.some(e => e.priority === 'high');
    
    if (hasUrgent) return 'error';
    if (hasHigh) return 'warning';
    return 'success';
  };

  const dateCellRender = (date: Dayjs) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div style={{ fontSize: 10 }}>
        {dayEvents.slice(0, 2).map(event => (
          <div 
            key={event.id}
            style={{ 
              padding: '2px 4px', 
              marginBottom: 2,
              borderRadius: 4,
              background: EVENT_TYPE_CONFIG[event.type]?.color || '#ccc',
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {EVENT_TYPE_CONFIG[event.type]?.icon} {event.title}
          </div>
        ))}
        {dayEvents.length > 2 && (
          <Text type="secondary" style={{ fontSize: 9 }}>+{dayEvents.length - 2}</Text>
        )}
      </div>
    );
  };

  const goToPrevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const goToToday = () => setCurrentDate(dayjs());

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>📅 Planning & Calendrier</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
          Ajouter un événement
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Total événements" value={stats.total_events} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="Terminés" value={stats.termines} valueStyle={{ color: '#52C41A' }} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="En cours" value={stats.en_cours} valueStyle={{ color: '#1890FF' }} prefix={<ClockCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="En retard" value={stats.en_retard} valueStyle={{ color: stats.en_retard > 0 ? '#ff4d4f' : '#52C41A' }} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* Calendrier */}
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Space>
                <Button onClick={goToPrevMonth}>←</Button>
                <Title level={4} style={{ margin: 0 }}>
                  {MONTHS[currentDate.month()]} {currentDate.year()}
                </Title>
                <Button onClick={goToNextMonth}>→</Button>
              </Space>
              <Button onClick={goToToday}>Aujourd'hui</Button>
            </div>
            
            <Calendar
              value={currentDate}
              onSelect={(date) => setSelectedDate(date.format('YYYY-MM-DD'))}
              cellRender={(date, info) => {
                if (info.type === 'date') return dateCellRender(date);
                return null;
              }}
              style={{ border: 'none' }}
            />
          </Card>
        </Col>

        {/* Événements à venir */}
        <Col xs={24} lg={8}>
          <Card title="📆 À venir (14 jours)">
            <List
              dataSource={upcomingEvents}
              renderItem={(event) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 24 }}>{EVENT_TYPE_CONFIG[event.type]?.icon}</span>}
                    title={
                      <Space>
                        <Text strong>{event.title}</Text>
                        <Tag color={PRIORITY_CONFIG[event.priority]?.color}>{PRIORITY_CONFIG[event.priority]?.label}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">
                          📅 {new Date(event.start_date).toLocaleDateString('fr-FR')}
                        </Text>
                        {event.description && <Text style={{ fontSize: 12 }}>{event.description}</Text>}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'Aucun événement à venir' }}
            />
          </Card>

          {/* Légende */}
          <Card title="🎨 Légende" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(EVENT_TYPE_CONFIG).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge color={val.color} />
                  <span>{val.icon} {val.label}</span>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal ajout événement */}
      <Modal
        title="➕ Ajouter un événement"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddEvent} layout="vertical">
          <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
            <Input placeholder="Ex: Semis haricots" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner">
                  {Object.entries(EVENT_TYPE_CONFIG).map(([key, val]) => (
                    <Select.Option key={key} value={key}>{val.icon} {val.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priorité" rules={[{ required: true }]}>
                <Select placeholder="Sélectionner">
                  {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                    <Select.Option key={key} value={key}>{val.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Ajouter l'événement
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}