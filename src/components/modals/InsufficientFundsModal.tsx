import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from 'lucide-react';

interface InsufficientFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredAmount: number;
  currentBalance: number;
  currencySymbol?: string;
  onConfirmPayment?: () => void;
  isProcessingPayment?: boolean;
  selectedPaymentPlan: string;
  courseName: string;
}

const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  open,
  onOpenChange,
  requiredAmount,
  currentBalance,
  currencySymbol = '₦',
  onConfirmPayment,
  isProcessingPayment = false,
  selectedPaymentPlan,
  courseName
}) => {
  const navigate = useNavigate();
  const amountNeeded = requiredAmount - currentBalance;
  const isBalanceSufficient = currentBalance >= requiredAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment Confirmation</DialogTitle>
          <DialogDescription>
            {isBalanceSufficient 
              ? (selectedPaymentPlan === 'full' 
                  ? "Confirm your payment" 
                  : `Confirm your installment payment for ${courseName}`)
              : "Your current wallet balance is insufficient for this transaction."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <div className="flex justify-between">
            <span>Required Amount:</span>
            <span className="font-bold text-primary">
              {formatCurrency(requiredAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Current Wallet Balance:</span>
            <span className={`font-bold ${!isBalanceSufficient ? 'text-destructive' : 'text-primary'}`}>
              {formatCurrency(currentBalance)}
            </span>
          </div>
          {!isBalanceSufficient && (
            <div className="flex justify-between">
              <span>Additional Amount Needed:</span>
              <span className="font-bold text-destructive">
                {formatCurrency(amountNeeded)}
              </span>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between">
          {!isBalanceSufficient ? (
            <div className="flex space-x-2">
              <Button 
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                  navigate('/dashboard/wallet');
                }}
              >
                Fund Wallet
              </Button>
              <Button 
                disabled
                className="text-white hover:text-white/80"
              >
                Insufficient Balance
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onConfirmPayment}
              className="w-full text-white"
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirm Payment'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientFundsModal;
