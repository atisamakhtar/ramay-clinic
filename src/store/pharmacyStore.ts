import { create } from 'zustand';
import { Pharmacy } from '../types';
import { getRandomId } from '../lib/utils';

// Sample initial data
const initialPharmacies: Pharmacy[] = [
  {
    id: '1',
    name: 'City Pharmacy',
    contactPerson: 'Robert Johnson',
    contactNumber: '(555) 789-0123',
    email: 'contact@citypharmacy.com',
    address: '123 Main St, Medical City, MC 12345',
    registrationNumber: 'PH001',
    creditLimit: 10000,
    paymentTerms: 30,
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2023-05-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'HealthCare Pharmacy',
    contactPerson: 'Sarah Williams',
    contactNumber: '(555) 234-5678',
    email: 'info@healthcarepharmacy.com',
    address: '456 Hospital Ave, Medical City, MC 12345',
    registrationNumber: 'PH002',
    creditLimit: 15000,
    paymentTerms: 45,
    createdAt: '2023-05-10T14:30:00Z',
    updatedAt: '2023-05-10T14:30:00Z'
  }
];

type PharmacyState = {
  pharmacies: Pharmacy[];
  isLoading: boolean;
  error: string | null;
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePharmacy: (id: string, pharmacyData: Partial<Pharmacy>) => void;
  deletePharmacy: (id: string) => void;
};

export const usePharmacyStore = create<PharmacyState>((set) => ({
  pharmacies: [...initialPharmacies],
  isLoading: false,
  error: null,

  addPharmacy: (pharmacyData) => {
    const now = new Date().toISOString();
    const newPharmacy: Pharmacy = {
      id: getRandomId(),
      ...pharmacyData,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      pharmacies: [...state.pharmacies, newPharmacy]
    }));
  },

  updatePharmacy: (id, pharmacyData) => {
    set(state => ({
      pharmacies: state.pharmacies.map(pharmacy => 
        pharmacy.id === id ? 
        { ...pharmacy, ...pharmacyData, updatedAt: new Date().toISOString() } : 
        pharmacy
      )
    }));
  },

  deletePharmacy: (id) => {
    set(state => ({
      pharmacies: state.pharmacies.filter(pharmacy => pharmacy.id !== id)
    }));
  }
}));