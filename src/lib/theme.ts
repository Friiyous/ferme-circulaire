import type { ThemeConfig } from 'antd';

// =============================================
// THEME CLAIR (par defaut)
// =============================================
export const farmTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2D7D32',
    colorSuccess: '#52C41A',
    colorWarning: '#FA8C16',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',
    borderRadius: 10,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5FBF5',
    colorBorder: '#E0EBE0',
    colorText: '#1A2E1A',
    colorTextSecondary: '#5A7A5A',
    fontSize: 14,
    sizeStep: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#1A2E1A',
      headerBg: '#FFFFFF',
      bodyBg: '#F5FBF5',
      triggerBg: '#2D5A30',
      triggerColor: '#FFFFFF',
    },
    Menu: {
      darkItemBg: '#1A2E1A',
      darkItemColor: '#B8D4B8',
      darkItemSelectedBg: '#2D7D32',
      darkItemSelectedColor: '#FFFFFF',
      darkItemHoverColor: '#FFFFFF',
      darkSubMenuItemBg: '#142A1A',
      darkPopupBg: '#1A2E1A',
    },
    Card: {
      borderRadius: 14,
      boxShadow: '0 4px 16px rgba(45, 125, 50, 0.1)',
    },
    Button: {
      borderRadius: 8,
      primaryShadow: '0 4px 12px rgba(45, 125, 50, 0.25)',
      controlHeight: 40,
    },
    Table: {
      borderRadius: 10,
      headerBg: '#F8FCF8',
      headerColor: '#2D7D32',
      rowHoverBg: '#F0F7F0',
    },
    Statistic: { titleFontSize: 13 },
    Progress: { defaultColor: '#2D7D32' },
    Tag: { borderRadiusSM: 6 },
    Input: { borderRadius: 8, controlHeight: 40 },
    Select: { borderRadius: 8, controlHeight: 40 },
    Modal: { borderRadiusLG: 16 },
    Tooltip: { borderRadius: 8 },
  },
};

// =============================================
// THEME SOMBRE (Dark Mode)
// =============================================
export const farmThemeDark: ThemeConfig = {
  token: {
    colorPrimary: '#4CAF50',
    colorSuccess: '#73D13D',
    colorWarning: '#FFB347',
    colorError: '#FF7875',
    colorInfo: '#4096FF',
    borderRadius: 10,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    colorBgContainer: '#1E1E1E',
    colorBgLayout: '#121212',
    colorBorder: '#333333',
    colorText: '#E0E0E0',
    colorTextSecondary: '#A0A0A0',
    fontSize: 14,
    sizeStep: 4,
    wireframe: false,
  },
  components: {
    Layout: {
      siderBg: '#0D0D0D',
      headerBg: '#1E1E1E',
      bodyBg: '#121212',
      triggerBg: '#2D5A30',
      triggerColor: '#FFFFFF',
    },
    Menu: {
      darkItemBg: '#0D0D0D',
      darkItemColor: '#808080',
      darkItemSelectedBg: '#1B5E20',
      darkItemSelectedColor: '#4CAF50',
      darkItemHoverColor: '#E0E0E0',
      darkSubMenuItemBg: '#0A0A0A',
      darkPopupBg: '#0D0D0D',
    },
    Card: {
      borderRadius: 14,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      colorBgContainer: '#1E1E1E',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 10,
      headerBg: '#252525',
      headerColor: '#4CAF50',
      rowHoverBg: '#1A1A1A',
      colorText: '#E0E0E0',
    },
    Statistic: { titleFontSize: 13, colorTextDescription: '#808080' },
    Progress: { defaultColor: '#4CAF50' },
    Tag: { borderRadiusSM: 6 },
    Input: { 
      borderRadius: 8, 
      controlHeight: 40,
      colorBgContainer: '#2A2A2A',
      colorBorder: '#333333',
    },
    Select: { 
      borderRadius: 8, 
      controlHeight: 40,
      colorBgContainer: '#2A2A2A',
    },
    Modal: { 
      borderRadiusLG: 16,
      colorBgElevated: '#1E1E1E',
    },
    Tooltip: { 
      borderRadius: 8,
      colorBgSpotlight: '#1E1E1E',
    },
    Dropdown: {
      colorBgElevated: '#1E1E1E',
    },
    Menu: {
      darkItemBg: '#0D0D0D',
      darkItemSelectedBg: '#1B5E20',
      darkItemSelectedColor: '#4CAF50',
    },
  },
};

// =============================================
// COULEURS SEMANTIQUES
// =============================================
export const colors = {
  // Light mode colors
  primary: '#2D7D32',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  success: '#52C41A',
  successLight: '#73D13D',
  warning: '#FA8C16',
  warningLight: '#FFB347',
  error: '#FF4D4F',
  errorLight: '#FF7875',
  info: '#1677FF',
  infoLight: '#4096FF',
  bgLight: '#F5FBF5',
  bgCard: '#FFFFFF',
  textPrimary: '#1A2E1A',
  textSecondary: '#5A7A5A',
  textMuted: '#8BA88B',
  border: '#E0EBE0',
  borderLight: '#EDF5ED',
  
  // Dark mode colors
  darkBg: '#121212',
  darkBgElevated: '#1E1E1E',
  darkSurface: '#252525',
  darkBorder: '#333333',
  darkText: '#E0E0E0',
  darkTextSecondary: '#A0A0A0',
  darkAccent: '#4CAF50',
  
  // Module colors
  elevage: '#FF6B35',
  elevageLight: '#FFB088',
  cultures: '#2D7D32',
  culturesLight: '#81C784',
  valorisation: '#722ED1',
  valorisationLight: '#B197FC',
  alimentation: '#FA8C16',
  alimentationLight: '#FFD591',
  finances: '#1677FF',
  financesLight: '#8EC3FF',
  rapports: '#08979C',
  rapportsLight: '#36BFC8',
};

// =============================================
// STYLE HEADERS MODULES (pour les deux modes)
// =============================================
export const moduleHeaderStyle = {
  elevage: { bg: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', icon: '🐔' },
  cultures: { bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', icon: '🌱' },
  valorisation: { bg: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)', icon: '♻️' },
  alimentation: { bg: 'linear-gradient(135deg, #FFF8E1, #FFECB3)', icon: '🌾' },
  finances: { bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', icon: '💰' },
  rh: { bg: 'linear-gradient(135deg, #FCE4EC, #F8BBD9)', icon: '👥' },
  inventaire: { bg: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)', icon: '📦' },
  planning: { bg: 'linear-gradient(135deg, #E8EAF6, #C5CAE9)', icon: '📅' },
  rapports: { bg: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)', icon: '📊' },
  releves: { bg: 'linear-gradient(135deg, #F1F8E9, #DCEDC8)', icon: '📝' },
  dashboard: { bg: 'linear-gradient(135deg, #E8F5E9, #A5D6A7)', icon: '🏠' },
};

// Dark mode header styles
export const moduleHeaderStyleDark = {
  elevage: { bg: 'linear-gradient(135deg, #2D1F1A, #1A1412)', icon: '🐔' },
  cultures: { bg: 'linear-gradient(135deg, #1A2E1A, #0D1A0D)', icon: '🌱' },
  valorisation: { bg: 'linear-gradient(135deg, #1A1425, #0D0A12)', icon: '♻️' },
  alimentation: { bg: 'linear-gradient(135deg, #2D2A1A, #1A1A0D)', icon: '🌾' },
  finances: { bg: 'linear-gradient(135deg, #1A1F2D, #0D121A)', icon: '💰' },
  rh: { bg: 'linear-gradient(135deg, #2D1A25, #1A0D12)', icon: '👥' },
  inventaire: { bg: 'linear-gradient(135deg, #2D2A1A, #1A1A0D)', icon: '📦' },
  planning: { bg: 'linear-gradient(135deg, #1A1A2D, #0D0D1A)', icon: '📅' },
  rapports: { bg: 'linear-gradient(135deg, #1A252D, #0D121A)', icon: '📊' },
  releves: { bg: 'linear-gradient(135deg, #1A2D1A, #0D1A0D)', icon: '📝' },
  dashboard: { bg: 'linear-gradient(135deg, #1A2E1A, #0D1A0D)', icon: '🏠' },
};

// =============================================
// ANIMATIONS
// =============================================
export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  slideUp: 'slideUp 0.3s ease-out',
  pulse: 'pulse 2s infinite',
};

export const keyframesCSS = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
`;

// =============================================
// CONFIGURATION ESPECES & CULTURES
// =============================================
export const especeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  puddle: { label: 'Poule', emoji: '🐔', color: '#FA8C16' },
  canard: { label: 'Canard', emoji: '🦆', color: '#1677FF' },
  pintade: { label: 'Pintade', emoji: '🐓', color: '#722ED1' },
  chevre: { label: 'Chèvre', emoji: '🐐', color: '#52C41A' },
  mouton: { label: 'Mouton', emoji: '🐑', color: '#87d068' },
  bovin: { label: 'Bovin', emoji: '🐄', color: '#8B4513' },
  lapin: { label: 'Lapin', emoji: '🐇', color: '#FF69B4' },
  pore: { label: 'Porc', emoji: '🐖', color: '#FFB6C1' },
};

export const cultureConfig: Record<string, { label: string; emoji: string; color: string }> = {
  mais: { label: 'Maïs', emoji: '🌽', color: '#FA8C16' },
  niebe: { label: 'Niébé', emoji: '🫘', color: '#8B4513' },
  manioc: { label: 'Manioc', emoji: '🥔', color: '#DEB887' },
  patate: { label: 'Patate douce', emoji: '🍠', color: '#D2691E' },
  riz: { label: 'Riz', emoji: '🌾', color: '#F5DEB3' },
  brachiaria: { label: 'Brachiaria', emoji: '🌿', color: '#52C41A' },
  mucuna: { label: 'Mucuna', emoji: '🌱', color: '#2D7D32' },
};