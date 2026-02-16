import { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import type { UserRole } from '../app/authSlice';

interface ModuleCard {
  key: string;
  title: string;
  description: string;
}

const modulesByRole: Record<UserRole, ModuleCard[]> = {
  owner: [
    { key: 'customer', title: 'Customer', description: 'Client profiles, visit history, loyalty and notes.' },
    { key: 'employee', title: 'Employee', description: 'Team management, attendance and work assignments.' },
    { key: 'appointments', title: 'Appointments', description: 'Booking calendar and scheduling operations.' },
    { key: 'services', title: 'Services', description: 'Service catalog, duration and pricing setup.' },
    { key: 'billing', title: 'Billing', description: 'Invoice creation, payments and receipts.' },
    { key: 'inventory', title: 'Inventory', description: 'Stock levels, purchase tracking and alerts.' },
    { key: 'reports', title: 'Reports', description: 'Operational and performance reporting.' },
    { key: 'finance', title: 'Finance', description: 'Profit/loss view, expense tracking and cash flow.' },
    { key: 'marketing', title: 'Marketing', description: 'Campaigns, offers and customer engagement.' },
    { key: 'furniture-tools', title: 'Furniture & Tools', description: 'Asset list, maintenance and availability.' },
  ],
  manager: [
    { key: 'customer', title: 'Customer', description: 'Manage client information and service history.' },
    { key: 'employee', title: 'Employee', description: 'Track staff schedule and team performance.' },
    { key: 'appointments', title: 'Appointments', description: 'Manage bookings and slot utilization.' },
    { key: 'services', title: 'Services', description: 'Update available salon services and rates.' },
    { key: 'billing', title: 'Billing', description: 'Monitor billing status and payment records.' },
    { key: 'inventory', title: 'Inventory', description: 'Maintain stock and product movement.' },
    { key: 'reports', title: 'Reports', description: 'Review operational KPIs.' },
    { key: 'marketing', title: 'Marketing', description: 'Run local campaigns and promotions.' },
    { key: 'furniture-tools', title: 'Furniture & Tools', description: 'Track tools and salon assets.' },
  ],
  employee: [
    { key: 'customer', title: 'Customer', description: 'View customer details required for service.' },
    { key: 'appointments', title: 'Appointments', description: 'Check assigned bookings and daily plan.' },
    { key: 'services', title: 'Services', description: 'Access service details and steps.' },
  ],
};

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);

  const modules = useMemo(() => {
    if (!user) {
      return [];
    }

    return modulesByRole[user.role];
  }, [user]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[#E3E7F6] bg-gradient-to-r from-[#F7F8FF] to-[#EEF2FF] px-5 py-4 shadow-[0_8px_20px_rgba(30,40,90,0.08)]">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to Dashboard</h2>
        <p className="text-slate-600">Access based on your current role permissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <article
            key={module.key}
            className="rounded-2xl border border-[#E3E7F6] bg-white px-5 py-4 shadow-[0_6px_14px_rgba(30,40,90,0.08)] transition-transform hover:-translate-y-0.5"
          >
            <h3 className="text-lg font-semibold text-[#28345F]">{module.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{module.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
