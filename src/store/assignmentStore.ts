import { create } from 'zustand';
import { Assignment } from '../types';
import { getRandomId } from '../lib/utils';
import { useProductStore } from './productStore';

// Sample initial data
const initialAssignments: Assignment[] = [
  {
    id: '1',
    productId: '1',
    product: {
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
    clientId: '1',
    client: {
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
    quantity: 20,
    assignedById: '2',
    assignedBy: {
      id: '2',
      name: 'Super Admin',
      email: 'superadmin@medical.com',
      role: 'superadmin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    notes: 'Post-surgery pain management',
    createdAt: '2023-04-12T11:30:00Z'
  },
  {
    id: '2',
    productId: '4',
    product: {
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
    clientId: '2',
    client: {
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
    quantity: 200,
    assignedById: '1',
    assignedBy: {
      id: '1',
      name: 'Admin User',
      email: 'admin@medical.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z'
    },
    notes: 'Weekly supply replenishment',
    createdAt: '2023-04-10T14:45:00Z'
  }
];

type AssignmentState = {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  deleteAssignment: (id: string) => void;
};

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [...initialAssignments],
  isLoading: false,
  error: null,

  addAssignment: (assignmentData) => {
    const newAssignment: Assignment = {
      id: getRandomId(),
      ...assignmentData,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      assignments: [...state.assignments, newAssignment]
    }));
    
    // Update product quantity
    const productStore = useProductStore.getState();
    productStore.updateProduct(assignmentData.productId, {
      quantity: assignmentData.product.quantity - assignmentData.quantity
    });
  },

  deleteAssignment: (id) => {
    set(state => ({
      assignments: state.assignments.filter(assignment => assignment.id !== id)
    }));
  }
}));