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
  type: 'patient' | 'department' | 'pharmacy';
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  patientId?: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Pharmacy = {
  id: string;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  registrationNumber: string;
  creditLimit: number;
  paymentTerms: number;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'credit_card';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  pharmacyId: string;
  pharmacy: Pharmacy;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdById: string;
  createdBy: User;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  invoice: Invoice;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdById: string;
  createdBy: User;
  createdAt: string;
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
  entityType: 'product' | 'client' | 'assignment' | 'user' | 'invoice' | 'payment';
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
  totalInvoices: number;
  pendingPayments: number;
};