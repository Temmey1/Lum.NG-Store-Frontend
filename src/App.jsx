import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import { useThemeStore, useProductsStore } from './store';
import './styles/globals.css';

// Note: the admin dashboard used to live at /admin in this same app, guarded
// only by a sessionStorage flag with a hardcoded fallback password. It's now
// a separate deployable app (see /admin in the monorepo root) with real JWT
// auth against the backend, so it can be deployed and scaled independently
// of the storefront.

export default function App() {
  const { initTheme } = useThemeStore();
  const { fetchProducts } = useProductsStore();

  useEffect(() => {
    initTheme();
    fetchProducts();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
