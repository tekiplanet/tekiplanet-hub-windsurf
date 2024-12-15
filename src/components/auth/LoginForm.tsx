import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormData {
  login: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const handleFormSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err: any) {
      // Specific handling for rate limiting error
      if (err.message.includes('Too many login attempts')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else {
        // Default error handling
        setError(err.message || 'Login failed. Please check your credentials.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={handleSubmit(handleFormSubmit)} 
          className="space-y-4"
          noValidate
          autoComplete="off"
        >
          <div className="space-y-2">
            <Label htmlFor="login">Username or Email</Label>
            <Input
              id="login"
              type="text"
              {...register('login', { 
                required: 'Username or email is required',
                validate: (value) => {
                  // Basic validation to check if it's an email or username
                  const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
                  const isUsername = /^[a-zA-Z0-9_]{3,20}$/.test(value);
                  
                  return isEmail || isUsername || 'Invalid username or email';
                }
              })}
              placeholder="Enter your username or email"
            />
            {errors.login && (
              <p className="text-sm text-red-500">{errors.login.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" onClick={() => navigate('/register')}>
              Register
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};