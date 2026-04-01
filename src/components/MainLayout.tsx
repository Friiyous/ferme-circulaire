'use client';
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, Badge, Tooltip, Switch } from 'antd';
import {
  DashboardOutlined, ExperimentOutlined, AppstoreOutlined,
  SyncOutlined, ShoppingCartOutlined, DollarOutlined,
  BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UserOutlined, LogoutOutlined, SettingOutlined,
  ThunderboltOutlined, TeamOutlined, ToolOutlined, CalendarOutlined,
  BellOutlined, GlobalOutlined, SunOutlined, MoonOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import frFR from 'antd/locale/fr_FR';
import { useTheme } from '@/contexts/ThemeContext';
import { colors } from '@/lib/theme';
import '../app/globals.css';
import AlertDropdown from './notifications/AlertDropdown';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tableau de bord', color: '#4CAF50' },
  { key: '/elevage', icon: <ExperimentOutlined />, label: 'Elevage', color: '#FF6B35' },
  { key: '/cultures', icon: <AppstoreOutlined />, label: 'Cultures', color: '#2D7D32' },
  { key: '/valorisation', icon: <SyncOutlined />, label: 'Valorisation', color: '#722ED1' },
  { key: '/alimentation', icon: <ShoppingCartOutlined />, label: 'Alimentation', color: '#FA8C16' },
  { key: '/finances', icon: <DollarOutlined />, label: 'Finances', color: '#1677FF' },
  { key: '/rh', icon: <UserOutlined />, label: 'RH', color: '#EB2F96' },
  { key: '/rapports', icon: <BarChartOutlined />, label: 'Rapports', color: '#08979C' },
  { key: '/releves', icon: <ThunderboltOutlined />, label: 'Releves IoT', color: '#52C41A' },
  { key: '/equipe', icon: <TeamOutlined />, label: 'Equipe', color: '#13C2C2' },
  { key: '/inventaire', icon: <ToolOutlined />, label: 'Inventaire', color: '#FAAD14' },
  { key: '/planning', icon: <CalendarOutlined />, label: 'Planning', color: '#722ED1' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const activeKey = menuItems.find(item => pathname.startsWith(item.key))?.key ?? '/dashboard';
  const activeItem = menuItems.find(m => m.key === activeKey);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Couleurs basees sur le mode
  const sidebarBg = isDarkMode 
    ? 'linear-gradient(180deg, #0D0D0D 0%, #0A0A0A 100%)'
    : 'linear-gradient(180deg, #1A2E1A 0%, #142A1A 100%)';
  
  const headerBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const contentBg = isDarkMode ? '#121212' : '#F5FBF5';
  const textPrimary = isDarkMode ? '#E0E0E0' : '#1A2E1A';
  const textSecondary = isDarkMode ? '#A0A0A0' : '#5A7A5A';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{ 
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
          background: sidebarBg,
          boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 12px' : '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
              : 'linear-gradient(135deg, #52C41A, #2D7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
            boxShadow: isDarkMode 
              ? '0 4px 12px rgba(76, 175, 80, 0.4)'
              : '0 4px 12px rgba(82, 196, 26, 0.4)',
          }}>🌿</div>
          {!collapsed && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Ferme Circulaire</div>
              <div style={{ color: '#8BC34A', fontSize: 11, marginTop: 3 }}>Gestion Integree</div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          style={{ 
            border: 'none', 
            marginTop: 16, 
            flex: 1,
            background: 'transparent',
          }}
          onClick={({ key }) => router.push(key)}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{item.label}</span>
                {activeKey === item.key && (
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }} />
                )}
              </div>
            ),
            style: { margin: '4px 8px', borderRadius: 8 },
          }))}
        />

        {/* Footer info */}
        {!collapsed && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid rgba(255,255,255,0.08)',
            margin: '0 8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8BA88B', fontSize: 12 }}>
              <GlobalOutlined />
              <span>Korhogo, CI</span>
            </div>
            <div style={{ color: '#5A7A5A', fontSize: 11, marginTop: 4 }}>
              Mise a jour: {dayjs().format('DD/MM HH:mm')}
            </div>
          </div>
        )}

        {/* Collapse button */}
        <div style={{
          padding: '16px', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', 
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              color: '#8BC34A',
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-end',
            }}
          />
        </div>
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.3s ease' }}>
        {/* HEADER */}
        <Header style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 99, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: headerBg,
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0,0,0,0.4)' 
            : '0 2px 8px rgba(0,0,0,0.06)',
          padding: '0 24px',
          height: 64,
        }}>
          {/* Left: Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {activeItem && (
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: activeItem.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: activeItem.color,
                fontSize: 18,
              }}>
                {activeItem.icon}
              </div>
            )}
            <div>
              <Text strong style={{ fontSize: 18, color: textPrimary, fontWeight: 600 }}>
                {activeItem?.label ?? 'Ferme Circulaire'}
              </Text>
              <div style={{ fontSize: 12, color: textSecondary, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success, display: 'inline-block' }} />
                Connecte - v2.4
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <Space size={16}>
            {/* Dark mode toggle */}
            <Tooltip title={isDarkMode ? 'Mode clair' : 'Mode sombre'}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                padding: '6px 12px',
                borderRadius: 8,
                border: isDarkMode ? '1px solid #333' : '1px solid #E0EBE0',
                background: isDarkMode ? '#252525' : '#F5FBF5',
              }}>
                {isDarkMode ? <MoonOutlined style={{ color: '#4CAF50' }} /> : <SunOutlined style={{ color: '#FA8C16' }} />}
                <Switch 
                  checked={isDarkMode} 
                  onChange={toggleDarkMode}
                  size="small"
                  style={{ margin: 0 }}
                />
              </div>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <Badge count={3} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined style={{ fontSize: 18, color: textPrimary }} />}
                  style={{ 
                    width: 40, height: 40, 
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
              </Badge>
            </Tooltip>

            {/* User menu */}
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: 'Mon profil' },
                  { key: 'settings', icon: <SettingOutlined />, label: 'Parametres' },
                  { type: 'divider' as const },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Deconnexion', danger: true, onClick: handleLogout },
                ],
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 10, 
                cursor: 'pointer', padding: '6px 12px', 
                borderRadius: 10, transition: 'background 0.2s',
                border: isDarkMode ? '1px solid #333' : '1px solid #E0EBE0',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? '#2A2A2A' : '#F5FBF5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar 
                  size={36} 
                  style={{ 
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
                      : 'linear-gradient(135deg, #2D7D32, #52C41A)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <div className="hide-mobile">
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, color: textPrimary }}>
                    {user?.email?.split('@')[0] || 'Admin Ferme'}
                  </div>
                  <div style={{ fontSize: 11, color: colors.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.success }} />
                    Connecte
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT */}
        <Content style={{ 
          padding: 24, 
          minHeight: 'calc(100vh - 64px)',
          background: contentBg,
        }}>
          <div className="page-fade-in" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}