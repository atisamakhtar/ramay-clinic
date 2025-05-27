import { create } from 'zustand';
import { User } from '../types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// This is a mock implementation that would be replaced with actual API calls
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Mock login - in a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@medical.com' && password === 'password') {
        const user: User = {
          id: '1',
          name: 'Admin User',
          email: 'admin@medical.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('medInv_user', JSON.stringify(user));
      } else if (email === 'superadmin@medical.com' && password === 'password') {
        const user: User = {
          id: '2',
          name: 'Super Admin',
          email: 'superadmin@medical.com',
          role: 'superadmin',
          createdAt: new Date().toISOString()
        };
        
        set({ user, isAuthenticated: true, isLoading: false });
        localStorage.setItem('medInv_user', JSON.stringify(user));
      } else {
        set({ error: 'Invalid credentials', isLoading: false });
      }
    } catch (err) {
      set({ error: 'Login failed. Please try again.', isLoading: false });
    }
  },
  
  logout: () => {
    localStorage.removeItem('medInv_user');
    set({ user: null, isAuthenticated: false });
  }
}));

// Function to initialize auth from localStorage
export const initializeAuth = () => {
  const user = localStorage.getItem('medInv_user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user) as User;
      useAuthStore.setState({ user: parsedUser, isAuthenticated: true });
    } catch (e) {
      localStorage.removeItem('medInv_user');
    }
  }
};