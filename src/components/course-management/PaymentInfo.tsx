import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { enrollmentService } from "@/services/enrollmentService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from 'sonner';
import { AlertTriangle, CreditCard, HelpCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';




interface Installment {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at?: string;
}

interface PaymentInfoProps {
  courseId: string;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ courseId }) => {

  const navigate = useNavigate();

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        setIsLoading(true);
        const data = await enrollmentService.getCourseInstallments(courseId);
        setInstallments(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching installments:', err);
        setError('Failed to load payment information');
        setIsLoading(false);
        toast.error('Error', { description: 'Failed to load payment information' });
      }
    };

    fetchInstallments();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-8">
        {error}
      </div>
    );
  }

  if (installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
        <div className="bg-yellow-100 rounded-full p-4 mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Tuition Fee Not Paid
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          You have not completed the payment for this course. 
          Please proceed to My Courses page to make payment.
        </p>
        <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => {
            navigate('/dashboard/academy/my-courses');
              }}>
            <BookOpen className="mr-2 h-4 w-4" /> My Courses
      </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {installments.map((installment) => (
            <div key={installment.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Installment {installment.id}
                </p>
                <p className="font-medium">{formatCurrency(installment.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(installment.due_date).toLocaleDateString()}
                </p>
              </div>
              <Badge 
                variant={
                  installment.status === 'paid' ? "default" : 
                  installment.status === 'overdue' ? "destructive" : 
                  "secondary"
                }
              >
                {installment.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentInfo;