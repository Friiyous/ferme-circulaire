'use client';

import { Card, Row, Col, Statistic, Space, DatePicker, Typography, Table, Tag, message } from 'antd';
import { Line, Bar, Pie } from '@ant-design/charts';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DollarOutlined,
  BankOutlined,
  PlusOutlined,
  MinusOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { Transaction } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface FinancialReportProps {
  transactions: Transaction[];
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ transactions }) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Filtrage par date
  const filteredTransactions = dateRange 
    ? transactions.filter(t => {
        const date = dayjs(t.date);
        return date.isAfter(dateRange[0]) && date.isBefore(dateRange[1]);
      })
    : transactions;

  // KPIs
  const totalRevenus = filteredTransactions
    .filter(t => t.type === 'revenu')
    .reduce((sum, t) => sum + t.montant, 0);

  const totalDepenses = filteredTransactions
    .filter(t => t.type === 'depense')
    .reduce((sum, t) => sum + t.montant, 0);

  const benefice = totalRevenus - totalDepenses;
  const margeCout = totalRevenus > 0 ? (benefice / totalRevenus) * 100 : 0;

  // Données pour graphique: Évolution revenus/dépenses
  const evolutionData = filteredTransactions.reduce((acc: any[], t) => {
    const mois = dayjs(t.date).format('MMM YYYY');
    const existingMois = acc.find(item => item.mois === mois && item.type === t.type);
    
    if (existingMois) {
      existingMois.montant += t.montant;
    } else {
      acc.push({ mois, type: t.type, montant: t.montant });
    }
    return acc;
  }, []).sort((a, b) => dayjs(a.mois, 'MMM YYYY').valueOf() - dayjs(b.mois, 'MMM YYYY').valueOf());

  // Configuration graphique ligne
  const lineConfig = {
    data: evolutionData,
    xField: 'mois',
    yField: 'montant',
    seriesField: 'type',
    color: ['#52C41A', '#FF4D4F'], // Vert pour revenus, rouge pour dépenses
    smooth: true,
    yAxis: {
      label: {
        formatter: (v: string) => `${(Number(v) / 1000)}k`,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: datum.type === 'revenu' ? 'Revenu' : 'Dépense', value: new Intl.NumberFormat('fr-FR').format(datum.montant) + ' FCFA' };
      },
    },
  };

  // Données pour répartition par module (Pie chart)
  const repatitionRevenusData = filteredTransactions
    .filter(t => t.type === 'revenu')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.module === t.module);
      if (existing) {
        existing.valeur += t.montant;
      } else {
        acc.push({ module: t.module, valeur: t.montant });
      }
      return acc;
    }, []);

  const pieConfig = {
    appendPadding: 10,
    data: repatitionRevenusData,
    angleField: 'valeur',
    colorField: 'module',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Filtres */}
      <Card>
        <Space>
          <Text strong>Période d'analyse :</Text>
          <RangePicker 
            onChange={(dates) => setDateRange(dates as any)} 
            format="DD/MM/YYYY"
          />
        </Space>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Revenus Totaux"
              value={totalRevenus}
              precision={0}
              valueStyle={{ color: '#52C41A' }}
              prefix={<ArrowUpOutlined />}
              suffix="FCFA"
              formatter={(val) => new Intl.NumberFormat('fr-FR').format(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Dépenses Totales"
              value={totalDepenses}
              precision={0}
              valueStyle={{ color: '#FF4D4F' }}
              prefix={<ArrowDownOutlined />}
              suffix="FCFA"
              formatter={(val) => new Intl.NumberFormat('fr-FR').format(val as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ backgroundColor: benefice >= 0 ? '#f6ffed' : '#fff2f0' }}>
            <Statistic
              title="Bénéfice Net"
              value={Math.abs(benefice)}
              precision={0}
              valueStyle={{ color: benefice >= 0 ? '#52C41A' : '#FF4D4F', fontWeight: 'bold' }}
              prefix={benefice >= 0 ? <PlusOutlined /> : <MinusOutlined />}
              suffix="FCFA"
              formatter={(val) => new Intl.NumberFormat('fr-FR').format(val as number)}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Marge: <strong style={{ color: margeCout >= 20 ? '#52C41A' : '#FA8C16' }}>{margeCout.toFixed(1)}%</strong>
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Graphiques */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Évolution Trésorerie (Revenus vs Dépenses)">
            <div style={{ height: 300 }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Répartition des Revenus par Module">
            <div style={{ height: 300 }}>
              {repatitionRevenusData.length > 0 ? (
                <Pie {...pieConfig as any} />
              ) : (
                <div style={{ textAlign: 'center', paddingTop: 100, color: '#999' }}>Aucune donnée disponible</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Dépenses */}
      <Card title="Principaux Postes de Dépense">
        <Table 
          columns={[
            { title: 'Catégorie / Motif', dataIndex: 'description', key: 'description' },
            { title: 'Module', dataIndex: 'module', key: 'module', render: (t: string) => <Tag>{t}</Tag> },
            { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
            { 
              title: 'Montant', 
              dataIndex: 'montant', 
              key: 'montant',
              align: 'right',
              render: (v: number) => <Text type="danger">-{new Intl.NumberFormat('fr-FR').format(v)} FCFA</Text>
            }
          ]}
          dataSource={filteredTransactions.filter(t => t.type === 'depense').sort((a,b) => b.montant - a.montant).slice(0, 5)}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};
