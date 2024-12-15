import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PaymentInfoProps {
  enrollment: any; // Replace with proper type
}

const PaymentInfo = ({ enrollment }: PaymentInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Enrollment Fee</p>
              <p className="font-medium">{formatCurrency(5000)}</p>
            </div>
            <Badge variant="default">Paid</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Tuition Fee</p>
              <p className="font-medium">{formatCurrency(enrollment.tuitionFee)}</p>
            </div>
            <Badge 
              variant={enrollment.tuitionPaid ? "default" : "secondary"}
              className={!enrollment.tuitionPaid ? 'bg-primary text-white' : ''}
            >
              {enrollment.tuitionPaid ? "Paid" : "Pending"}
            </Badge>
          </div>

          {enrollment.paymentPlan === 'installment' && enrollment.installments && (
            <div className="space-y-4 mt-6">
              <h3 className="font-medium">Installment Details</h3>
              {enrollment.installments.map((installment: any) => (
                <div key={installment.number} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Installment {installment.number}
                    </p>
                    <p className="font-medium">{formatCurrency(installment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(installment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      installment.paid ? "default" : 
                      installment.overdue ? "destructive" : 
                      "secondary"
                    }
                  >
                    {installment.paid ? "Paid" : installment.overdue ? "Overdue" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add payment history table here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentInfo; 