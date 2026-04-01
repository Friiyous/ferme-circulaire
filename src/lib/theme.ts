import type { ThemeConfig } from 'antd';

export const farmTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2D7D32',
    colorSuccess: '#52C41A',
    colorWarning: '#FA8C16',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',
    borderRadius: 8,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F0F5F0',
    colorBorder: '#D9E8D9',
    colorText: '#1A2E1A',
    colorTextSecondary: '#5A7A5A',
    fontSize: 14,
    sizeStep: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#1A3320',
      headerBg: '#FFFFFF',
      bodyBg: '#F0F5F0',
      triggerBg: '#2D5A30',
      triggerColor: '#FFFFFF',
    },
    Menu: {
      darkItemBg: '#1A3320',
      darkItemColor: '#B8D4B8',
      darkItemSelectedBg: '#2D7D32',
      darkItemSelectedColor: '#FFFFFF',
      darkItemHoverColor: '#FFFFFF',
      darkSubMenuItemBg: '#142A1A',
      darkPopupBg: '#1A3320',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(45, 125, 50, 0.08)',
    },
    Button: {
      borderRadius: 8,
      primaryShadow: '0 4px 12px rgba(45, 125, 50, 0.3)',
    },
    Table: {
      borderRadius: 8,
      headerBg: '#F5FAF5',
      rowHoverBg: '#F0F9F0',
    },
    Statistic: {
      titleFontSize: 13,
    },
    Progress: {
      defaultColor: '#2D7D32',
    },
    Tag: {
      borderRadius: 6,
    },
  },
};

// Couleurs sémantiques (pour usage direct en JSX)
export const colors = {
  primary: '#2D7D32',
  success: '#52C41A',
  warning: '#FA8C16',
  error: '#FF4D4F',
  info: '#1677FF',
  bgLight: '#F0F5F0',
  textPrimary: '#1A2E1A',
  textSecondary: '#5A7A5A',
  border: '#D9E8D9',
  // Module colors
  elevage: '#FF6B35',
  cultures: '#2D7D32',
  valorisation: '#722ED1',
  alimentation: '#FA8C16',
  finances: '#1677FF',
  rapports: '#08979C',
};

// Espèces animales
export const especeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  poule: { label: 'Poule', emoji: '🐔', color: '#FA8C16' },
  canard: { label: 'Canard', emoji: '🦆', color: '#1677FF' },
  pintade: { label: 'Pintade', emoji: '🐓', color: '#722ED1' },
  chevre: { label: 'Chèvre', emoji: '🐐', color: '#52C41A' },
  mouton: { label: 'Mouton', emoji: '🐑', color: '#87d068' },
  bovin: { label: 'Bovin', emoji: '🐄', color: '#8B4513' },
  lapin: { label: 'Lapin', emoji: '🐇', color: '#FF69B4' },
};