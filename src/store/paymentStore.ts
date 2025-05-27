import { create } from 'zustand';
import { Payment } from '../types';
import { getRandomId } from '../lib/utils';
import { useInvoiceStore } from './invoiceStore';
import Decimal from 'decimal.js';

type PaymentState = {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  deletePayment: (id: string) => void;
};

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  addPayment: (paymentData) => {
    const newPayment: Payment = {
      id: getRandomId(),
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    
    set(state => ({
      payments: [...state.payments, newPayment]
    }));
    
    // Update invoice paid amount and status
    const invoiceStore = useInvoiceStore.getState();
    const invoice = invoiceStore.invoices.find(inv => inv.id === paymentData.invoiceId);
    
    if (invoice) {
      const totalPaid = new Decimal(invoice.paidAmount).plus(paymentData.amount);
      const newStatus = totalPaid.greaterThanOrEqualTo(invoice.totalAmount) 
        ? 'paid' 
        : totalPaid.isZero() 
          ? 'issued' 
          : 'partial';
      
      invoiceStore.updateInvoice(invoice.id, {
        paidAmount: totalPaid.toNumber(),
        status: newStatus
      });
    }
  },

  deletePayment: (id) => {
    set(state => ({
      payments: state.payments.filter(payment => payment.id !== id)
    }));
  }
}));