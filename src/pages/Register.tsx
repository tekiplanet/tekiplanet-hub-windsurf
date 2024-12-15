import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterForm, RegisterFormData } from "@/components/auth/RegisterForm";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: 'student' | 'business' | 'professional';
  first_name: string;
  last_name: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (data: RegisterFormData) => {
    try {
      // Prepare the data for backend registration
      const registrationData: RegisterFormData = {
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        first_name: data.first_name,
        last_name: data.last_name,
        type: data.type || 'student' // Default to student if not specified
      };

      // Call the registration service
      await authService.register(registrationData);

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      // Handle registration errors
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error; // Re-throw to be caught by the form
    }
  };

  // Only render registration form if not authenticated
  if (isAuthenticated) {
    return null; // Prevents flashing of registration form before redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
};

export default Register;