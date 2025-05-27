import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/auth/LoginForm';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Assignments from './pages/Assignments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Pharmacies from './pages/Pharmacies';
import Invoices from './pages/Invoices';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initializeAuth } from './store/authStore';

function App() {
  // Initialize auth from localStorage on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="clients" element={<Clients />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          
          <Route path="users" element={
            <ProtectedRoute requiredRole="superadmin">
              <Users />
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;