'use client';
import MainLayout from '@/components/MainLayout';
import { Suspense } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import frFR from 'antd/locale/fr_FR';

// Loading skeleton component
function LayoutLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F5F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #52C41A, #2D7D32)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 16
        }}>🌿</div>
        <div style={{ color: '#2D7D32', fontSize: 18, fontWeight: 600 }}>
          Chargement...
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MainLayout>{children}</MainLayout>
    </ThemeProvider>
  );
}