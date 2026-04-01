'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { Title, Text } = Typography;

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
        message.success('Compte cree ! Connectez-vous maintenant.');
        setIsSignup(false);
      } else {
        const { error } = await signIn(values.email, values.password);
        if (error) throw error;
        message.success('Connexion reussie !');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      message.error(err?.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    // Mode demo - connexion sans Supabase
    message.info('Mode demo active');
    router.push('/dashboard');
  };

  // Verifier si Supabase est configure
  const isSupabaseConfigured = supabase !== null;

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
          maxWidth: 440, 
          borderRadius: 20, 
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
            boxShadow: '0 8px 24px rgba(82, 196, 26, 0.4)',
          }}>
            🌿
          </div>
          <Title level={3} style={{ margin: 0, color: '#1A3320', fontWeight: 700 }}>
            Ferme Circulaire
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {isSignup ? 'Creer un compte' : 'Connexion a votre espace'}
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
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Entrez votre mot de passe' },
              { min: 6, message: 'Minimum 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#8A8A8A' }} />} 
              placeholder="Mot de passe" 
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              style={{ 
                height: 48, 
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2D7D32, #52C41A)',
                border: 'none',
              }}
            >
              {isSignup ? 'Creer le compte' : 'Se connecter'}
            </Button>
          </Form.Item>
        </Form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space>
            <Text type="secondary">
              {isSignup ? 'Deja un compte ?' : 'Pas de compte ?'}
            </Text>
            <Button 
              type="link" 
              onClick={() => setIsSignup(!isSignup)}
              style={{ padding: 0, color: '#2D7D32' }}
            >
              {isSignup ? 'Se connecter' : 'Creer un compte'}
            </Button>
          </Space>
        </div>

        {/* Demo mode - si Supabase non configure */}
        {!isSupabaseConfigured && (
          <>
            <Divider>
              <Text type="secondary" style={{ fontSize: 12 }}>OU</Text>
            </Divider>
            <Button 
              block 
              icon={<HomeOutlined />}
              onClick={handleDemoLogin}
              style={{ 
                height: 44, 
                borderRadius: 10,
                borderColor: '#2D7D32',
                color: '#2D7D32',
              }}
            >
              Mode Demonstration
            </Button>
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: '#FFF8E1', 
              borderRadius: 10,
              textAlign: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                🔧 Base de donnees non connectee. Utilisez le mode demo pour tester.
              </Text>
            </div>
          </>
        )}

        {/* Info si configure */}
        {isSupabaseConfigured && (
          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            background: '#F6FFED', 
            borderRadius: 10,
            textAlign: 'center',
            border: '1px solid #D9F7BE',
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              🔐 Connexion securisee via Supabase
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}