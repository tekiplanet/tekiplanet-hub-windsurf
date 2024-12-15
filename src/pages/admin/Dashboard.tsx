import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EnrolledCourse {
  courseId: string;
  userId: string;
  enrollmentDate: string;
  tuitionPaid: boolean;
  // ... other properties
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem('adminAuth');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    // Load data
    loadData();
  }, [navigate]);

  const loadData = () => {
    // Load enrollments
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    setEnrollments(storedEnrollments);

    // Load users (if you have user data stored)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  const handleClearEnrollments = () => {
    if (window.confirm('Are you sure you want to clear all enrollments?')) {
      localStorage.removeItem('enrollments');
      setEnrollments([]);
      toast.success('All enrollments cleared successfully');
    }
  };

  const handleClearUserEnrollments = (userId: string) => {
    if (window.confirm('Are you sure you want to clear this user\'s enrollments?')) {
      const updatedEnrollments = enrollments.filter(e => e.userId !== userId);
      localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
      setEnrollments(updatedEnrollments);
      toast.success('User enrollments cleared successfully');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrollments.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="destructive" 
            onClick={handleClearEnrollments}
          >
            Clear All Enrollments
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={`${enrollment.userId}-${enrollment.courseId}`}>
                  <TableCell>{enrollment.userId}</TableCell>
                  <TableCell>{enrollment.courseId}</TableCell>
                  <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{enrollment.tuitionPaid ? 'Paid' : 'Pending'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleClearUserEnrollments(enrollment.userId)}
                    >
                      Clear
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 