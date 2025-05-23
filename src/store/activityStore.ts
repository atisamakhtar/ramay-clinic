import { create } from 'zustand';
import { ActivityLog } from '../types';
import { getRandomId } from '../lib/utils';

// Sample initial data
const initialLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '2',
    user: {
      id: '2',
      name: 'Super Admin',
      email: 'superadmin@medical.com',
      role: 'superadmin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    action: 'created',
    entityType: 'product',
    entityId: '1',
    details: 'Added new product: Paracetamol 500mg',
    createdAt: '2023-04-01T08:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@medical.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    action: 'updated',
    entityType: 'product',
    entityId: '1',
    details: 'Updated stock quantity for: Paracetamol 500mg',
    createdAt: '2023-04-02T10:15:00Z'
  },
  {
    id: '3',
    userId: '2',
    user: {
      id: '2',
      name: 'Super Admin',
      email: 'superadmin@medical.com',
      role: 'superadmin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    action: 'created',
    entityType: 'client',
    entityId: '1',
    details: 'Added new client: John Smith',
    createdAt: '2023-04-03T09:30:00Z'
  },
  {
    id: '4',
    userId: '1',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@medical.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    action: 'assigned',
    entityType: 'assignment',
    entityId: '1',
    details: 'Assigned Paracetamol 500mg to John Smith',
    createdAt: '2023-04-05T14:20:00Z'
  }
];

type ActivityState = {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  addLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void;
};

export const useActivityStore = create<ActivityState>((set) => ({
  logs: [...initialLogs],
  isLoading: false,
  error: null,

  addLog: (logData) => {
    const newLog: ActivityLog = {
      id: getRandomId(),
      ...logData,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      logs: [newLog, ...state.logs]
    }));
  }
}));