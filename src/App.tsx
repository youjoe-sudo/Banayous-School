import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { TeacherLayout } from '@/components/layouts/TeacherLayout';

import routes from './routes';

import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <IntersectObserver />
          <Routes>
            {/* Admin routes with AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              {routes
                .filter((route) => route.path.startsWith('/admin'))
                .map((route, index) => {
                  const relativePath = route.path.replace('/admin/', '').replace('/admin', '');
                  return relativePath === '' ? (
                    <Route key={index} index element={route.element} />
                  ) : (
                    <Route key={index} path={relativePath} element={route.element} />
                  );
                })}
            </Route>

            {/* Teacher routes with TeacherLayout */}
            <Route path="/teacher" element={<TeacherLayout />}>
              {routes
                .filter((route) => route.path.startsWith('/teacher'))
                .map((route, index) => {
                  const relativePath = route.path.replace('/teacher/', '').replace('/teacher', '');
                  return relativePath === '' ? (
                    <Route key={index} index element={route.element} />
                  ) : (
                    <Route key={index} path={relativePath} element={route.element} />
                  );
                })}
            </Route>

            {/* Public routes */}
            {routes
              .filter((route) => !route.path.startsWith('/admin') && !route.path.startsWith('/teacher'))
              .map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;
