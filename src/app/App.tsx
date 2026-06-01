import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
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

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dish/:id" element={<DishDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/order" element={<OrderForm />} />
                  </Routes>
                </>
              }
            />

            <Route path="/setup" element={<Setup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/dishes" element={<ManageDishes />} />
                    <Route path="/categories" element={<ManageCategories />} />
                    <Route path="/orders" element={<ViewOrders />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}