// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

// i18n side-effect init
import './i18n/index.ts';

import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import HomePage from '@/pages/public/HomePage';
import ReportPage from '@/pages/public/ReportPage';
import MapPage from '@/pages/public/MapPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const PageLoader = () => (
  <div className="loading-screen">
    <div className="spinner" />
  </div>
);

const PublicLayout = ({ page }: { page: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="main-content">{page}</main>
  </>
);

const App = () => (
  <AuthProvider>
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"       element={<PublicLayout page={<HomePage />} />} />
          <Route path="/report" element={<PublicLayout page={<ReportPage />} />} />
          <Route path="/map"    element={<PublicLayout page={<MapPage />} />} />

          <Route path="/admin/login"     element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />

          <Route
            path="*"
            element={
              <PublicLayout
                page={
                  <div className="not-found">
                    <h1>404</h1>
                    <p>Page not found.</p>
                  </div>
                }
              />
            }
          />
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '10px',
            border: '1px solid #334155',
            fontSize: '14px',
          },
        }}
      />
    </Router>
  </AuthProvider>
);

export default App;
