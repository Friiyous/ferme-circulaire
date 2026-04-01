'use client';
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, message } from 'antd';
import {
  DashboardOutlined, ExperimentOutlined, AppstoreOutlined,
  SyncOutlined, ShoppingCartOutlined, DollarOutlined,
  BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined, SettingOutlined,
  ThunderboltOutlined, TeamOutlined, ToolOutlined, CalendarOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { farmTheme } from '@/lib/theme';
import '../app/globals.css';
import AlertDropdown from './notifications/AlertDropdown';
import { useAuth } from '@/contexts/AuthContext';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord' },
  { key: '/elevage', icon: <ExperimentOutlined />, label: 'Élevage' },
  { key: '/cultures', icon: <AppstoreOutlined />, label: 'Cultures' },
  { key: '/valorisation', icon: <SyncOutlined />, label: 'Valorisation' },
  { key: '/alimentation', icon: <ShoppingCartOutlined />, label: 'Alimentation' },
  { key: '/finances', icon: <DollarOutlined />, label: 'Finances' },
  { key: '/rh', icon: <UserOutlined />, label: 'Ressources Humaines' },
  { key: '/rapports', icon: <BarChartOutlined />, label: 'Rapports' },
  { key: '/releves', icon: <ThunderboltOutlined />, label: 'Relevés IoT' },
  { key: '/equipe', icon: <TeamOutlined />, label: 'Équipe' },
  { key: '/inventaire', icon: <ToolOutlined />, label: 'Inventaire' },
  { key: '/planning', icon: <CalendarOutlined />, label: 'Planning' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const activeKey = menuItems.find(item => pathname.startsWith(item.key))?.key ?? '/dashboard';

  const handleLogout = async () => {
    await signOut();
    message.success('Déconnexion réussie');
    router.push('/login');
  };

  return (
    <ConfigProvider theme={farmTheme} locale={frFR}>
      <Layout style={{ minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
        >
          {/* Logo */}
          <div style={{
            padding: collapsed ? '20px 8px' : '20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 12,
            transition: 'padding 0.2s',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #52C41A, #2D7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>🌿</div>
            {!collapsed && (
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Ferme Circulaire</div>
                <div style={{ color: '#8BC34A', fontSize: 11, marginTop: 2 }}>Côte d'Ivoire 🇨🇮</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeKey]}
            style={{ border: 'none', marginTop: 8, flex: 1 }}
            onClick={({ key }) => router.push(key)}
            items={menuItems}
          />

          {/* Collapse trigger */}
          <div style={{
            padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end',
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#8BC34A' }}
            />
          </div>
        </Sider>

        {/* MAIN AREA */}
        <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
          {/* HEADER */}
          <Header style={{ position: 'sticky', top: 0, zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Page title */}
            <div>
              <Text strong style={{ fontSize: 16, color: '#1A2E1A' }}>
                {menuItems.find(m => m.key === activeKey)?.label ?? 'Ferme Circulaire'}
              </Text>
              <div style={{ fontSize: 12, color: '#5A7A5A', marginTop: -2 }}>
                Ferme de Démonstration — Abidjan
              </div>
            </div>

            {/* Right actions */}
            <Space size={12}>
              <AlertDropdown />
              <Dropdown
                menu={{
                  items: [
                    { key: 'profile', icon: <UserOutlined />, label: 'Mon profil' },
                    { key: 'settings', icon: <SettingOutlined />, label: 'Paramètres' },
                    { type: 'divider' as const },
                    { key: 'logout', icon: <LogoutOutlined />, label: 'Déconnexion', danger: true, onClick: handleLogout },
                  ],
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F0F5F0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Avatar size={32} style={{ background: '#2D7D32', fontWeight: 700 }}>
                    {user?.email?.[0]?.toUpperCase() || 'A'}
                  </Avatar>
                  <div className="hide-mobile">
                    <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2, color: '#1A2E1A' }}>
                      {user?.email?.split('@')[0] || 'Admin Ferme'}
                    </div>
                    <div style={{ fontSize: 11, color: '#5A7A5A' }}>
                      {user ? 'Connecté' : 'Non connecté'}
                    </div>
                  </div>
                </div>
              </Dropdown>
            </Space>
          </Header>

          {/* CONTENT */}
          <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            <div className="page-fade-in">
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
