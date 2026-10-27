import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/app.css';

// Route-level code splitting keeps the first load light (charts / PDF libs load on demand)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const Products = lazy(() => import('./pages/Products'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceForm = lazy(() => import('./pages/InvoiceForm'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));
const Payments = lazy(() => import('./pages/Payments'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

function Private({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>
        <Suspense fallback={<LoadingSpinner label="Loading..." />}>{children}</Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
              <Route path="/clients" element={<Private roles={['ADMIN', 'STAFF']}><Clients /></Private>} />
              <Route path="/clients/:id" element={<Private roles={['ADMIN', 'STAFF']}><ClientDetail /></Private>} />
              <Route path="/products" element={<Private roles={['ADMIN', 'STAFF']}><Products /></Private>} />
              <Route path="/invoices" element={<Private><Invoices /></Private>} />
              <Route path="/invoices/new" element={<Private roles={['ADMIN', 'STAFF']}><InvoiceForm /></Private>} />
              <Route path="/invoices/:id" element={<Private><InvoiceDetail /></Private>} />
              <Route path="/invoices/:id/edit" element={<Private roles={['ADMIN', 'STAFF']}><InvoiceForm /></Private>} />
              <Route path="/payments" element={<Private><Payments /></Private>} />
              <Route path="/reports" element={<Private roles={['ADMIN', 'STAFF']}><Reports /></Private>} />
              <Route path="/settings" element={<Private roles={['ADMIN']}><Settings /></Private>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
