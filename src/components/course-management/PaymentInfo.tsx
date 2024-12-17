import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { enrollmentService } from "@/services/enrollmentService";
import { Spinner } from "@/components/ui/spinner";
import { toast } from 'sonner';

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
      <div className="text-center text-muted-foreground p-8">
        No installment information available
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