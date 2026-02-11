import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../app/authSlice';

interface NavItem {
  label: string;
  path: string;
}

interface SidebarProps {
  role: UserRole;
}

const navByRole: Record<UserRole, NavItem[]> = {
  owner: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customers', path: '/customers' },
    { label: 'Employees', path: '/employees' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Services', path: '/services' },
    { label: 'Billing', path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Reports', path: '/reports' },
    { label: 'Finance', path: '/finance' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Furniture & Tools', path: '/furniture-tools' },
  ],
  manager: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customers', path: '/customers' },
    { label: 'Employees', path: '/employees' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Services', path: '/services' },
    { label: 'Billing', path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Reports', path: '/reports' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Furniture & Tools', path: '/furniture-tools' },
  ],
  employee: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customers', path: '/customers' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Services', path: '/services' },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const navItems = navByRole[role];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-100 p-4">
      <h2 className="text-xl font-bold mb-6">Salon SMS</h2>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
