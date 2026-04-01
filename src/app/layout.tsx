import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Ferme Circulaire — Gestion Agricole',
  description: 'Application de gestion de ferme circulaire intégrée : élevage, cultures, valorisation déchets, alimentation bétail.',
  manifest: '/manifest.json',
  keywords: ['ferme', 'agriculture', 'élevage', 'cultures', 'Côte d\'Ivoire', 'gestion agricole'],
  authors: [{ name: 'Ferme Circulaire CI' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2D7D32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Critical CSS inline pour éviter le FOUC */}
        <style dangerouslySetInnerHTML={{__html: `
          body { background: #F0F5F0 !important; margin: 0; font-family: 'Inter', sans-serif; }
          .ant-layout-sider { background: #1A3320 !important; }
          .ant-layout-header { background: #fff !important; }
          .ant-menu-dark { background: transparent !important; }
          .ant-card { border-radius: 12px !important; }
          .ant-btn-primary { background: #2D7D32 !important; border-color: #2D7D32 !important; }
          * { transition: none; }
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}