import { create } from 'zustand';
import { Product } from '../types';
import { getRandomId } from '../lib/utils';

// Sample initial data
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    description: 'Pain reliever and fever reducer',
    category: 'Medication',
    quantity: 500,
    unit: 'Tablet',
    manufacturer: 'PharmaCorp',
    batchNumber: 'PCB-2023-001',
    expiryDate: '2025-03-15',
    reorderLevel: 100,
    costPerUnit: 0.25,
    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2023-04-01T08:00:00Z'
  },
  {
    id: '2',
    name: 'Surgical Mask',
    description: 'Three-layer protective face mask',
    category: 'PPE',
    quantity: 1000,
    unit: 'Piece',
    manufacturer: 'MedSupplies',
    batchNumber: 'MS-2023-042',
    expiryDate: '2025-12-31',
    reorderLevel: 200,
    costPerUnit: 0.50,
    createdAt: '2023-04-10T09:30:00Z',
    updatedAt: '2023-04-10T09:30:00Z'
  },
  {
    id: '3',
    name: 'Digital Thermometer',
    description: 'Infrared forehead thermometer',
    category: 'Equipment',
    quantity: 50,
    unit: 'Piece',
    manufacturer: 'MedTech',
    batchNumber: 'MT-2023-015',
    expiryDate: '2026-06-30',
    reorderLevel: 10,
    costPerUnit: 12.99,
    createdAt: '2023-03-15T14:00:00Z',
    updatedAt: '2023-03-15T14:00:00Z'
  },
  {
    id: '4',
    name: 'Examination Gloves',
    description: 'Latex-free nitrile examination gloves',
    category: 'PPE',
    quantity: 2000,
    unit: 'Piece',
    manufacturer: 'SafeGuard',
    batchNumber: 'SG-2023-078',
    expiryDate: '2024-08-15',
    reorderLevel: 500,
    costPerUnit: 0.15,
    createdAt: '2023-04-05T10:15:00Z',
    updatedAt: '2023-04-05T10:15:00Z'
  },
  {
    id: '5',
    name: 'Insulin Syringe',
    description: '1ml insulin syringe with needle',
    category: 'Supplies',
    quantity: 800,
    unit: 'Piece',
    manufacturer: 'MediSafe',
    batchNumber: 'MS-2023-055',
    expiryDate: '2024-05-20',
    reorderLevel: 200,
    costPerUnit: 0.35,
    createdAt: '2023-03-28T11:45:00Z',
    updatedAt: '2023-03-28T11:45:00Z'
  }
];

type ProductState = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStock: (id: string, quantity: number) => void;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [...initialProducts],
  isLoading: false,
  error: null,

  addProduct: (productData) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: getRandomId(),
      ...productData,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      products: [...state.products, newProduct]
    }));
  },

  updateProduct: (id, productData) => {
    set(state => ({
      products: state.products.map(product => 
        product.id === id ? 
        { ...product, ...productData, updatedAt: new Date().toISOString() } : 
        product
      )
    }));
  },

  deleteProduct: (id) => {
    set(state => ({
      products: state.products.filter(product => product.id !== id)
    }));
  },

  addStock: (id, quantity) => {
    set(state => ({
      products: state.products.map(product => 
        product.id === id ? 
        { 
          ...product, 
          quantity: product.quantity + quantity,
          updatedAt: new Date().toISOString() 
        } : 
        product
      )
    }));
  }
}));