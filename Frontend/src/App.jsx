import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

const Welcome = lazy(() => import('./pages/Welcome'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateCapsule = lazy(() => import('./pages/CreateCapsule'));
const CapsuleDetail = lazy(() => import('./pages/CapsuleDetail'));
const Capsules = lazy(() => import('./pages/Capsules'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Insights = lazy(() => import('./pages/Insights'));
const Milestones = lazy(() => import('./pages/Milestones'));
const AIChat = lazy(() => import('./pages/AIChat'));

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen">
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"><div className="text-white text-xl">Loading...</div></div>}>
                <Routes>
                  <Route path="/" element={
                    <PublicRoute>
                      <Welcome />
                    </PublicRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/capsules"
                    element={
                      <ProtectedRoute>
                        <Capsules />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/capsules/create"
                    element={
                      <ProtectedRoute>
                        <CreateCapsule />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/capsules/edit/:id"
                    element={
                      <ProtectedRoute>
                        <CreateCapsule />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/capsules/:id"
                    element={
                      <ProtectedRoute>
                        <CapsuleDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/insights"
                    element={
                      <ProtectedRoute>
                        <Insights />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/milestones"
                    element={
                      <ProtectedRoute>
                        <Milestones />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <AIChat />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
