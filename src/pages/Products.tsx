import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash, AlertCircle, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useProductStore } from '../store/productStore';
import { formatDate, isExpiringSoon, isExpired, isLowStock } from '../lib/utils';
import { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  
  // Filter products by search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddStock = () => {
    if (selectedProduct && newQuantity) {
      const quantity = parseInt(newQuantity);
      if (!isNaN(quantity) && quantity > 0) {
        updateProduct(selectedProduct.id, {
          quantity: selectedProduct.quantity + quantity
        });
        setIsAddStockModalOpen(false);
        setNewQuantity('');
        setSelectedProduct(null);
      }
    }
  };
  
  const handleOpenAddStock = (product: Product) => {
    setSelectedProduct(product);
    setNewQuantity('');
    setIsAddStockModalOpen(true);
  };
  
  const initialFormState = {
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    reorderLevel: 0,
    costPerUnit: 0
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        quantity: product.quantity,
        unit: product.unit,
        manufacturer: product.manufacturer,
        batchNumber: product.batchNumber,
        expiryDate: product.expiryDate.split('T')[0], // Format date for input
        reorderLevel: product.reorderLevel,
        costPerUnit: product.costPerUnit
      });
      setSelectedProduct(product);
    } else {
      setFormData(initialFormState);
      setSelectedProduct(null);
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProduct) {
      // Update existing product
      updateProduct(selectedProduct.id, formData);
    } else {
      // Add new product
      addProduct(formData);
    }
    
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };
  
  // Categories for filter dropdown
  const categories = [...new Set(products.map(p => p.category))];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center md:w-auto w-full"
        >
          <Plus size={18} className="mr-2" />
          Add New Product
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <CardTitle>Inventory Items</CardTitle>
            
            <div className="flex flex-col md:flex-row gap-4 md:w-auto w-full">
              <div className="relative md:w-64 w-full">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative md:w-48">
                <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="pl-10 w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-gray-900">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {isLowStock(product.quantity, product.reorderLevel) ? (
                          <span className="flex items-center text-amber-600">
                            <AlertCircle size={14} className="mr-1" />
                            {product.quantity} {product.unit}
                          </span>
                        ) : (
                          <span>{product.quantity} {product.unit}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isExpired(product.expiryDate) ? (
                        <span className="text-red-600 font-medium">Expired</span>
                      ) : isExpiringSoon(product.expiryDate) ? (
                        <span className="text-amber-600">{formatDate(product.expiryDate)}</span>
                      ) : (
                        formatDate(product.expiryDate)
                      )}
                    </TableCell>
                    <TableCell>{product.manufacturer}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenAddStock(product)}
                          className="text-blue-600"
                        >
                          Add Stock
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenModal(product)}
                          className="text-green-600"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(product.id)}
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
                      <Package size={48} className="text-gray-300 mb-2" />
                      <p>No products found</p>
                      {searchQuery && (
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
      
      {/* Add/Edit Product Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                <option value="Medication">Medication</option>
                <option value="Supplies">Supplies</option>
                <option value="Equipment">Equipment</option>
                <option value="PPE">PPE</option>
                <option value="Lab Supplies">Lab Supplies</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex gap-4">
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity.toString()}
                onChange={handleFormChange}
                required
              />
              <Input
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
                required
                placeholder="e.g., Tablet, Box, Vial"
              />
            </div>
            
            <div className="flex gap-4">
              <Input
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                value={formData.reorderLevel.toString()}
                onChange={handleFormChange}
                required
              />
              <Input
                label="Cost Per Unit"
                name="costPerUnit"
                type="number"
                step="0.01"
                value={formData.costPerUnit.toString()}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <Input
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleFormChange}
              required
            />
            
            <Input
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleFormChange}
              required
            />
            
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
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
              {selectedProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Add Stock Modal */}
      <Modal 
        isOpen={isAddStockModalOpen} 
        onClose={() => setIsAddStockModalOpen(false)} 
        title="Add Stock"
        size="sm"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
              <div className="text-sm text-gray-500 mt-1">
                <p>Current Stock: {selectedProduct.quantity} {selectedProduct.unit}</p>
                <p>Batch: {selectedProduct.batchNumber}</p>
              </div>
            </div>
            
            <Input
              label="Quantity to Add"
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              min="1"
              required
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddStockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStock} 
                disabled={!newQuantity || parseInt(newQuantity) <= 0}
              >
                Add Stock
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}