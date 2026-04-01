'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(values.email, values.password);
        if (error) throw error;
        message.success('Compte créé ! Connectez-vous maintenant.');
        setIsSignup(false);
      } else {
        const { error } = await signIn(values.email, values.password);
        if (error) throw error;
        message.success('Connexion réussie !');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A3320 0%, #2D7D32 100%)',
      padding: 20,
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 420, 
          borderRadius: 16, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)' 
        }}
        bodyStyle={{ padding: 40 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #52C41A, #2D7D32)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            marginBottom: 16,
          }}>
            🌿
          </div>
          <Title level={3} style={{ margin: 0, color: '#1A3320' }}>
            Ferme Circulaire
          </Title>
          <Text type="secondary">
            {isSignup ? 'Créer un compte' : 'Connexion à votre espace'}
          </Text>
        </div>

        {/* Form */}
        <Form
          name="auth"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Entrez votre email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: '#8A8A8A' }} />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Entrez votre mot de passe' },
              { min: 6, message: 'Minimum 6 caractères' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#8A8A8A' }} />} 
              placeholder="Mot de passe" 
            />
          </Form.Item>

          {!isSignup && (
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Se souvenir de moi</Checkbox>
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{ 
                height: 48, 
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {isSignup ? 'Créer le compte' : 'Se connecter'}
            </Button>
          </Form.Item>
        </Form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space>
            <Text type="secondary">
              {isSignup ? 'Déjà un compte ?' : 'Pas de compte ?'}
            </Text>
            <Button 
              type="link" 
              onClick={() => setIsSignup(!isSignup)}
              style={{ padding: 0 }}
            >
              {isSignup ? 'Se connecter' : 'Créer un compte'}
            </Button>
          </Space>
        </div>

        {/* Demo hint */}
        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: '#F0F5F0', 
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 Pour tester, vous pouvez créer un compte avec votre email
          </Text>
        </div>
      </Card>
    </div>
  );
}