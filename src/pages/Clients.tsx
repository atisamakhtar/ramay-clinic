import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, Users, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useClientStore } from '../store/clientStore';
import { formatDate } from '../lib/utils';
import { Client } from '../types';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Filter clients by search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.patientId && client.patientId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.departmentId && client.departmentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const initialFormState = {
    name: '',
    type: 'patient',
    contactPerson: '',
    contactNumber: '',
    email: '',
    patientId: '',
    departmentId: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  const handleOpenModal = (client?: Client) => {
    if (client) {
      setFormData({
        name: client.name,
        type: client.type,
        contactPerson: client.contactPerson || '',
        contactNumber: client.contactNumber || '',
        email: client.email || '',
        patientId: client.patientId || '',
        departmentId: client.departmentId || ''
      });
      setSelectedClient(client);
    } else {
      setFormData(initialFormState);
      setSelectedClient(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClient) {
      // Update existing client
      updateClient(selectedClient.id, formData);
    } else {
      // Add new client
      addClient(formData as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
    }
    
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          Add New Client
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>All Clients</CardTitle>
            
            <div className="relative md:w-64 w-full">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search clients..."
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
                <TableHead>Type</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          {client.type === 'patient' ? (
                            <User size={16} className="text-blue-600" />
                          ) : (
                            <Users size={16} className="text-blue-600" />
                          )}
                        </div>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.type === 'patient' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {client.type === 'patient' ? 'Patient' : 'Department'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {client.type === 'patient' ? client.patientId : client.departmentId}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{client.contactPerson}</p>
                        <p className="text-gray-500">{client.contactNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(client.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenModal(client)}
                          className="text-green-600"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-gray-300 mb-2" />
                      <p>No clients found</p>
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
      
      {/* Add/Edit Client Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="patient">Patient</option>
              <option value="department">Department</option>
            </select>
          </div>
          
          {formData.type === 'patient' ? (
            <Input
              label="Patient ID"
              name="patientId"
              value={formData.patientId}
              onChange={handleFormChange}
              placeholder="e.g., P10047"
            />
          ) : (
            <Input
              label="Department ID"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleFormChange}
              placeholder="e.g., D003"
            />
          )}
          
          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleFormChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleFormChange}
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
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
              {selectedClient ? 'Save Changes' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}