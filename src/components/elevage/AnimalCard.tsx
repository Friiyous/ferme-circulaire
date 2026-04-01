'use client';

import { Card, Tag, Progress, Space, Button, Modal, Typography } from 'antd';
import { 
  HeartOutlined, 
  DashboardOutlined, 
  CalendarOutlined,
  MedicineBoxOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import type { Animal, Vaccination } from '@/types';
import { QRCode } from 'antd';
import { useState } from 'react';

const { Text, Paragraph } = Typography;

interface AnimalCardProps {
  animal: Animal;
  onEdit?: (animal: Animal) => void;
  onHealthRecord?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  onEdit,
  onHealthRecord,
}) => {
  const [qrVisible, setQrVisible] = useState(false);

  const getEspeceColor = (espece: string) => {
    const colors: Record<string, string> = {
      poule: 'orange',
      canard: 'blue',
      chevre: 'green',
      mouton: 'purple',
      bovin: 'cyan',
    };
    return colors[espece] || 'default';
  };

  const getStatutBadge = (statut: Animal['statut']) => {
    const badges = {
      actif: { color: 'success', text: 'Actif ✓' },
      malade: { color: 'error', text: 'Malade ⚠' },
      vendu: { color: 'default', text: 'Vendu' },
      mort: { color: 'error', text: 'Décédé' },
    };
    return badges[statut];
  };

  const calculerAge = (dateNaissance: Date | string) => {
    const today = new Date();
    const birth = new Date(dateNaissance);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} jours`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`;
    return `${Math.floor(diffDays / 365)} ans`;
  };

  const prochaineVaccination = (animal.vaccinations ?? [])
    .filter(v => new Date(v.prochaineDate) > new Date())
    .sort((a, b) => new Date(a.prochaineDate).getTime() - new Date(b.prochaineDate).getTime())[0];

  return (
    <>
      <Card
        hoverable
        style={{
          borderRadius: 12,
          marginBottom: 16,
          borderLeft: `4px solid ${animal.statut === 'actif' ? '#52C41A' : '#FF4D4F'}`,
        }}
        actions={[
          <Button 
            key="edit" 
            type="text" 
            icon={<HeartOutlined />}
            onClick={() => onEdit?.(animal)}
          >
            Modifier
          </Button>,
          <Button 
            key="health" 
            type="text" 
            icon={<MedicineBoxOutlined />}
            onClick={() => onHealthRecord?.(animal)}
          >
            Santé
          </Button>,
          <Button 
            key="qr" 
            type="text" 
            icon={<QrcodeOutlined />}
            onClick={() => setQrVisible(true)}
          >
            QR Code
          </Button>,
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* En-tête */}
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Tag color={getEspeceColor(animal.espece)} style={{ fontSize: 14 }}>
              {animal.espece.toUpperCase()}
            </Tag>
            <Tag color={getStatutBadge(animal.statut).color}>
              {getStatutBadge(animal.statut).text}
            </Tag>
          </Space>

          {/* ID Animal */}
          <Paragraph 
            copyable 
            style={{ fontSize: 18, fontWeight: 'bold', margin: '0' }}
          >
            ID: {animal.id}
          </Paragraph>

          {/* Détails */}
          <Space direction="vertical" size="small">
            <Space>
              <CalendarOutlined style={{ color: '#1890FF' }} />
              <Text>
                {calculerAge(animal.dateNaissance)} - {animal.sexe}
              </Text>
            </Space>

            <Space>
              <DashboardOutlined style={{ color: '#52C41A' }} />
              <Text>{animal.poids} kg</Text>
            </Space>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Race: {animal.race}
            </Text>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Localisation: {animal.localisation}
            </Text>
          </Space>

          {/* Prochaine vaccination */}
          {prochaineVaccination && (
            <div 
              style={{
                padding: '8px 12px',
                backgroundColor: '#FFF7E6',
                borderRadius: 6,
                borderLeft: '3px solid #FA8C16',
              }}
            >
              <Text strong style={{ color: '#FA8C16' }}>
                <MedicineBoxOutlined /> Prochain vaccin:
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text>{prochaineVaccination.type}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(prochaineVaccination.prochaineDate).toLocaleDateString('fr-FR')}
                </Text>
              </div>
            </div>
          )}

          {/* Production */}
          {animal.productions && animal.productions.length > 0 && (
            <div>
              <Text strong>Production récente:</Text>
              <Progress
                percent={animal.productions.length * 10}
                strokeColor="#52C41A"
                format={() => `${animal.productions!.length} unités`}
                style={{ marginTop: 8 }}
              />
            </div>
          )}
        </Space>
      </Card>

      {/* Modal QR Code */}
      <Modal
        title={`QR Code - ${animal.id}`}
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          {typeof window !== 'undefined' ? (
            <QRCode
              value={`${window.location.origin}/animaux/${animal.id}`}
              size={256}
              bgColor="#ffffff"
              color="#000000"
              level="H"
              icon={animal.espece === 'bovin' ? '🐄' : animal.espece === 'poule' ? '🐔' : '🐐'}
            />
          ) : null}
          <Text style={{ marginTop: 16, display: 'block' }}>
            Scannez pour voir la fiche complète
          </Text>
        </div>
      </Modal>
    </>
  );
};
