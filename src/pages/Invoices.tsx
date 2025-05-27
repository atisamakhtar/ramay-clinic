import React, { useState } from 'react';
import { Plus, Search, FileText, Printer, Download, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useInvoiceStore } from '../store/invoiceStore';
import { usePharmacyStore } from '../store/pharmacyStore';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatCurrency } from '../lib/utils';
import { Invoice, InvoiceItem, Product } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Decimal from 'decimal.js';

export default function Invoices() {
  const { invoices, createInvoice, updateInvoice } = useInvoiceStore();
  const { pharmacies } = usePharmacyStore();
  const { products } = useProductStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPharmacy, setFilterPharmacy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    pharmacyId: '',
    items: [] as {
      productId: string;
      quantity: number;
      unitPrice: number;
      discountPercentage: number;
    }[],
    discountPercentage: 0,
    taxPercentage: 0,
    notes: '',
    dueDate: ''
  });
  
  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPharmacy = !filterPharmacy || invoice.pharmacyId === filterPharmacy;
    const matchesStatus = !filterStatus || invoice.status === filterStatus;
    
    return matchesSearch && matchesPharmacy && matchesStatus;
  });
  
  // Calculate totals for invoice
  const calculateTotals = (items: typeof formData.items) => {
    let subtotal = new Decimal(0);
    
    items.forEach(item => {
      const lineTotal = new Decimal(item.quantity)
        .times(item.unitPrice)
        .times(new Decimal(1).minus(item.discountPercentage / 100));
      subtotal = subtotal.plus(lineTotal);
    });
    
    const discountAmount = subtotal.times(formData.discountPercentage / 100);
    const afterDiscount = subtotal.minus(discountAmount);
    const taxAmount = afterDiscount.times(formData.taxPercentage / 100);
    const total = afterDiscount.plus(taxAmount);
    
    return {
      subtotal: subtotal.toNumber(),
      discountAmount: discountAmount.toNumber(),
      taxAmount: taxAmount.toNumber(),
      total: total.toNumber()
    };
  };
  
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          quantity: 1,
          unitPrice: 0,
          discountPercentage: 0
        }
      ]
    }));
  };
  
  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'productId') {
            const product = products.find(p => p.id === value);
            return {
              ...item,
              [field]: value,
              unitPrice: product ? product.costPerUnit : 0
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const pharmacy = pharmacies.find(p => p.id === formData.pharmacyId);
    if (!pharmacy) return;
    
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals(formData.items);
    
    const invoiceItems: Omit<InvoiceItem, 'id' | 'createdAt'>[] = formData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      
      const lineTotal = new Decimal(item.quantity)
        .times(item.unitPrice)
        .times(new Decimal(1).minus(item.discountPercentage / 100))
        .toNumber();
      
      return {
        invoiceId: '', // Will be set by store
        productId: item.productId,
        product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: new Decimal(item.quantity)
          .times(item.unitPrice)
          .times(item.discountPercentage / 100)
          .toNumber(),
        totalAmount: lineTotal
      };
    });
    
    const invoiceData = {
      pharmacyId: formData.pharmacyId,
      pharmacy,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      subtotal,
      discountPercentage: formData.discountPercentage,
      discountAmount,
      taxPercentage: formData.taxPercentage,
      taxAmount,
      totalAmount: total,
      status: 'draft' as const,
      notes: formData.notes,
      createdById: user.id,
      createdBy: user,
      items: invoiceItems
    };
    
    if (selectedInvoice) {
      updateInvoice(selectedInvoice.id, invoiceData);
    } else {
      createInvoice(invoiceData);
    }
    
    handleCloseModal();
  };
  
  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      setFormData({
        pharmacyId: invoice.pharmacyId,
        items: invoice.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage
        })),
        discountPercentage: invoice.discountPercentage,
        taxPercentage: invoice.taxPercentage,
        notes: invoice.notes || '',
        dueDate: invoice.dueDate
      });
      setSelectedInvoice(invoice);
    } else {
      setFormData({
        pharmacyId: '',
        items: [],
        discountPercentage: 0,
        taxPercentage: 0,
        notes: '',
        dueDate: ''
      });
      setSelectedInvoice(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
    setShowPreview(false);
  };
  
  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 40);
    doc.text(`Date: ${formatDate(invoice.issueDate)}`, 14, 45);
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 14, 50);
    
    // Add pharmacy details
    doc.text('Bill To:', 14, 65);
    doc.text(invoice.pharmacy.name, 14, 70);
    if (invoice.pharmacy.address) {
      doc.text(invoice.pharmacy.address, 14, 75);
    }
    
    // Add items table
    (doc as any).autoTable({
      startY: 85,
      head: [['Product', 'Quantity', 'Unit Price', 'Discount', 'Total']],
      body: invoice.items.map(item => [
        item.product.name,
        `${item.quantity} ${item.product.unit}(s)`,
        formatCurrency(item.unitPrice),
        `${item.discountPercentage}%`,
        formatCurrency(item.totalAmount)
      ]),
      foot: [
        ['', '', '', 'Subtotal:', formatCurrency(invoice.subtotal)],
        ['', '', '', 'Discount:', formatCurrency(invoice.discountAmount)],
        ['', '', '', 'Tax:', formatCurrency(invoice.taxAmount)],
        ['', '', '', 'Total:', formatCurrency(invoice.totalAmount)]
      ],
      theme: 'grid'
    });
    
    // Add payment status
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text(`Payment Status: ${invoice.status.toUpperCase()}`, 14, finalY + 10);
    if (invoice.paidAmount > 0) {
      doc.text(`Amount Paid: ${formatCurrency(invoice.paidAmount)}`, 14, finalY + 15);
      doc.text(`Balance Due: ${formatCurrency(invoice.totalAmount - invoice.paidAmount)}`, 14, finalY + 20);
    }
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          Create New Invoice
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>All Invoices</CardTitle>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select 
                className="h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterPharmacy}
                onChange={(e) => setFilterPharmacy(e.target.value)}
              >
                <option value="">All Pharmacies</option>
                {pharmacies.map(pharmacy => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name}
                  </option>
                ))}
              </select>
              
              <select 
                className="h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="partial">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.pharmacy.name}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {formatDate(invoice.dueDate)}
                      {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
                        <AlertTriangle size={16} className="ml-2 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{formatCurrency(invoice.totalAmount)}</p>
                      {invoice.paidAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          Paid: {formatCurrency(invoice.paidAmount)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenModal(invoice)}
                        className="text-blue-600"
                      >
                        <FileText size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generatePDF(invoice)}
                        className="text-green-600"
                      >
                        <Download size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {/* Add payment modal */}}
                        className="text-purple-600"
                      >
                        <CreditCard size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Create/Edit Invoice Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.pharmacyId}
                onChange={(e) => setFormData(prev => ({ ...prev, pharmacyId: e.target.value }))}
                required
              >
                <option value="">Select Pharmacy</option>
                {pharmacies.map(pharmacy => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              type="date"
              label="Due Date"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>
          
          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Line Items</h3>
              <Button 
                type="button"
                variant="outline"
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.costPerUnit)} per {product.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemChange(index, 'discountPercentage', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.taxPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxPercentage: parseFloat(e.target.value) }))}
                />
              </div>
              
              {formData.items.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateTotals(formData.items).subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>{formatCurrency(calculateTotals(formData.items).discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(calculateTotals(formData.items).taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotals(formData.items).total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={formData.items.length === 0}
            >
              {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}