import React, { useState } from 'react';
import { Plus, Search, Filter, ClipboardList, FileText, Trash } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { useAssignmentStore } from '../store/assignmentStore';
import { useProductStore } from '../store/productStore';
import { useClientStore } from '../store/clientStore';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';
import { formatDate } from '../lib/utils';
import { Assignment, Product, Client } from '../types';

export default function Assignments() {
  const { assignments, addAssignment, deleteAssignment } = useAssignmentStore();
  const { products } = useProductStore();
  const { clients } = useClientStore();
  const { user } = useAuthStore();
  const { addLog } = useActivityStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter options
  const [filterProduct, setFilterProduct] = useState('');
  const [filterClient, setFilterClient] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    clientId: '',
    quantity: 1,
    notes: ''
  });
  
  // Selected product and client for form validation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Filter assignments by search query and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.notes && assignment.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProductFilter = !filterProduct || assignment.productId === filterProduct;
    const matchesClientFilter = !filterClient || assignment.clientId === filterClient;
    
    return matchesSearch && matchesProductFilter && matchesClientFilter;
  });
  
  const handleOpenModal = () => {
    setFormData({
      productId: '',
      clientId: '',
      quantity: 1,
      notes: ''
    });
    setSelectedProduct(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'productId') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const product = products.find(p => p.id === formData.productId);
    const client = clients.find(c => c.id === formData.clientId);
    
    if (!product || !client) return;
    
    if (formData.quantity > product.quantity) {
      alert('Requested quantity exceeds available stock');
      return;
    }
    
    const newAssignment: Omit<Assignment, 'id' | 'createdAt'> = {
      productId: formData.productId,
      product,
      clientId: formData.clientId,
      client,
      quantity: formData.quantity,
      assignedById: user.id,
      assignedBy: user,
      notes: formData.notes
    };
    
    addAssignment(newAssignment);
    
    // Add activity log
    addLog({
      userId: user.id,
      user,
      action: 'assigned',
      entityType: 'assignment',
      entityId: product.id,
      details: `Assigned ${formData.quantity} ${product.unit}(s) of ${product.name} to ${client.name}`
    });
    
    handleCloseModal();
  };
  
  const handleDelete = (assignment: Assignment) => {
    if (!user) return;
    
    if (window.confirm(`Are you sure you want to delete this assignment of ${assignment.quantity} ${assignment.product.unit}(s) of ${assignment.product.name} to ${assignment.client.name}?`)) {
      deleteAssignment(assignment.id);
      
      // Add activity log
      addLog({
        userId: user.id,
        user,
        action: 'deleted',
        entityType: 'assignment',
        entityId: assignment.id,
        details: `Deleted assignment of ${assignment.product.name} to ${assignment.client.name}`
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Product Assignments</h1>
        
        <Button 
          onClick={handleOpenModal}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          New Assignment
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Assignment History</CardTitle>
            
            <div className="flex flex-col md:flex-row gap-4 md:w-auto w-full">
              <div className="relative md:w-64 w-full">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative md:w-48 w-full">
                  <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select 
                    className="pl-10 w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                  >
                    <option value="">All Products</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative md:w-48 w-full">
                  <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select 
                    className="pl-10 w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium text-gray-900">
                      {assignment.product.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        {assignment.client.name}
                        <div className="text-xs text-gray-500">
                          {assignment.client.type === 'patient' ? 
                            `Patient ID: ${assignment.client.patientId}` : 
                            `Dept ID: ${assignment.client.departmentId}`
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.quantity} {assignment.product.unit}(s)
                    </TableCell>
                    <TableCell>
                      {assignment.assignedBy.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(assignment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {assignment.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600"
                          onClick={() => {
                            // View details implementation would go here
                            alert(`Assignment details for ${assignment.product.name}`);
                          }}
                        >
                          <FileText size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDelete(assignment)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList size={48} className="text-gray-300 mb-2" />
                      <p>No assignments found</p>
                      {(searchQuery || filterProduct || filterClient) && (
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filters
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
      
      {/* New Assignment Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="New Product Assignment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Product</option>
              {products
                .filter(p => p.quantity > 0)
                .map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.quantity} {product.unit}(s) available
                  </option>
                ))
              }
            </select>
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Client</option>
              <optgroup label="Patients">
                {clients
                  .filter(c => c.type === 'patient')
                  .map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.patientId ? `(${client.patientId})` : ''}
                    </option>
                  ))
                }
              </optgroup>
              <optgroup label="Departments">
                {clients
                  .filter(c => c.type === 'department')
                  .map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.departmentId ? `(${client.departmentId})` : ''}
                    </option>
                  ))
                }
              </optgroup>
            </select>
          </div>
          
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            max={selectedProduct?.quantity || 1}
            value={formData.quantity}
            onChange={handleFormChange}
            required
            error={
              selectedProduct && formData.quantity > selectedProduct.quantity 
                ? `Maximum available: ${selectedProduct.quantity}` 
                : undefined
            }
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any additional information about this assignment..."
            />
          </div>
          
          {selectedProduct && (
            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <p className="font-medium text-blue-800">Product Information</p>
              <div className="mt-1 text-blue-700">
                <p>Current Stock: {selectedProduct.quantity} {selectedProduct.unit}(s)</p>
                <p>Expires: {formatDate(selectedProduct.expiryDate)}</p>
                <p>Batch: {selectedProduct.batchNumber}</p>
              </div>
            </div>
          )}
          
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
              disabled={!formData.productId || !formData.clientId || formData.quantity < 1 || (selectedProduct && formData.quantity > selectedProduct.quantity)}
            >
              Assign Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}