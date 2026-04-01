'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Service pour personnaliser le dashboard
 * Gère les widgets visibles et leur position
 */

export type WidgetType = 
  | 'total_animals'
  | 'active_animals'
  | 'total_stocks'
  | 'low_stocks'
  | 'month_revenue'
  | 'month_expense'
  | 'net_balance'
  | 'employees'
  | 'productivity'
  | 'autonomy'
  | 'biogas'
  | 'compost';

export interface DashboardWidget {
  id: WidgetType;
  title: string;
  icon: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

interface DashboardState {
  widgets: DashboardWidget[];
  setWidgetEnabled: (id: WidgetType, enabled: boolean) => void;
  setWidgetOrder: (order: WidgetType[]) => void;
  resetToDefault: () => void;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'total_animals', title: 'Total Animaux', icon: '🐔', enabled: true, order: 0, size: 'small' },
  { id: 'active_animals', title: 'Actifs', icon: '✅', enabled: true, order: 1, size: 'small' },
  { id: 'total_stocks', title: 'Stocks', icon: '📦', enabled: true, order: 2, size: 'small' },
  { id: 'low_stocks', title: 'Stock Bas', icon: '⚠️', enabled: true, order: 3, size: 'small' },
  { id: 'month_revenue', title: 'Revenus', icon: '📈', enabled: true, order: 4, size: 'small' },
  { id: 'month_expense', title: 'Dépenses', icon: '📉', enabled: true, order: 5, size: 'small' },
  { id: 'net_balance', title: 'Balance', icon: '💰', enabled: true, order: 6, size: 'small' },
  { id: 'employees', title: 'Employés', icon: '👥', enabled: true, order: 7, size: 'small' },
  { id: 'productivity', title: 'Productivité', icon: '📊', enabled: false, order: 8, size: 'medium' },
  { id: 'autonomy', title: 'Autonomie', icon: '🌱', enabled: false, order: 9, size: 'medium' },
  { id: 'biogas', title: 'Biogaz', icon: '⚡', enabled: false, order: 10, size: 'small' },
  { id: 'compost', title: 'Compost', icon: '🌿', enabled: false, order: 11, size: 'small' },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      
      setWidgetEnabled: (id, enabled) => 
        set((state) => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, enabled } : w
          ),
        })),
      
      setWidgetOrder: (order) =>
        set((state) => ({
          widgets: state.widgets.map(w => ({
            ...w,
            order: order.indexOf(w.id),
          })),
        })),
      
      resetToDefault: () => set({ widgets: defaultWidgets }),
    }),
    {
      name: 'dashboard-widgets',
    }
  )
);

export const getEnabledWidgets = (widgets: DashboardWidget[]): DashboardWidget[] => {
  return widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);
};