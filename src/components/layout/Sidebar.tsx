import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ClipboardList, 
  BarChart4, 
  Settings,
  UserCog,
  LogOut,
  Building2,
  Receipt
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { 
    title: 'Dashboard', 
    path: '/dashboard', 
    icon: <LayoutDashboard size={20} /> 
  },
  { 
    title: 'Products', 
    path: '/products', 
    icon: <Package size={20} /> 
  },
  { 
    title: 'Clients', 
    path: '/clients', 
    icon: <Users size={20} /> 
  },
  { 
    title: 'Assignments', 
    path: '/assignments', 
    icon: <ClipboardList size={20} /> 
  },
  { 
    title: 'Pharmacies', 
    path: '/pharmacies', 
    icon: <Building2 size={20} /> 
  },
  { 
    title: 'Invoices', 
    path: '/invoices', 
    icon: <Receipt size={20} /> 
  },
  { 
    title: 'Reports', 
    path: '/reports', 
    icon: <BarChart4 size={20} /> 
  },
  { 
    title: 'Users', 
    path: '/users', 
    icon: <UserCog size={20} />, 
    adminOnly: true 
  },
  { 
    title: 'Settings', 
    path: '/settings', 
    icon: <Settings size={20} /> 
  }
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600 flex items-center">
          <span className="bg-blue-600 text-white p-1 rounded mr-2 flex items-center justify-center">
            <Package size={20} />
          </span>
          MedInventory
        </h1>
      </div>
      
      <div className="flex-grow py-6 px-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !isSuperAdmin) return null;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </NavLink>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={logout}
          className="flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
        
        <div className="mt-4 flex items-center px-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user?.name.charAt(0)}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}