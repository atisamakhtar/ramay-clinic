import React, { useState } from 'react';
import { Plus, Search, Edit, Trash, UserCog, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { formatDate } from '../lib/utils';
import { User } from '../types';
import { useAuthStore } from '../store/authStore';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@medical.com',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Super Admin',
    email: 'superadmin@medical.com',
    role: 'superadmin',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john.doe@medical.com',
    role: 'admin',
    createdAt: '2023-03-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane.smith@medical.com',
    role: 'admin',
    createdAt: '2023-04-10T00:00:00Z'
  }
];

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [users] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Filter users by search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const initialFormState = {
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirmPassword: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  const handleOpenModal = (user?: User) => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: ''
      });
      setSelectedUser(user);
    } else {
      setFormData(initialFormState);
      setSelectedUser(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setShowPassword(false);
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
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    if (!selectedUser && (!formData.password || formData.password.length < 6)) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    // In a real app, we would call an API to create/update the user
    alert(selectedUser ? 'User updated successfully' : 'User created successfully');
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    // In a real app, we would call an API to delete the user
    if (window.confirm('Are you sure you want to delete this user?')) {
      alert('User deleted successfully');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          Add New User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>All Users</CardTitle>
            
            <div className="relative md:w-64 w-full">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-3">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenModal(user)}
                          className="text-green-600"
                          disabled={currentUser?.id === user.id} // Can't edit yourself
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600"
                          disabled={currentUser?.id === user.id} // Can't delete yourself
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UserCog size={48} className="text-gray-300 mb-2" />
                      <p>No users found</p>
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
      
      {/* Add/Edit User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedUser ? 'Edit User' : 'Add New User'}
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
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          
          <div className="relative">
            <Input
              label={selectedUser ? 'New Password (leave blank to keep unchanged)' : 'Password'}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleFormChange}
              required={!selectedUser}
            />
            <button
              type="button"
              className="absolute right-3 top-[34px] text-gray-500 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleFormChange}
              required={!selectedUser || formData.password.length > 0}
              error={
                formData.password !== formData.confirmPassword && formData.confirmPassword
                  ? "Passwords don't match"
                  : undefined
              }
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
            <Button 
              type="submit"
              disabled={
                !formData.name || 
                !formData.email || 
                (!selectedUser && !formData.password) ||
                (formData.password !== formData.confirmPassword && formData.password)
              }
            >
              {selectedUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}