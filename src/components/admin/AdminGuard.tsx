import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return <>{children}</>;
} 