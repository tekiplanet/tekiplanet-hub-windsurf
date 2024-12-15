import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/store/useAuthStore";

// Debug type
type LoginMethod = (email: string, password: string) => Promise<void>;

interface LoginFormData {
  login: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  console.log('Auth store methods:', Object.keys(authStore));

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      // Destructure login and password from data
      const { login, password } = data;

      console.log('Login credentials:', { login, password });
      console.log('Auth store methods:', Object.keys(authStore));

      // Use the login method from the store
      await authStore.login(login, password);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Login error details:', error);
    }
  };

  // Only render login form if not authenticated
  if (isAuthenticated) {
    return null; // Prevents flashing of login form before redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default Login;