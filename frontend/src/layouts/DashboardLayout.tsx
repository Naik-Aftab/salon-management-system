import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/services', label: 'Services' },
    { path: '/customers', label: 'Customers' },
    { path: '/employees', label: 'Employees' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/finance', label: 'Finance' },
    { path: '/billing', label: 'Billing' },
    { path: '/reports', label: 'Reports' },
    { path: '/marketing', label: 'Marketing' },
    { path: '/furniture-tools', label: 'Furniture & Tools' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg overflow-y-auto pb-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold">SMS</h1>
        </div>
        <nav className="space-y-1 px-4">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="block w-full text-left px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="fixed bottom-0 w-64 p-4 border-t border-gray-800 bg-gray-900">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as:</p>
            <p className="font-medium truncate">{user?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors text-white font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          </div>
        </header>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
