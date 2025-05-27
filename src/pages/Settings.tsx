import React, { useState } from 'react';
import { Save, Users, Bell, ShieldCheck, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Medical Center',
    contactEmail: 'admin@medicalcenter.org',
    contactPhone: '(555) 123-4567',
    address: '123 Healthcare Ave, Medical City, MC 12345'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    assignmentNotifications: true,
    dailyReports: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30
  });
  
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : parseInt(value)
    }));
  };
  
  const saveSettings = (section: string) => {
    // In a real app, we would save these settings to a backend
    alert(`${section} settings saved successfully`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>
      
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users size={18} className="mr-2 text-blue-600" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Configure your organization information and general settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Organization Name"
            name="organizationName"
            value={generalSettings.organizationName}
            onChange={handleGeneralChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={generalSettings.contactEmail}
              onChange={handleGeneralChange}
            />
            
            <Input
              label="Contact Phone"
              name="contactPhone"
              value={generalSettings.contactPhone}
              onChange={handleGeneralChange}
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={generalSettings.address}
              onChange={handleGeneralChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('General')}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell size={18} className="mr-2 text-amber-600" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure alerts and notifications for inventory events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p className="text-xs text-gray-500">Receive email notifications for important events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Low Stock Alerts</h4>
                <p className="text-xs text-gray-500">Receive alerts when items are below reorder level</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="lowStockAlerts"
                  checked={notificationSettings.lowStockAlerts}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Expiry Alerts</h4>
                <p className="text-xs text-gray-500">Receive alerts for products nearing expiry date</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="expiryAlerts"
                  checked={notificationSettings.expiryAlerts}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Assignment Notifications</h4>
                <p className="text-xs text-gray-500">Receive notifications when products are assigned</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="assignmentNotifications"
                  checked={notificationSettings.assignmentNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daily Reports</h4>
                <p className="text-xs text-gray-500">Receive daily summary reports of inventory status</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="dailyReports"
                  checked={notificationSettings.dailyReports}
                  onChange={handleNotificationChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('Notification')}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck size={18} className="mr-2 text-green-600" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security and access control settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-xs text-gray-500">Require 2FA for all users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecurityChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
              <select
                name="passwordExpiry"
                value={securitySettings.passwordExpiry}
                onChange={handleSecurityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <select
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => saveSettings('Security')}
              className="flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database size={18} className="mr-2 text-purple-600" />
            System Information
          </CardTitle>
          <CardDescription>
            View system information and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">System Version</p>
                <p className="font-medium text-gray-900">MedInventory v1.0.0</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">June 15, 2025</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">Database Status</p>
                <p className="font-medium text-green-600">Connected</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">Storage Used</p>
                <p className="font-medium text-gray-900">145 MB / 1 GB</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">Current User</p>
                <p className="font-medium text-gray-900">{user?.name} ({user?.role})</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-500">Total Products</p>
                <p className="font-medium text-gray-900">124</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}