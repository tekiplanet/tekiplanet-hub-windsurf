import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from '@/store/useAuthStore';
import { Course, mockCourses } from "@/data/mockCourses";
import { formatCurrency } from "@/lib/utils";
import { 
  Search,
  BookOpen, 
  Clock, 
  Calendar,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Filter,
  SortAsc
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalletStore } from '@/store/useWalletStore';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { enrollmentService } from '@/services/enrollmentService';
import { Loader2 } from 'lucide-react';

interface EnrolledCourse {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  course_image: string;
  enrollment_status: string;
  payment_status: 'not_started' | 'partially_paid' | 'fully_paid' | 'overdue';
  total_tuition: number;
  paid_amount: number;
  installments: {
    id: string;
    amount: number;
    due_date: string;
    status: string;
    paid_at: string | null;
  }[];
}

function PaymentPlanModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  selectedPlan, 
  onPlanChange 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  selectedPlan: 'full' | 'installment' | null;
  onPlanChange: (plan: 'full' | 'installment' | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Payment Plan</DialogTitle>
          <DialogDescription>
            Choose how you would like to pay the tuition fee
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedPlan}
            onValueChange={(value: 'full' | 'installment' | null) => onPlanChange(value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full">
                <div className="font-medium">Full Payment</div>
                <div className="text-sm text-muted-foreground">
                  Pay the entire amount at once
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="installment" id="installment" />
              <Label htmlFor="installment">
                <div className="font-medium">Installment Plan</div>
                <div className="text-sm text-muted-foreground">
                  Pay in two installments over one month
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="text-white">
            Confirm Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const InsufficientFundsModal = ({
  open,
  onOpenChange,
  balance,
  requiredAmount,
  onFundWallet
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number | string;
  requiredAmount: number;
  onFundWallet: () => void;
}) => {
  // Convert balance to number
  const numBalance = Number(balance || 0);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Insufficient Funds</DialogTitle>
          <DialogDescription>
            Your current wallet balance is insufficient for this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Current Balance:</span> ${numBalance.toFixed(2)}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Required Amount:</span> ${requiredAmount.toFixed(2)}
            </div>
            <div className="text-sm text-red-600">
              Shortfall: ${(requiredAmount - numBalance).toFixed(2)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onFundWallet}
          >
            Fund Wallet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function MyCourses() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { 
    getBalance, 
    deductBalance, 
    addTransaction 
  } = useWalletStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<'full' | 'installment' | null>(null);
  const [processingCourse, setProcessingCourse] = useState<EnrolledCourse | null>(null);
  const [showFullPaymentConfirmModal, setShowFullPaymentConfirmModal] = useState(false);
  const [fullPaymentCourse, setFullPaymentCourse] = useState<EnrolledCourse | null>(null);

  // Get user's current balance
  const balance = user?.wallet_balance || 0;

  // Get enrolled courses with details
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoading(true);
        const courses = await enrollmentService.getUserEnrolledCourses();
        setEnrolledCourses(courses);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
        setError('Failed to load courses');
        setIsLoading(false);
        toast.error('Unable to load your courses');
      }
    };

    if (user?.id) {
      fetchEnrolledCourses();
    }
  }, [user?.id]);

  // Filter and sort courses
  const filteredCourses = enrolledCourses
    .filter(enrollment => {
      const matchesSearch = enrollment.course_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" 
        || (statusFilter === "completed" && enrollment.enrollment_status === "completed")
        || (statusFilter === "in-progress" && enrollment.enrollment_status === "in_progress");
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.enrollment_status).getTime() - new Date(a.enrollment_status).getTime();
      }
      if (sortBy === "progress") {
        return (b.paid_amount || 0) - (a.paid_amount || 0);
      }
      return 0;
    });

  const calculateInstallments = (tuitionFee: number, enrollmentDate: string): Installment[] => {
    const firstDueDate = new Date(enrollmentDate);
    firstDueDate.setDate(firstDueDate.getDate() + 7); // 1 week

    const secondDueDate = new Date(enrollmentDate);
    secondDueDate.setMonth(secondDueDate.getMonth() + 1); // 1 month

    const installmentAmount = tuitionFee / 2;

    return [
      {
        number: 1,
        amount: installmentAmount,
        dueDate: firstDueDate.toISOString(),
        paid: false,
        overdue: new Date() > firstDueDate
      },
      {
        number: 2,
        amount: installmentAmount,
        dueDate: secondDueDate.toISOString(),
        paid: false,
        overdue: new Date() > secondDueDate
      }
    ];
  };

  const handlePayment = (enrollment: EnrolledCourse) => {
    setProcessingCourse(enrollment);
    setShowPaymentPlanModal(true);
  };

  const handlePaymentPlanConfirm = () => {
    // Validate that a payment plan is selected
    if (!selectedPaymentPlan) {
      toast.error('Please select a payment plan');
      return;
    }

    // Close payment plan modal
    setShowPaymentPlanModal(false);

    // If full payment is selected, show full payment confirmation
    if (selectedPaymentPlan === 'full') {
      setFullPaymentCourse(processingCourse);
      setShowFullPaymentConfirmModal(true);
    } else {
      // If installment is selected, handle installment logic
      // You can add installment-specific logic here
      toast.info('Installment payment flow to be implemented');
    }

    // Reset state
    setSelectedPaymentPlan(null);
  };

  const handleInstallmentPayment = (enrollment: EnrolledCourse, installmentId: string) => {
    if (!user || !enrollment.installments) return;
    
    const installment = enrollment.installments.find(i => i.id === installmentId);
    if (!installment || installment.status === 'paid') return;

    const installmentAmount = installment.amount;

    if (balance < installmentAmount) {
      setSelectedCourse({
        ...enrollment,
        total_tuition: installmentAmount
      });
      setShowInsufficientFundsModal(true);
      return;
    }

    // Process payment
    deductBalance(user.id, installmentAmount);
    
    // Record transaction
    addTransaction(user.id, {
      id: `TRX-${Date.now()}`,
      type: 'debit',
      amount: installmentAmount,
      description: `Installment payment for ${enrollment.course_title}`,
      date: new Date().toISOString()
    });

    // Update installment status
    const updatedInstallments = enrollment.installments.map(i => 
      i.id === installmentId
        ? { ...i, status: 'paid', paid_at: new Date().toISOString() }
        : i
    );

    // Check if all installments are paid
    const allPaid = updatedInstallments.every(i => i.status === 'paid');

    // Update enrollment
    const updatedEnrollments = enrolledCourses.map(course => 
      course.enrollment_id === enrollment.enrollment_id
        ? { 
            ...course, 
            installments: updatedInstallments,
            payment_status: allPaid ? 'fully_paid' : 'partially_paid',
            paid_amount: course.paid_amount + installmentAmount
          }
        : course
    );

    // Update localStorage
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updatedAllEnrollments = allEnrollments.map((course: EnrolledCourse) =>
      course.enrollment_id === enrollment.enrollment_id
        ? { 
            ...course, 
            installments: updatedInstallments,
            payment_status: allPaid ? 'fully_paid' : 'partially_paid',
            paid_amount: course.paid_amount + installmentAmount
          }
        : course
    );
    localStorage.setItem('enrollments', JSON.stringify(updatedAllEnrollments));
    setEnrolledCourses(updatedEnrollments);

    toast.success(`Installment paid successfully!`);
  };

  const handleFundWallet = () => {
    setShowInsufficientFundsModal(false);
    navigate("/dashboard/wallet");
  };

  const handleFullPaymentConfirm = () => {
    if (!fullPaymentCourse || !user) return;

    const fullAmount = fullPaymentCourse.total_tuition;

    // Check if balance is sufficient
    if (balance < fullAmount) {
      // Set the selected course for insufficient funds modal
      setSelectedCourse({
        ...fullPaymentCourse,
        total_tuition: fullAmount
      });
      
      // Show insufficient funds modal
      setShowInsufficientFundsModal(true);
      setShowFullPaymentConfirmModal(false);
      return;
    }

    // Process full payment
    deductBalance(user.id, fullAmount);
    
    // Record transaction
    addTransaction(user.id, {
      id: `TRX-${Date.now()}`,
      type: 'debit',
      amount: fullAmount,
      description: `Full tuition payment for ${fullPaymentCourse.course_title}`,
      date: new Date().toISOString()
    });

    // Update enrollment with full payment status
    const updatedEnrollments = enrolledCourses.map(course => 
      course.enrollment_id === fullPaymentCourse.enrollment_id
        ? { 
            ...course, 
            payment_status: 'fully_paid',
            paid_amount: fullAmount
          }
        : course
    );

    // Update localStorage
    const allEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updatedAllEnrollments = allEnrollments.map((course: EnrolledCourse) =>
      course.enrollment_id === fullPaymentCourse.enrollment_id
        ? { 
            ...course, 
            payment_status: 'fully_paid',
            paid_amount: fullAmount
          }
        : course
    );
    
    localStorage.setItem('enrollments', JSON.stringify(updatedAllEnrollments));
    setEnrolledCourses(updatedEnrollments);
    
    // Close full payment confirmation modal
    setShowFullPaymentConfirmModal(false);
    setFullPaymentCourse(null);
    
    toast.success("Full tuition payment processed successfully!");
  };

  const FullPaymentConfirmModal = ({ 
    open, 
    onOpenChange, 
    course, 
    onConfirm 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    course: EnrolledCourse | null;
    onConfirm: () => void;
  }) => {
    if (!course) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Confirm Full Tuition Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to pay the full tuition for {course.course_title}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">

            <div className="flex justify-between">
              <span>Total Tuition:</span>
              <span className="font-bold text-primary">
                {formatCurrency(course.total_tuition)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current Wallet Balance:</span>
              <span className={`font-bold ${balance < course.total_tuition ? 'text-destructive' : 'text-primary'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
          <DialogFooter className="flex justify-between">

            {balance < course.total_tuition ? (
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
                onClick={onConfirm} 
                className="text-white"
              >
                Confirm Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Learning Journey</h1>
          <p className="text-muted-foreground">Track your progress and continue learning</p>
        </div>
        <Button onClick={() => navigate('/dashboard/academy')} className="text-white">
          Explore More Courses
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-[1fr,200px,200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Accessed</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                      <span className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                    </div>
                    <div className="h-2 bg-gray-200 animate-pulse" />
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="h-4 w-4 bg-gray-200 animate-pulse" />
                      <div>
                        <p className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                        <p className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="h-4 w-4 bg-gray-200 animate-pulse" />
                      <div>
                        <p className="h-4 w-1/2 bg-gray-200 animate-pulse" />
                        <p className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 text-white"
                      disabled
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">{error}</h3>
              <Button 
                onClick={() => navigate('/dashboard/academy')}
                className="text-white"
              >
                Browse Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((enrollment) => (
            <Card key={enrollment.enrollment_id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Course Image */}
                <div className="relative aspect-video">
                  <img 
                    src={enrollment.course_image}
                    alt={enrollment.course_title}
                    className="object-cover w-full h-full rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge 
                    className="absolute top-4 right-4"
                    variant={enrollment.payment_status === 'fully_paid' ? "default" : "destructive"}
                  >
                    {enrollment.payment_status === 'fully_paid' ? "Paid" : "Payment Required"}
                  </Badge>
                </div>

                {/* Course Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {enrollment.course_title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last accessed {new Date(enrollment.enrollment_status).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="text-primary">{enrollment.paid_amount}%</span>
                    </div>
                    <Progress value={enrollment.paid_amount} className="h-2" />
                  </div>

                  {/* Next Up Section */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Next Lesson</p>
                        <p className="font-medium line-clamp-1">Lesson 1</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Next Deadline</p>
                        <p className="font-medium">
                          {enrollment.installments && enrollment.installments.length > 0 
                            ? new Date(enrollment.installments[0].due_date).toLocaleDateString() 
                            : 'No upcoming deadline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section - Add this before Action Buttons */}
                  {enrollment.payment_status !== 'fully_paid' && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Tuition</p>
                          <p className="text-lg font-bold">{formatCurrency(enrollment.total_tuition)}</p>
                        </div>
                        <Badge variant="destructive">Payment Required</Badge>
                      </div>
                      
                      {enrollment.installments && enrollment.installments.length > 0 ? (
                        enrollment.installments.map((installment) => (
                          <div key={installment.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm">Installment {installment.id}</p>
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
                                {installment.status === 'paid' ? "Paid" : installment.status === 'overdue' ? "Overdue" : "Pending"}
                              </Badge>
                            </div>
                            {installment.status !== 'paid' && (
                              <Button 
                                className="w-full text-white"
                                onClick={() => handleInstallmentPayment(enrollment, installment.id)}
                              >
                                Pay {formatCurrency(installment.amount)}
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <Button 
                          className="w-full text-white"
                          onClick={() => handlePayment(enrollment)}
                        >
                          Select Payment Plan
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      className="flex-1 text-white"
                      onClick={() => navigate(`/dashboard/academy/${enrollment.course_id}/manage`)}
                    >
                      <>
                        Manage Course
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Courses Found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search or filters"
                  : "Start your learning journey by enrolling in a course"}
              </p>
              <Button 
                onClick={() => navigate('/dashboard/academy')}
                className="text-white"
              >
                Browse Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PaymentPlanModal
        open={showPaymentPlanModal}
        onOpenChange={(open) => {
          setShowPaymentPlanModal(open);
          if (!open) {
            setSelectedPaymentPlan(null);
            setProcessingCourse(null);
          }
        }}
        selectedPlan={selectedPaymentPlan}
        onPlanChange={setSelectedPaymentPlan}
        onConfirm={handlePaymentPlanConfirm}
      />

      <InsufficientFundsModal
        open={showInsufficientFundsModal}
        onOpenChange={setShowInsufficientFundsModal}
        balance={balance}
        requiredAmount={selectedCourse?.total_tuition || 0}
        onFundWallet={handleFundWallet}
      />

      <FullPaymentConfirmModal 
        open={showFullPaymentConfirmModal}
        onOpenChange={setShowFullPaymentConfirmModal}
        course={fullPaymentCourse}
        onConfirm={handleFullPaymentConfirm}
      />
    </div>
  );
} 