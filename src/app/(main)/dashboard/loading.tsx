'use client';

import { Spin, Card, Skeleton } from 'antd';
import { green } from '@ant-design/colors';

export default function Loading() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F0F5F0',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 24
    }}>
      {/* Logo animé */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: 'linear-gradient(135deg, #52C41A, #2D7D32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        animation: 'pulse 2s infinite'
      }}>
        🌿
      </div>
      
      {/* Spin avec couleur verte */}
      <Spin size="large" indicator={<span style={{ color: green[5] }}>🌱</span>} />
      
      {/* Skeleton cards */}
      <div style={{ padding: 24, maxWidth: 1200, width: '100%' }}>
        <Skeleton active paragraph={{ rows: 1 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ borderRadius: 12 }}>
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}