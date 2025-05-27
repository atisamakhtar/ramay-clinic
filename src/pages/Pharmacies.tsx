import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, Building2, FileText, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { usePharmacyStore } from '../store/pharmacyStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatDate, formatCurrency } from '../lib/utils';
import { Pharmacy } from '../types';

export default function Pharmacies() {
  const { pharmacies, addPharmacy, updatePharmacy, deletePharmacy } = usePharmacyStore();
  const { invoices } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  
  // Filter pharmacies by search query
  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pharmacy.contactPerson && pharmacy.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const initialFormState = {
    name: '',
    contactPerson: '',
    contactNumber: '',
    email: '',
    address: '',
    registrationNumber: '',
    creditLimit: 10000,
    paymentTerms: 30
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  const handleOpenModal = (pharmacy?: Pharmacy) => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name,
        contactPerson: pharmacy.contactPerson || '',
        contactNumber: pharmacy.contactNumber || '',
        email: pharmacy.email || '',
        address: pharmacy.address || '',
        registrationNumber: pharmacy.registrationNumber,
        creditLimit: pharmacy.creditLimit,
        paymentTerms: pharmacy.paymentTerms
      });
      setSelectedPharmacy(pharmacy);
    } else {
      setFormData(initialFormState);
      setSelectedPharmacy(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPharmacy(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPharmacy) {
      // Update existing pharmacy
      updatePharmacy(selectedPharmacy.id, formData);
    } else {
      // Add new pharmacy
      addPharmacy(formData);
    }
    
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      deletePharmacy(id);
    }
  };
  
  // Calculate financial summary for each pharmacy
  const getPharmacyFinancials = (pharmacyId: string) => {
    const pharmacyInvoices = invoices.filter(inv => inv.pharmacyId === pharmacyId);
    
    const totalAssigned = pharmacyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = pharmacyInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const outstandingBalance = totalAssigned - totalPaid;
    
    return {
      totalAssigned,
      totalPaid,
      outstandingBalance,
      invoiceCount: pharmacyInvoices.length
    };
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          Add New Pharmacy
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Registered Pharmacies</CardTitle>
            
            <div className="relative md:w-64 w-full">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pharmacies..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Financial Summary</TableHead>
                <TableHead>Credit Terms</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPharmacies.length > 0 ? (
                filteredPharmacies.map((pharmacy) => {
                  const financials = getPharmacyFinancials(pharmacy.id);
                  
                  return (
                    <TableRow key={pharmacy.id}>
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <Building2 size={16} className="text-blue-600" />
                          </div>
                          {pharmacy.name}
                        </div>
                      </TableCell>
                      <TableCell>{pharmacy.registrationNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{pharmacy.contactPerson}</p>
                          <p className="text-gray-500">{pharmacy.contactNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <p>
                            Total Assigned: <span className="font-medium">{formatCurrency(financials.totalAssigned)}</span>
                          </p>
                          <p>
                            Outstanding: 
                            <span className={`font-medium ${
                              financials.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatCurrency(financials.outstandingBalance)}
                            </span>
                          </p>
                          <p className="text-gray-500">
                            {financials.invoiceCount} invoice(s)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Credit Limit: {formatCurrency(pharmacy.creditLimit)}</p>
                          <p className="text-gray-500">Terms: {pharmacy.paymentTerms} days</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenModal(pharmacy)}
                            className="text-blue-600"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {/* View invoices */}}
                            className="text-green-600"
                          >
                            <FileText size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {/* View payments */}}
                            className="text-purple-600"
                          >
                            <CreditCard size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(pharmacy.id)}
                            className="text-red-600"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 size={48} className="text-gray-300 mb-2" />
                      <p>No pharmacies found</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Pharmacy Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pharmacy Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          
          <Input
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleFormChange}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleFormChange}
            />
            
            <Input
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleFormChange}
            />
          </div>
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Credit Limit"
              name="creditLimit"
              type="number"
              min="0"
              step="0.01"
              value={formData.creditLimit}
              onChange={handleFormChange}
              required
            />
            
            <Input
              label="Payment Terms (Days)"
              name="paymentTerms"
              type="number"
              min="0"
              value={formData.paymentTerms}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedPharmacy ? 'Update Pharmacy' : 'Add Pharmacy'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}