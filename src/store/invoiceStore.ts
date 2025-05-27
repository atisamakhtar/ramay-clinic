import { create } from 'zustand';
import { Invoice, InvoiceItem } from '../types';
import { getRandomId } from '../lib/utils';
import { useProductStore } from './productStore';
import Decimal from 'decimal.js';

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV${year}${month}${random}`;
};

// Helper function to calculate totals
const calculateTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => 
    sum.plus(new Decimal(item.totalAmount)), new Decimal(0));
  
  return {
    subtotal: subtotal.toNumber(),
    totalAmount: subtotal.toNumber() // Add tax calculation here if needed
  };
};

type InvoiceState = {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'paidAmount' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, invoiceData: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addInvoiceItem: (invoiceId: string, item: Omit<InvoiceItem, 'id' | 'createdAt'>) => void;
  removeInvoiceItem: (invoiceId: string, itemId: string) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
};

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  isLoading: false,
  error: null,

  createInvoice: (invoiceData) => {
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      id: getRandomId(),
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft',
      paidAmount: 0,
      ...invoiceData,
      createdAt: now,
      updatedAt: now
    };
    
    set(state => ({
      invoices: [...state.invoices, newInvoice]
    }));
    
    // Update product quantities
    const productStore = useProductStore.getState();
    newInvoice.items.forEach(item => {
      productStore.updateProduct(item.productId, {
        quantity: item.product.quantity - item.quantity
      });
    });
  },

  updateInvoice: (id, invoiceData) => {
    set(state => ({
      invoices: state.invoices.map(invoice => 
        invoice.id === id ? 
        { ...invoice, ...invoiceData, updatedAt: new Date().toISOString() } : 
        invoice
      )
    }));
  },

  deleteInvoice: (id) => {
    set(state => ({
      invoices: state.invoices.filter(invoice => invoice.id !== id)
    }));
  },

  addInvoiceItem: (invoiceId, item) => {
    const newItem: InvoiceItem = {
      id: getRandomId(),
      ...item,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      invoices: state.invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const updatedItems = [...invoice.items, newItem];
          const { subtotal, totalAmount } = calculateTotals(updatedItems);
          
          return {
            ...invoice,
            items: updatedItems,
            subtotal,
            totalAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return invoice;
      })
    }));
  },

  removeInvoiceItem: (invoiceId, itemId) => {
    set(state => ({
      invoices: state.invoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const updatedItems = invoice.items.filter(item => item.id !== itemId);
          const { subtotal, totalAmount } = calculateTotals(updatedItems);
          
          return {
            ...invoice,
            items: updatedItems,
            subtotal,
            totalAmount,
            updatedAt: new Date().toISOString()
          };
        }
        return invoice;
      })
    }));
  },

  updateInvoiceStatus: (id, status) => {
    set(state => ({
      invoices: state.invoices.map(invoice => 
        invoice.id === id ? 
        { ...invoice, status, updatedAt: new Date().toISOString() } : 
        invoice
      )
    }));
  }
}));