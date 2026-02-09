import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { NotFound } from '../pages/NotFound';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Placeholder pages
const Dashboard = () => <div className="p-6"><h1 className="text-3xl font-bold">Dashboard</h1></div>;
const Appointments = () => <div className="p-6"><h1 className="text-3xl font-bold">Appointments</h1></div>;
const Services = () => <div className="p-6"><h1 className="text-3xl font-bold">Services</h1></div>;
const Customers = () => <div className="p-6"><h1 className="text-3xl font-bold">Customers</h1></div>;
const Employees = () => <div className="p-6"><h1 className="text-3xl font-bold">Employees</h1></div>;
const Inventory = () => <div className="p-6"><h1 className="text-3xl font-bold">Inventory</h1></div>;
const Finance = () => <div className="p-6"><h1 className="text-3xl font-bold">Finance</h1></div>;
const Billing = () => <div className="p-6"><h1 className="text-3xl font-bold">Billing</h1></div>;
const Reports = () => <div className="p-6"><h1 className="text-3xl font-bold">Reports</h1></div>;
const Marketing = () => <div className="p-6"><h1 className="text-3xl font-bold">Marketing</h1></div>;
const FurnitureTools = () => <div className="p-6"><h1 className="text-3xl font-bold">Furniture & Tools</h1></div>;

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      {!isAuthenticated ? (
        <>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/services" element={<Services />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/furniture-tools" element={<FurnitureTools />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
