import { create } from 'zustand';
import { Client } from '../types';
import { getRandomId } from '../lib/utils';

// Sample initial data
const initialClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    type: 'patient',
    contactPerson: 'Jane Smith',
    contactNumber: '(555) 123-4567',
    email: 'john.smith@example.com',
    patientId: 'P10045',
    createdAt: '2023-03-10T09:30:00Z',
    updatedAt: '2023-03-10T09:30:00Z'
  },
  {
    id: '2',
    name: 'Emergency Department',
    type: 'department',
    contactPerson: 'Dr. Lisa Johnson',
    contactNumber: '(555) 234-5678',
    email: 'emergency@medicalcenter.org',
    departmentId: 'D001',
    createdAt: '2023-02-15T10:00:00Z',
    updatedAt: '2023-02-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Sarah Wilson',
    type: 'patient',
    contactPerson: 'Mike Wilson',
    contactNumber: '(555) 345-6789',
    email: 'sarah.wilson@example.com',
    patientId: 'P10046',
    createdAt: '2023-03-12T14:15:00Z',
    updatedAt: '2023-03-12T14:15:00Z'
  },
  {
    id: '4',
    name: 'Pediatrics Department',
    type: 'department',
    contactPerson: 'Dr. Robert Brown',
    contactNumber: '(555) 456-7890',
    email: 'pediatrics@medicalcenter.org',
    departmentId: 'D002',
    createdAt: '2023-02-20T11:30:00Z',
    updatedAt: '2023-02-20T11:30:00Z'
  }
];

type ClientState = {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, clientData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
};

export const useClientStore = create<ClientState>((set) => ({
  clients: [...initialClients],
  isLoading: false,
  error: null,

  addClient: (clientData) => {
    const now = new Date().toISOString();
    const newClient: Client = {
      id: getRandomId(),
      ...clientData,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      clients: [...state.clients, newClient]
    }));
  },

  updateClient: (id, clientData) => {
    set(state => ({
      clients: state.clients.map(client => 
        client.id === id ? 
        { ...client, ...clientData, updatedAt: new Date().toISOString() } : 
        client
      )
    }));
  },

  deleteClient: (id) => {
    set(state => ({
      clients: state.clients.filter(client => client.id !== id)
    }));
  }
}));