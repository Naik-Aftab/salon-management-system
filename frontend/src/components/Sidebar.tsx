import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Package,
  ReceiptText,
  Scissors,
  Users,
  Wrench,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../app/authSlice';

interface NavItem {
  label: string;
  path: string;
}

interface SidebarProps {
  role: UserRole;
  framed?: boolean;
}

const navByRole: Record<UserRole, NavItem[]> = {
  owner: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customer', path: '/customers' },
    { label: 'Employee', path: '/employees' },
    { label: 'Appointment', path: '/appointments' },
    { label: 'Service', path: '/services' },
    { label: 'Billing', path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Report', path: '/reports' },
    { label: 'Finance', path: '/finance' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Furniture & Tools', path: '/furniture-tools' },
  ],
  manager: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customer', path: '/customers' },
    { label: 'Employee', path: '/employees' },
    { label: 'Appointment', path: '/appointments' },
    { label: 'Service', path: '/services' },
    { label: 'Billing', path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Report', path: '/reports' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Furniture & Tools', path: '/furniture-tools' },
  ],
  employee: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Customer', path: '/customers' },
    { label: 'Appointment', path: '/appointments' },
    { label: 'Service', path: '/services' },
  ],
};

const iconByPath: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/customers': Users,
  '/employees': BriefcaseBusiness,
  '/appointments': CalendarDays,
  '/services': Scissors,
  '/billing': CreditCard,
  '/inventory': Package,
  '/reports': BarChart3,
  '/finance': ReceiptText,
  '/marketing': Megaphone,
  '/furniture-tools': Wrench,
};

export default function Sidebar({ role, framed = false }: SidebarProps) {
  const location = useLocation();
  const navItems = navByRole[role];
  const asideClass = framed
    ? 'h-full w-[214px] shrink-0 overflow-hidden rounded-[30px] bg-gradient-to-b from-[#313B77] to-[#252E63] py-2 text-slate-100 shadow-[7px_0_32px_rgba(32,38,84,0.35)]'
    : 'sticky top-0 z-20 h-screen w-[214px] shrink-0 overflow-hidden rounded-[30px] bg-gradient-to-b from-[#313B77] to-[#252E63] py-2 text-slate-100 shadow-[7px_0_32px_rgba(32,38,84,0.35)]';

  return (
    <aside className={asideClass}>
      <div className="flex h-full flex-col">
        <div className="mb-1.5 px-4">
          <p className="text-center text-xl font-bold leading-none tracking-wide text-white">SMS</p>
        </div>

        <nav className="mt-4 flex-1 space-y-2 overflow-hidden px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = iconByPath[item.path] ?? ClipboardList;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-2 px-3 py-1.5 text-[0.95rem] tracking-[0.1px] transition-all ${
                  isActive
                    ? 'bg-[#364073] text-[#F7D897] shadow-[inset_4px_0_0_0_#F7D897]'
                    : 'text-slate-100/95 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                  className={`${isActive ? 'text-[#F7D897]' : 'text-slate-200 group-hover:text-white'}`}
                />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
