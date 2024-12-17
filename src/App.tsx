import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PagePreloader from '@/components/ui/PagePreloader';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { ThemeProvider as ThemeStoreProvider } from '@/theme/ThemeProvider';
import { ThemeProvider as ThemeContextProvider } from '@/context/ThemeContext';
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminUsers from "@/pages/admin/Users";
import AdminCourses from "@/pages/admin/Courses";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminSettings from "@/pages/admin/Settings";

// Lazy load pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const TransactionDetails = React.lazy(() => import('@/pages/TransactionDetails'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const CourseManagement = React.lazy(() => import('@/pages/CourseManagement'));
const Services = React.lazy(() => import('@/pages/Services'));
const ServiceQuoteRequest = React.lazy(() => import('@/pages/ServiceQuoteRequest'));
const ITConsulting = React.lazy(() => import('@/pages/ITConsulting'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const PaymentConfirmation = React.lazy(() => import('@/pages/PaymentConfirmation'));
const PaystackCallback = React.lazy(() => import('@/pages/PaystackCallback'));
const CourseDetails = React.lazy(() => import('@/components/academy/CourseDetails'));
const Academy = React.lazy(() => import('@/pages/Academy'));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const { isLoading } = useLoading();

  return (
    <Router>
      {isLoading && <PagePreloader />}
      <Suspense fallback={<PagePreloader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="*" element={<Dashboard />} />
                  <Route path="payment-confirmation" element={<PaymentConfirmation />} />
                  <Route 
                    path="services/quote/:categoryId/:serviceId" 
                    element={
                      <ProtectedRoute>
                        <ServiceQuoteRequest />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/courses/:courseId/manage" element={<CourseManagement />} />
          <Route path="/services" element={<Services />} />
          <Route 
            path="/services/quote/:category/:serviceId" 
            element={<ServiceQuoteRequest />} 
          />
          <Route path="/services/consulting" element={<ITConsulting />} />
          <Route path="/paystack-callback" element={<PaystackCallback />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/course/:courseId" element={<CourseDetails />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <AdminGuard>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            </AdminGuard>
          } />
        </Routes>
      </Suspense>
      <Toaster 
        position="top-right"
        reverseOrder={false}
      />
      <Toaster />
      <Sonner />
    </Router>
  );
};

const App = () => {
  const { isAuthenticated, initialize, theme } = useAuthStore();

  // Apply theme on component mount and when theme changes
  React.useEffect(() => {
    console.log('🎨 Theme Changed:', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    // Call initialize when the app loads
    const initializeApp = async () => {
      console.group('🚀 App Initialization');
      console.log('Authentication State:', {
        isAuthenticated,
        token: localStorage.getItem('token'),
        storedTheme: localStorage.getItem('theme')
      });

      if (isAuthenticated) {
        try {
          const result = await initialize();
          console.log('🔑 Initialization Result:', result);
        } catch (error) {
          console.error('❌ App Initialization Failed:', error);
        }
      } else {
        console.log('❌ Not Authenticated. Skipping initialization.');
      }

      console.groupEnd();
    };

    initializeApp();
  }, [isAuthenticated, initialize]);

  return (
    <ThemeStoreProvider>
      <ThemeContextProvider>
        <QueryClientProvider client={queryClient}>
          <LoadingProvider>
            <TooltipProvider>
              <div className="min-h-screen transition-colors duration-300">
                <AppContent />
              </div>
            </TooltipProvider>
          </LoadingProvider>
        </QueryClientProvider>
      </ThemeContextProvider>
    </ThemeStoreProvider>
  );
};

export default App;