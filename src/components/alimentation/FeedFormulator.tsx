'use client';

import { 
  Card, 
  Form, 
  Select, 
  Button, 
  Table, 
  Typography, 
  Alert,
  Space,
  Progress,
  Divider
} from 'antd';
import { 
  CalculatorOutlined, 
  SaveOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { useState, useMemo } from 'react';

const { Title, Text } = Typography;

interface Ingredient {
  nom: string;
  proteines: number; // %
  energie: number; // kcal/kg
  cout: number; // FCFA/kg
  maxPourcentage: number;
}

interface FormuleResult {
  ingredient: string;
  pourcentage: number;
  quantite: number; // kg pour 100kg
  cout: number;
}

const INGREDIENTS_LOCAUX: Ingredient[] = [
  { nom: 'Maïs local', proteines: 9, energie: 3400, cout: 250, maxPourcentage: 60 },
  { nom: 'Tourteau soja', proteines: 44, energie: 2400, cout: 450, maxPourcentage: 25 },
  { nom: 'Tourteau arachide', proteines: 48, energie: 2500, cout: 400, maxPourcentage: 25 },
  { nom: 'Tourteau coton', proteines: 41, energie: 2200, cout: 300, maxPourcentage: 20 },
  { nom: 'Son de riz', proteines: 12, energie: 2800, cout: 150, maxPourcentage: 20 },
  { nom: 'Son de blé', proteines: 15, energie: 2600, cout: 180, maxPourcentage: 20 },
  { nom: 'BSF séchées', proteines: 60, energie: 2100, cout: 800, maxPourcentage: 15 },
  { nom: 'Farine poisson', proteines: 65, energie: 2300, cout: 1200, maxPourcentage: 10 },
  { nom: 'Prémélange vitamines', proteines: 0, energie: 0, cout: 2000, maxPourcentage: 2 },
  { nom: 'Calcaire', proteines: 0, energie: 0, cout: 100, maxPourcentage: 2 },
];

interface FeedFormulatorProps {
  especeCible: 'poulet_chair' | 'poules_pondeuses' | 'ruminants';
  stade?: 'demarrage' | 'croissance' | 'finition';
}

export const FeedFormulator: React.FC<FeedFormulatorProps> = ({
  especeCible,
  stade = 'croissance',
}) => {
  const [form] = Form.useForm();
  const [formule, setFormule] = useState<FormuleResult[]>([]);
  const [coutTotal, setCoutTotal] = useState(0);

  // Besoins nutritionnels par espèce/stade
  const besoinsNutritionnels = useMemo(() => {
    const besoins = {
      poulet_chair: {
        demarrage: { proteines: 22, energie: 3000 },
        croissance: { proteines: 20, energie: 2900 },
        finition: { proteines: 18, energie: 2800 },
      },
      poules_pondeuses: {
        demarrage: { proteines: 18, energie: 2800 },
        croissance: { proteines: 16, energie: 2700 },
        finition: { proteines: 16, energie: 2700 },
      },
      ruminants: {
        demarrage: { proteines: 16, energie: 2400 },
        croissance: { proteines: 14, energie: 2200 },
        finition: { proteines: 12, energie: 2000 },
      },
    };
    return besoins[especeCible][stade];
  }, [especeCible, stade]);

  // Algorithme simple d'optimisation (à améliorer avec un vrai solver)
  const calculerFormule = () => {
    const values = form.getFieldsValue();
    const selectedIngredients = values.ingredients || [];
    
    // Calcul simplifié - répartition égale
    const pourcentageBase = 100 / selectedIngredients.length;
    const nouvelleFormule: FormuleResult[] = selectedIngredients.map((ingNom: string) => {
      const ing = INGREDIENTS_LOCAUX.find(i => i.nom === ingNom)!;
      const quantite = (pourcentageBase / 100) * 100; // pour 100kg
      const cout = quantite * ing.cout;
      
      return {
        ingredient: ing.nom,
        pourcentage: pourcentageBase,
        quantite: Math.round(quantite * 100) / 100,
        cout: Math.round(cout),
      };
    });

    const total = nouvelleFormule.reduce((sum, item) => sum + item.cout, 0);
    
    setFormule(nouvelleFormule);
    setCoutTotal(total);
  };

  // Calculer la valeur nutritionnelle totale
  const valeurNutritionnelle = useMemo(() => {
    if (formule.length === 0) return { proteines: 0, energie: 0 };
    
    const proteines = formule.reduce((sum, item) => {
      const ing = INGREDIENTS_LOCAUX.find(i => i.nom === item.ingredient)!;
      return sum + (ing.proteines * item.pourcentage / 100);
    }, 0);
    
    const energie = formule.reduce((sum, item) => {
      const ing = INGREDIENTS_LOCAUX.find(i => i.nom === item.ingredient)!;
      return sum + (ing.energie * item.pourcentage / 100);
    }, 0);
    
    return { 
      proteines: Math.round(proteines * 10) / 10, 
      energie: Math.round(energie) 
    };
  }, [formule]);

  const columns = [
    {
      title: 'Ingrédient',
      dataIndex: 'ingredient',
      key: 'ingredient',
    },
    {
      title: '%',
      dataIndex: 'pourcentage',
      key: 'pourcentage',
      render: (val: number) => `${val.toFixed(1)}%`,
    },
    {
      title: 'Quantité (kg)',
      dataIndex: 'quantite',
      key: 'quantite',
    },
    {
      title: 'Coût (FCFA)',
      dataIndex: 'cout',
      key: 'cout',
      render: (val: number) => new Intl.NumberFormat('fr-FR').format(val),
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <CalculatorOutlined />
          Formulateur d'Aliment - {especeCible} ({stade})
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={() => {/* Sauvegarder formule */}}
        >
          Sauvegarder
        </Button>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Objectifs nutritionnels */}
        <Alert
          message="Objectifs Nutritionnels"
          description={
            <Space direction="vertical">
              <Text>
                <strong>Protéines brutes:</strong> {besoinsNutritionnels.proteines}%
              </Text>
              <Text>
                <strong>Énergie métabolisable:</strong> {besoinsNutritionnels.energie} kcal/kg
              </Text>
            </Space>
          }
          type="info"
          showIcon
        />

        {/* Sélection ingrédients */}
        <Form form={form} layout="vertical">
          <Form.Item 
            name="ingredients" 
            label="Sélectionner les ingrédients disponibles"
            rules={[{ required: true, message: 'Sélectionnez au moins 3 ingrédients' }]}
          >
            <Select
              mode="multiple"
              placeholder="Choisissez vos ingrédients locaux"
              style={{ width: '100%' }}
              maxTagCount="responsive"
            >
              {INGREDIENTS_LOCAUX.map(ing => (
                <Select.Option key={ing.nom} value={ing.nom}>
                  {ing.nom} - {ing.proteines}% protéines - {ing.cout} FCFA/kg
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />}
              onClick={calculerFormule}
              size="large"
            >
              Calculer la Formule Optimale
            </Button>
          </Form.Item>
        </Form>

        {/* Résultats */}
        {formule.length > 0 && (
          <>
            <Divider />
            
            <Title level={5}>Composition pour 100 kg</Title>
            <Table 
              columns={columns} 
              dataSource={formule} 
              rowKey="ingredient"
              pagination={false}
              footer={() => (
                <div style={{ fontWeight: 'bold' }}>
                  Coût total: {new Intl.NumberFormat('fr-FR').format(coutTotal)} FCFA
                  <br />
                  <Text type="secondary">
                    Soit {new Intl.NumberFormat('fr-FR').format(coutTotal / 100)} FCFA/kg
                  </Text>
                </div>
              )}
            />

            {/* Analyse nutritionnelle */}
            <Card size="small" title="Valeur Nutritionnelle Obtenue">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Protéines: {valeurNutritionnelle.proteines}%</Text>
                  <Progress
                    percent={(valeurNutritionnelle.proteines / besoinsNutritionnels.proteines) * 100}
                    strokeColor={
                      valeurNutritionnelle.proteines >= besoinsNutritionnels.proteines * 0.95
                        ? '#52C41A'
                        : '#FA8C16'
                    }
                    format={() => 
                      valeurNutritionnelle.proteines >= besoinsNutritionnels.proteines * 0.95
                        ? '✓ Objectif atteint'
                        : '⚠ En dessous'
                    }
                  />
                </div>
                
                <div>
                  <Text>Énergie: {valeurNutritionnelle.energie} kcal/kg</Text>
                  <Progress
                    percent={(valeurNutritionnelle.energie / besoinsNutritionnels.energie) * 100}
                    strokeColor={
                      valeurNutritionnelle.energie >= besoinsNutritionnels.energie * 0.95
                        ? '#52C41A'
                        : '#FA8C16'
                    }
                  />
                </div>
              </Space>
            </Card>

            {/* Comparaison avec provende industrielle */}
            <Alert
              message="Économie Réalisée"
              description={
                <Text>
                  Provende industrielle: ~450 FCFA/kg
                  <br />
                  Votre formule: {new Intl.NumberFormat('fr-FR').format(coutTotal / 100)} FCFA/kg
                  <br />
                  <strong style={{ color: '#52C41A' }}>
                    Économie: {450 - (coutTotal / 100)} FCFA/kg 
                    ({Math.round((1 - coutTotal / 100 / 450) * 100)}%)
                  </strong>
                </Text>
              }
              type="success"
              showIcon
            />
          </>
        )}
      </Space>
    </Card>
  );
};
