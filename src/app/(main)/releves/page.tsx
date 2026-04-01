// =============================================
// PAGE RELEVÉS - Saisie manuelle + Historique
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, Tabs, Space, Select, Button, List, Tag, Typography, Form, InputNumber, Input, message, Switch, Alert } from 'antd';
import { ReloadOutlined, SaveOutlined, CloudOutlined, EditOutlined } from '@ant-design/icons';
import { STATION_CONFIGS, type IoTStation, type UnifiedReading } from '../../../types/iot';
import { useSimulatedIoT } from '../../../hooks/useSimulatedIoT';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function RelevesPage() {
  const [activeStation, setActiveStation] = useState<IoTStation>('poulailler');
  const [readings, setReadings] = useState<UnifiedReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  
  // Simulation IoT
  useSimulatedIoT({
    station: activeStation,
    enabled: simulationEnabled,
    intervalMs: 15000,
    onNewReading: (reading) => {
      setReadings(prev => [...prev.slice(-19), { ...reading, source: 'iot' }]);
    },
  });

  const stations: IoTStation[] = ['poulailler', 'cultures', 'biogaz', 'compost'];

  // Charger les données simulées (en attendant Supabase)
  const loadReadings = () => {
    setLoading(true);
    setTimeout(() => {
      // Générer quelques données de demo
      const demoReadings: UnifiedReading[] = Array.from({ length: 10 }, (_, i) => {
        const baseDate = new Date(Date.now() - i * 3600000);
        return {
          id: `demo-${i}`,
          station: activeStation,
          temperature: 28 + Math.random() * 5,
          humidite: 50 + Math.random() * 20,
          created_at: baseDate.toISOString(),
          updated_at: baseDate.toISOString(),
          source: 'manual',
        };
      });
      setReadings(demoReadings);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadReadings();
  }, [activeStation]);

  // Sauvegarder une saisie manuelle
  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const newReading: UnifiedReading = {
        id: `manual-${Date.now()}`,
        station: activeStation,
        temperature: values.temperature,
        humidite: values.humidite,
        humidite_sol: values.humidite_sol,
        ph_sol: values.ph_sol,
        niveau_biogaz: values.niveau_biogaz,
        methane_level: values.methane_level,
        observation: values.observation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: 'manual',
      };
      
      setReadings(prev => [newReading, ...prev]);
      form.resetFields();
      message.success('✅ Donnée enregistrée !');
    } catch (error) {
      message.error('❌ Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const config = STATION_CONFIGS[activeStation];

  const getSourceTag = (source: 'iot' | 'manual') => {
    return source === 'iot' 
      ? <Tag color="green">📡 IoT</Tag>
      : <Tag color="blue">✍️ Manuel</Tag>;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '0 16px' }}>
      <div>
        <Title level={2}>📝 Relevés de Terrain</Title>
        <Text type="secondary">
          Saisissez manuellement les données de vos stations ou activez la simulation IoT pour tester.
        </Text>
      </div>

      {/* Toggle Simulation */}
      <Card size="small">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <CloudOutlined />
            <Text>Mode Simulation (données automatiques)</Text>
          </Space>
          <Switch 
            checked={simulationEnabled} 
            onChange={(checked) => {
              setSimulationEnabled(checked);
              message.info(checked ? '🎮 Simulation activée' : '📝 Mode manuel');
            }}
          />
        </Space>
        {simulationEnabled && (
          <Alert 
            message="🎮 Données simulées actives - nouvelles données toutes les 15 secondes" 
            type="info" 
            showIcon 
            style={{ marginTop: 8 }}
          />
        )}
      </Card>

      {/* Sélecteur station + filtres */}
      <Card size="small">
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select
            value={activeStation}
            onChange={(v) => setActiveStation(v)}
            style={{ width: 200 }}
            options={stations.map(s => ({ 
              value: s, 
              label: `${STATION_CONFIGS[s].icon} ${STATION_CONFIGS[s].label}` 
            }))}
          />
          <Button icon={<ReloadOutlined />} onClick={loadReadings} loading={loading}>
            Actualiser
          </Button>
        </Space>
      </Card>

      {/* Formulaire de saisie */}
      <Card title={`${config.icon} ${config.label} - Saisie Manuelle`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Champs selon station */}
            {activeStation === 'poulailler' && (
              <Space style={{ width: '100%' }} wrap>
                <Form.Item name="temperature" label="Température (°C)" rules={[{ required: true }]}>
                  <InputNumber min={15} max={45} style={{ width: 120 }} placeholder="28" />
                </Form.Item>
                <Form.Item name="humidite" label="Humidité (%)" rules={[{ required: true }]}>
                  <InputNumber min={0} max={100} style={{ width: 120 }} placeholder="65" />
                </Form.Item>
                <Form.Item name="qualite_air" label="Qualité air">
                  <InputNumber min={0} max={1000} style={{ width: 120 }} placeholder="Optionnel" />
                </Form.Item>
              </Space>
            )}
            
            {activeStation === 'cultures' && (
              <Space style={{ width: '100%' }} wrap>
                <Form.Item name="temperature" label="Température air (°C)">
                  <InputNumber min={10} max={45} style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="humidite_sol" label="Humidité sol (%)" rules={[{ required: true }]}>
                  <InputNumber min={0} max={100} style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="ph_sol" label="pH du sol">
                  <InputNumber min={4} max={9} step={0.1} style={{ width: 100 }} />
                </Form.Item>
              </Space>
            )}
            
            {activeStation === 'biogaz' && (
              <Space style={{ width: '100%' }} wrap>
                <Form.Item name="temperature" label="Température (°C)" rules={[{ required: true }]}>
                  <InputNumber min={20} max={50} style={{ width: 120 }} placeholder="35" />
                </Form.Item>
                <Form.Item name="niveau_biogaz" label="Niveau gaz (%)">
                  <InputNumber min={0} max={100} style={{ width: 120 }} />
                </Form.Item>
                <Form.Item name="methane_level" label="Méthane (ppm)">
                  <InputNumber min={0} max={5000} style={{ width: 120 }} />
                </Form.Item>
              </Space>
            )}
            
            {activeStation === 'compost' && (
              <Space style={{ width: '100%' }} wrap>
                <Form.Item name="temperature" label="Température tas (°C)" rules={[{ required: true }]}>
                  <InputNumber min={20} max={80} style={{ width: 120 }} placeholder="55" />
                </Form.Item>
                <Form.Item name="humidite" label="Humidité (%)">
                  <InputNumber min={0} max={100} style={{ width: 120 }} />
                </Form.Item>
              </Space>
            )}

            {/* Observation commune */}
            <Form.Item name="observation" label="Observation">
              <TextArea 
                rows={2} 
                placeholder="Comportement, odeur, remarques..." 
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<SaveOutlined />}
              block
            >
              Enregistrer cette mesure
            </Button>
          </Space>
        </Form>
      </Card>

      {/* Historique des relevés */}
      <Card 
        title="📋 Historique des Relevés" 
        extra={
          <Tag color="blue">{readings.length} enregistrements</Tag>
        }
      >
        <List
          loading={loading}
          dataSource={readings.slice(0, 15)}
          renderItem={(item) => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text strong>
                    {item.temperature && `🌡️ ${item.temperature.toFixed(1)}°C`}
                    {item.humidite && ` 💧 ${item.humidite.toFixed(0)}%`}
                    {item.humidite_sol && ` 🌱 Sol: ${item.humidite_sol.toFixed(0)}%`}
                  </Text>
                  <Space>
                    {getSourceTag(item.source)}
                  </Space>
                </Space>
                {item.observation && (
                  <Text type="secondary">📝 {item.observation}</Text>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(item.created_at).toLocaleString('fr-FR')}
                </Text>
              </Space>
            </List.Item>
          )}
          locale={{ emptyText: 'Aucun relevé pour cette station' }}
        />
      </Card>
    </Space>
  );
}