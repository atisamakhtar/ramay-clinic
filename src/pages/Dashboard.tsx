import React from 'react';
import { Activity, AlertTriangle, Package, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useProductStore } from '../store/productStore';
import { useClientStore } from '../store/clientStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { useActivityStore } from '../store/activityStore';
import { formatDate, isExpiringSoon, isLowStock } from '../lib/utils';

export default function Dashboard() {
  const { products } = useProductStore();
  const { clients } = useClientStore();
  const { assignments } = useAssignmentStore();
  const { logs } = useActivityStore();

  // Calculate stats
  const lowStockItems = products.filter(p => isLowStock(p.quantity, p.reorderLevel));
  const expiringItems = products.filter(p => isExpiringSoon(p.expiryDate, 90));
  const recentAssignments = assignments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  const recentActivities = logs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <Users size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <h3 className="text-2xl font-bold text-gray-900">{clients.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 mr-4">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-900">{lowStockItems.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <Calendar size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <h3 className="text-2xl font-bold text-gray-900">{expiringItems.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity size={18} className="mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((log) => (
                  <div key={log.id} className="flex items-start pb-3 border-b border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                      {log.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{log.details}</p>
                      <p className="text-xs text-gray-500">
                        {log.user.name} • {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity to display.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp size={18} className="mr-2 text-green-600" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start pb-3 border-b border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                      {assignment.product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{assignment.quantity} {assignment.product.unit}(s)</span> of{' '}
                        <span className="font-medium">{assignment.product.name}</span> assigned to{' '}
                        <span className="font-medium">{assignment.client.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        By {assignment.assignedBy.name} • {formatDate(assignment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent assignments to display.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Low Stock and Expiring Soon Alerts */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle size={18} className="mr-2 text-amber-500" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {lowStockItems.length > 0 && (
                <div className="pb-4">
                  <h4 className="font-medium text-sm mb-2 text-amber-600">Low Stock Items</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockItems.slice(0, 3).map((product) => (
                      <div key={product.id} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Current: {product.quantity}</span>
                          <span>Reorder: {product.reorderLevel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lowStockItems.length > 3 && (
                    <p className="text-xs text-amber-600 mt-2">
                      +{lowStockItems.length - 3} more low stock items
                    </p>
                  )}
                </div>
              )}
              
              {expiringItems.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-medium text-sm mb-2 text-red-600">Expiring Soon</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiringItems.slice(0, 3).map((product) => (
                      <div key={product.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Batch: {product.batchNumber}</span>
                          <span>Expires: {formatDate(product.expiryDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {expiringItems.length > 3 && (
                    <p className="text-xs text-red-600 mt-2">
                      +{expiringItems.length - 3} more expiring items
                    </p>
                  )}
                </div>
              )}
              
              {lowStockItems.length === 0 && expiringItems.length === 0 && (
                <p className="text-gray-500 text-sm py-4">No alerts at this time. Inventory is in good condition.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}