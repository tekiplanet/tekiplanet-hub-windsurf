import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface InsufficientFundsModalProps {
  open: boolean;
  onClose: () => void;
  onFundWallet: () => void;
  requiredAmount: number;
  currentBalance: number;
  type?: 'enrollment' | 'tuition';
}

export const InsufficientFundsModal = ({
  open,
  onClose,
  onFundWallet,
  requiredAmount,
  currentBalance,
  type = 'enrollment'
}: InsufficientFundsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insufficient Balance</DialogTitle>
          <DialogDescription>
            You don't have enough funds to pay the {type} fee.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Required Amount:</span>
              <span className="font-medium">{formatCurrency(requiredAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Balance:</span>
              <span className="font-medium">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Shortfall:</span>
              <span className="font-medium text-destructive">
                {formatCurrency(requiredAmount - currentBalance)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onFundWallet}>
            Fund Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 