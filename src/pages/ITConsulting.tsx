import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Wallet,
  BrainCircuit,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWalletStore } from '@/store/useWalletStore';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InsufficientFundsModal } from "@/components/wallet/InsufficientFundsModal";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const HOURLY_RATE = 10000; // ₦10,000 per hour

// Mock available time slots (in a real app, this would come from an API)
const AVAILABLE_SLOTS = [
  {
    date: "2024-03-20",
    slots: ["09:00", "11:00", "14:00", "16:00"]
  },
  {
    date: "2024-03-21",
    slots: ["10:00", "13:00", "15:00"]
  },
  {
    date: "2024-03-22",
    slots: ["09:00", "12:00", "14:00", "16:00"]
  },
  {
    date: "2024-03-23",
    slots: ["11:00", "13:00", "15:00"]
  },
  {
    date: "2024-03-24",
    slots: ["10:00", "14:00", "16:00"]
  }
];

export default function ITConsulting() {
  const [hours, setHours] = useState(1);
  const user = useAuthStore(state => state.user);
  const { 
    getBalance, 
    deductBalance, 
    addTransaction 
  } = useWalletStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const balance = getBalance(user?.id || '');

  const totalCost = hours * HOURLY_RATE;

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select Appointment Time",
        description: "Please select your preferred appointment date and time.",
        variant: "destructive"
      });
      return;
    }

    if (balance < totalCost) {
      setShowInsufficientFundsModal(true);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process payment
      deductBalance(user.id, totalCost);
      
      // Add transaction record
      addTransaction(user.id, {
        id: `CONS-${Date.now()}`,
        type: 'debit',
        amount: totalCost,
        description: `Consulting Session Booking (${hours} hours) - ${selectedDate} ${selectedTime}`,
        date: new Date().toISOString()
      });

      toast({
        title: "Session Booked Successfully",
        description: `Your ${hours}-hour consulting session has been scheduled for ${selectedDate} at ${selectedTime}.`,
      });

      // Navigate to confirmation or dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to process your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = () => {
    setShowInsufficientFundsModal(false);
    navigate('/dashboard/wallet');
  };

  const ScheduleModal = () => {
    return (
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Appointment Time</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="space-y-6 pr-4">
              {AVAILABLE_SLOTS.map((day) => {
                const date = new Date(day.date);
                const isSelected = selectedDate === day.date;
                
                return (
                  <div key={day.date} className="space-y-3">
                    <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2">
                      <h3 className="font-medium">
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {day.slots.map((time) => {
                        const isTimeSelected = selectedDate === day.date && selectedTime === time;
                        
                        return (
                          <Button
                            key={`${day.date}-${time}`}
                            variant={isTimeSelected ? "default" : "outline"}
                            className={cn(
                              "h-auto py-3",
                              isTimeSelected && "border-primary"
                            )}
                            onClick={() => {
                              setSelectedDate(day.date);
                              setSelectedTime(time);
                              setShowScheduleModal(false);
                            }}
                          >
                            <div className="text-sm">
                              <p className="font-medium">{time}</p>
                              <p className="text-xs text-muted-foreground">
                                {parseInt(time) < 12 ? 'AM' : 'PM'}
                              </p>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-4xl space-y-6"
    >
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <Badge variant="secondary">Expert Consultation</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Book an IT Consulting Session</h1>
          <p className="text-muted-foreground max-w-2xl">
            Get personalized guidance from our expert consultants. Whether you need 
            technical advice, project planning, or strategic insights, we're here to help.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Configure your consulting session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hours Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Number of Hours</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(h => Math.max(1, h - 1))}
                    disabled={hours <= 1}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setHours(h => Math.min(10, h + 1))}
                    disabled={hours >= 10}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    hour{hours > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Add Appointment Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Appointment Time</label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowScheduleModal(true)}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedDate && selectedTime ? (
                      <span>
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })} at {selectedTime}
                      </span>
                    ) : (
                      "Select Date & Time"
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">1-on-1 Session</p>
                    <p className="text-muted-foreground">Direct expert access</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Follow-up Support</p>
                    <p className="text-muted-foreground">24hr post-session</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Duration</span>
                  <span>{hours} hour{hours > 1 ? 's' : ''}</span>
                </div>
                <Progress value={(hours / 10) * 100} />
              </div>
            </CardContent>
          </Card>

          {/* Mobile Price Card */}
          <Card className="md:hidden">
            <CardContent className="p-6">
              <PriceContent 
                hours={hours}
                totalCost={totalCost}
                balance={balance}
                loading={loading}
                onBook={handleBookSession}
              />
            </CardContent>
          </Card>
        </div>

        {/* Desktop Price Card */}
        <div className="hidden md:block">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <PriceContent 
                hours={hours}
                totalCost={totalCost}
                balance={balance}
                loading={loading}
                onBook={handleBookSession}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleModal />
      <InsufficientFundsModal
        open={showInsufficientFundsModal}
        onClose={() => setShowInsufficientFundsModal(false)}
        onFundWallet={handleFundWallet}
        requiredAmount={totalCost}
        currentBalance={balance}
        type="enrollment"
      />
    </motion.div>
  );
}

interface PriceContentProps {
  hours: number;
  totalCost: number;
  balance: number;
  loading: boolean;
  onBook: () => void;
}

function PriceContent({ hours, totalCost, balance, loading, onBook }: PriceContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{formatCurrency(totalCost)}</h2>
        <p className="text-sm text-muted-foreground">Total Cost</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Rate per Hour:</span>
          <span>{formatCurrency(HOURLY_RATE)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Duration:</span>
          <span>{hours} hour{hours > 1 ? 's' : ''}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-sm font-medium">
          <span>Total:</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          className="w-full text-white" 
          onClick={onBook}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <span className="flex items-center">
              Book Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <span>Wallet Balance: {formatCurrency(balance)}</span>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Secure Booking</p>
              <p className="text-muted-foreground">
                Your session will be confirmed instantly after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
