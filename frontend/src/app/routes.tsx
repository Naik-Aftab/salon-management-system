import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import ForgotPassword from '../pages/ForgotPassword';
import Login from '../pages/Login';
import AppointmentsPage from '../pages/modules/appointments/AppointmentsPage';
import BillingPage from '../pages/modules/billing/BillingPage';
import CustomerPage from '../pages/modules/customer/CustomerPage';
import EmployeePage from '../pages/modules/employee/EmployeePage';
import FinancePage from '../pages/modules/finance/FinancePage';
import FurnitureToolsPage from '../pages/modules/furniture-tools/FurnitureToolsPage';
import InventoryPage from '../pages/modules/inventory/InventoryPage';
import MarketingPage from '../pages/modules/marketing/MarketingPage';
import ReportsPage from '../pages/modules/reports/ReportsPage';
import ServicesPage from '../pages/modules/services/ServicesPage';
import { NotFound } from '../pages/NotFound';
import Register from '../pages/Register';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/services" element={<ServicesPage />} />

          <Route element={<ProtectedRoute roles={['owner', 'manager']} />}>
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/furniture-tools" element={<FurnitureToolsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['owner']} />}>
            <Route path="/finance" element={<FinancePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
