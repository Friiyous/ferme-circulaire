'use client';

import { 
  Card, 
  Calendar, 
  Tag, 
  Select, 
  Typography, 
  Space,
  Badge,
  Alert,
  Tooltip,
  Button
} from 'antd';
import type { CalendarProps } from 'antd';
import { 
  ExperimentOutlined, 
} from '@ant-design/icons';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface Culture {
  nom: string;
  saison: 'pluie' | 'seche' | 'toute';
  duree: number; // jours
  famille: string;
  precedentIdeal?: string[];
  suivantRecommande?: string[];
  destination: 'vente' | 'alimentation_betail' | 'les_deux';
}

const CULTURES_TROPICALES: Culture[] = [
  {
    nom: 'Maïs',
    saison: 'pluie',
    duree: 90,
    famille: 'Poaceae',
    suivantRecommande: ['Niébé', 'Manioc'],
    destination: 'les_deux',
  },
  {
    nom: 'Niébé',
    saison: 'pluie',
    duree: 75,
    famille: 'Fabaceae',
    precedentIdeal: ['Maïs'],
    suivantRecommande: ['Maïs', 'Riz'],
    destination: 'les_deux',
  },
  {
    nom: 'Riz',
    saison: 'pluie',
    duree: 120,
    famille: 'Poaceae',
    destination: 'vente',
  },
  {
    nom: 'Manioc',
    saison: 'toute',
    duree: 240,
    famille: 'Euphorbiaceae',
    precedentIdeal: ['Maïs', 'Niébé'],
    destination: 'les_deux',
  },
  {
    nom: 'Mucuna',
    saison: 'pluie',
    duree: 90,
    famille: 'Fabaceae',
    suivantRecommande: ['Maïs', 'Riz'],
    destination: 'alimentation_betail',
  },
  {
    nom: 'Tomate',
    saison: 'seche',
    duree: 90,
    famille: 'Solanaceae',
    destination: 'vente',
  },
  {
    nom: 'Oignon',
    saison: 'seche',
    duree: 120,
    famille: 'Amaryllidaceae',
    destination: 'vente',
  },
];

interface CropRotationPlannerProps {
  parcelleId: string;
  historique?: Array<{ culture: string; dateDebut: Date; dateFin: Date }>;
}

export const CropRotationPlanner: React.FC<CropRotationPlannerProps> = ({
  parcelleId,
  historique = [],
}) => {
  const [selectedCulture, setSelectedCulture] = useState<string | null>(null);
  const [planning, setPlanning] = useState<Array<{ date: Dayjs; culture: Culture }>>([]);

  const cultureData = CULTURES_TROPICALES.find(c => c.nom === selectedCulture);

  // Cellule du calendrier
  const dateCellRender: CalendarProps<Dayjs>['dateCellRender'] = (value) => {
    const event = planning.find(p => p.date.isSame(value, 'day'));
    
    if (event) {
      return (
        <Badge
          count={event.culture.nom}
          style={{
            backgroundColor: getCultureColor(event.culture.famille),
            fontSize: 10,
          }}
        />
      );
    }
    
    return null;
  };

  const getCultureColor = (famille: string) => {
    const colors: Record<string, string> = {
      Poaceae: '#52C41A', // Vert
      Fabaceae: '#1890FF', // Bleu
      Euphorbiaceae: '#FA8C16', // Orange
      Solanaceae: '#FF4D4F', // Rouge
      Amaryllidaceae: '#722ED1', // Violet
    };
    return colors[famille] || '#D9D9D9';
  };

  const ajouterAuPlanning = () => {
    if (!cultureData) return;
    
    const today = dayjs();
    const newPlanning = [];
    
    for (let i = 0; i < cultureData.duree; i++) {
      newPlanning.push({
        date: today.add(i, 'day'),
        culture: cultureData,
      });
    }
    
    setPlanning([...planning, ...newPlanning]);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Sélection culture */}
      <Card title="Planifier une Nouvelle Culture">
        <Space>
          <Select
            placeholder="Sélectionner une culture"
            style={{ width: 300 }}
            onChange={setSelectedCulture}
            value={selectedCulture}
          >
            {CULTURES_TROPICALES.map(c => (
              <Select.Option key={c.nom} value={c.nom}>
                {c.nom} - {c.duree} jours ({c.saison})
              </Select.Option>
            ))}
          </Select>
          
          {cultureData && (
            <Button 
              type="primary" 
              icon={<ExperimentOutlined />}
              onClick={ajouterAuPlanning}
            >
              Ajouter au Planning
            </Button>
          )}
        </Space>

        {cultureData && (
          <Alert
            message="Informations sur la culture"
            description={
              <Space direction="vertical">
                <Text>
                  <strong>Durée:</strong> {cultureData.duree} jours
                </Text>
                <Text>
                  <strong>Saison idéale:</strong> {cultureData.saison}
                </Text>
                <Text>
                  <strong>Famille:</strong> {cultureData.famille}
                </Text>
                {cultureData.precedentIdeal && (
                  <Text>
                    <strong>Précédent idéal:</strong> {cultureData.precedentIdeal.join(', ')}
                  </Text>
                )}
                {cultureData.suivantRecommande && (
                  <Text>
                    <strong>Suivant recommandé:</strong> {cultureData.suivantRecommande.join(', ')}
                  </Text>
                )}
                <Text>
                  <strong>Destination:</strong> {
                    cultureData.destination === 'vente' ? '💰 Vente' :
                    cultureData.destination === 'alimentation_betail' ? '🐄 Aliment bétail' :
                    '🔄 Les deux'
                  }
                </Text>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Recommandations de rotation */}
      {historique.length > 0 && (
        <Card title="Recommandations de Rotation">
          <Alert
            message="Principe de rotation"
            description={
              <Text>
                Alternez les familles botaniques pour préserver la fertilité du sol.
                <br />
                Exemple: Poaceae (maïs) → Fabaceae (niébé) → Poaceae (riz)
              </Text>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space direction="vertical">
            {historique.slice(-3).map((h, index) => (
              <Tag key={index} color="blue">
                {h.culture} ({dayjs(h.dateDebut).format('MMM YYYY')} - {dayjs(h.dateFin).format('MMM YYYY')})
              </Tag>
            ))}
          </Space>

          {historique.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Suivant recommandé:</Text>
              <Space style={{ marginTop: 8 }}>
                {CULTURES_TROPICALES
                  .filter(c => c.famille !== 'Poaceae') // Éviter même famille
                  .slice(0, 3)
                  .map(c => (
                    <Tooltip key={c.nom} title={`${c.duree} jours - ${c.destination}`}>
                      <Tag 
                        color={getCultureColor(c.famille)}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedCulture(c.nom)}
                      >
                        {c.nom}
                      </Tag>
                    </Tooltip>
                  ))}
              </Space>
            </div>
          )}
        </Card>
      )}

      {/* Calendrier */}
      <Card title="Calendrier Cultural">
        <Calendar 
          dateCellRender={dateCellRender}
          style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
        />
      </Card>

      {/* Légende */}
      <Card size="small" title="Légende des Familles">
        <Space>
          <Tag color="#52C41A">Poaceae (Céréales)</Tag>
          <Tag color="#1890FF">Fabaceae (Légumineuses)</Tag>
          <Tag color="#FA8C16">Euphorbiaceae</Tag>
          <Tag color="#FF4D4F">Solanaceae</Tag>
          <Tag color="#722ED1">Amaryllidaceae</Tag>
        </Space>
      </Card>
    </Space>
  );
};
