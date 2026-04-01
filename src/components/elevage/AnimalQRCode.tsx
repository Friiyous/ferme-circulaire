// =============================================
// COMPOSANT QR CODE - Pour les animaux
// =============================================

'use client';

import { useState, useRef } from 'react';
import { Button, Modal, message, Space, Typography, Card, Tag } from 'antd';
import { QRCode } from 'antd';
import { QrcodeOutlined, DownloadOutlined, ShareAltOutlined } from '@ant-design/icons';
import type { Animal } from '../../types';

const { Text, Title } = Typography;

interface AnimalQRCodeProps {
  animal: Animal;
  baseUrl?: string;
}

export const AnimalQRCode: React.FC<AnimalQRCodeProps> = ({
  animal,
  baseUrl = 'http://localhost:3000',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // URL profonde vers la fiche animal
  const animalUrl = `${baseUrl}/elevage?animal=${animal.id}`;

  // Télécharger le QR code en PNG
  const downloadQR = async () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      
      // Convertir SVG en canvas puis en PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx?.drawImage(img, 0, 0, 256, 256);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qr-${animal.id}.png`;
        link.href = pngUrl;
        link.click();
        
        URL.revokeObjectURL(url);
        message.success('✅ QR Code téléchargé');
      };
      
      img.src = url;
    } catch (error) {
      message.error('❌ Échec téléchargement');
    }
  };

  // Partager (mobile)
  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fiche: ${animal.id}`,
          text: `Animal ${animal.espece} - ${animal.race || 'Race locale'}`,
          url: animalUrl,
        });
      } catch (error) {
        // Fallback: copier lien
        navigator.clipboard.writeText(animalUrl);
        message.success('🔗 Lien copié !');
      }
    } else {
      navigator.clipboard.writeText(animalUrl);
      message.success('🔗 Lien copié dans le presse-papiers');
    }
  };

  const getEmoji = (espece: string) => {
    switch (espece?.toLowerCase()) {
      case 'bovin': return '🐄';
      case 'poule': return '🐔';
      case 'coq': return '🐓';
      case 'chevre': return '🐐';
      case 'mouton': return '🐑';
      case 'porc': return '🐖';
      case 'lapin': return '🐰';
      default: return '🐾';
    }
  };

  return (
    <>
      <Button
        icon={<QrcodeOutlined />}
        onClick={() => setModalVisible(true)}
        size="small"
        type="text"
      >
        QR
      </Button>

      <Modal
        title={
          <Space>
            <span>{getEmoji(animal.espece)}</span>
            <span>QR Code - {animal.id}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={350}
        centered
      >
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          {/* Zone QR pour capture */}
          <div 
            ref={qrRef} 
            style={{ 
              padding: 20, 
              background: '#fff', 
              borderRadius: 12,
              border: '1px solid #f0f0f0'
            }}
          >
            <QRCode
              value={animalUrl}
              size={200}
              bgColor="#ffffff"
              color="#000000"
              level="H"
            />
          </div>

          <Text strong style={{ marginTop: 8 }}>
            {animal.espece} {animal.race ? `• ${animal.race}` : ''}
          </Text>
          
          <Tag color="blue">{animal.statut || 'actif'}</Tag>

          {/* Actions */}
          <Space style={{ marginTop: 16 }}>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={downloadQR}
              size="small"
            >
              Télécharger
            </Button>
            <Button 
              icon={<ShareAltOutlined />} 
              onClick={shareQR}
              size="small"
            >
              Partager
            </Button>
          </Space>

          {/* Instructions impression */}
          <Card 
            size="small" 
            style={{ 
              marginTop: 16, 
              background: '#f5f5f5', 
              width: '100%'
            }}
          >
            <Text style={{ fontSize: 12 }}>
              <strong>💡 Conseil:</strong> Imprimer en 4x4 cm minimum, 
              plastifier pour durabilité, fixer sur collier ou piquet.
            </Text>
          </Card>
        </Space>
      </Modal>
    </>
  );
};

export default AnimalQRCode;