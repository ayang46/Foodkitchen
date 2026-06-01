import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { DishDetail } from './pages/DishDetail';
import { Contact } from './pages/Contact';
import { OrderForm } from './pages/OrderForm';
import { Setup } from './pages/Setup';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageDishes } from './pages/admin/ManageDishes';
import { ManageCategories } from './pages/admin/ManageCategories';
import { ViewOrders } from './pages/admin/ViewOrders';

const AdminEntry: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin />;
};

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Navigate to="/menu" replace />} />
                    <Route path="/menu" element={<Home />} />
                    <Route path="/dish/:id" element={<DishDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/order" element={<OrderForm />} />
                  </Routes>
                </>
              }
            />

            <Route path="/setup" element={<Setup />} />
            <Route path="/admin" element={<AdminEntry />} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dishes"
              element={
                <ProtectedRoute>
                  <ManageDishes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <ManageCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <ViewOrders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}