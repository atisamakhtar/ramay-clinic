export type User = {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  reorderLevel: number;
  costPerUnit: number;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  type: 'patient' | 'department';
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  patientId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Assignment = {
  id: string;
  productId: string;
  product: Product;
  clientId: string;
  client: Client;
  quantity: number;
  assignedById: string;
  assignedBy: User;
  notes?: string;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  userId: string;
  user: User;
  action: string;
  entityType: 'product' | 'client' | 'assignment' | 'user';
  entityId: string;
  details: string;
  createdAt: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalClients: number;
  lowStockItems: number;
  expiringItems: number;
  recentAssignments: number;
  activeUsers: number;
};