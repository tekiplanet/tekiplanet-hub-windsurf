import React from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { 
  Clock, Users, Star, BookOpen, ChevronLeft,
  GraduationCap, Calendar, CheckCircle2, PlayCircle,
  Shield, Award, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useWalletStore } from '@/store/useWalletStore';
import { courseService } from '@/services/courseService';
import { useAuthStore } from '@/store/useAuthStore';
import { InsufficientFundsModal } from "@/components/wallet/InsufficientFundsModal";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@/data/mockCourses";

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    courseId: string;
    amount: number;
  };
}

const ENROLLMENT_FEE = 5000;

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const user = useAuthStore((state) => state.user);
  const { 
    getBalance, 
    deductBalance, 
    addTransaction 
  } = useWalletStore();

  // Fetch course details
  const { 
    data: course, 
    isLoading: isCourseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: ['courseDetails', courseId],
    queryFn: () => courseService.getCourseDetails(courseId!),
    enabled: !!courseId
  });

  // Get user's current balance
  const balance = getBalance(user?.id || '');

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = React.useState(false);

  if (isCourseLoading) {
    return <div>Loading course details...</div>;
  }

  if (courseError || !course) {
    return <div>Failed to load course details</div>;
  }

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in this course",
        variant: "destructive"
      });
      return;
    }

    if (balance < ENROLLMENT_FEE) {
      setShowInsufficientFundsModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await courseService.enrollInCourse({
        courseId: courseId!,
        userId: user.id,
        amount: ENROLLMENT_FEE
      });

      if (response.success && response.data) {
        // Deduct enrollment fee
        deductBalance(user.id, ENROLLMENT_FEE);
        
        // Record transaction
        addTransaction(user.id, {
          id: response.data.transactionId,
          type: 'debit',
          amount: ENROLLMENT_FEE,
          description: `Course enrollment: ${course.title}`,
          date: new Date().toISOString()
        });

        // Create enrollment object with all necessary data
        const enrollmentData = {
          courseId: course.id,
          enrollmentDate: new Date().toISOString(),
          transactionId: response.data.transactionId,
          userId: user.id,
          tuitionPaid: false,
          tuitionFee: course.price,
          paymentPlan: 'full' as const, // Explicitly type as 'full' | 'installment'
          progress: 0,
          lastAccessed: new Date().toISOString(),
          nextLesson: course.curriculum?.[0]?.title || "Introduction",
          nextDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        // Get existing enrollments and add new one
        const existingEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        localStorage.setItem('enrollments', JSON.stringify([...existingEnrollments, enrollmentData]));

        toast.success("Successfully enrolled in the course!");

        // Navigate to my courses page with a small delay to ensure data is saved
        setTimeout(() => {
          navigate('/dashboard/academy/my-courses');
        }, 100);
      }
    } catch (error) {
      toast.error("Failed to enroll in course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFundWallet = () => {
    setShowInsufficientFundsModal(false);
    navigate('/dashboard/wallet');
  };

  return (
    <Dashboard>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 pt-0 pb-8 md:py-8">
              {/* Image Container - Full width on mobile, rounded top corners */}
              <div className="relative aspect-[16/9] w-[calc(100%+2rem)] -mx-4 -mt-4 md:mt-0 md:w-full md:mx-0 md:rounded-lg md:overflow-hidden">
                <div className="rounded-t-3xl overflow-hidden md:rounded-lg">
                  <img 
                    src={course.image_url} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Button 
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-4 right-4 text-white hover:text-primary"
                  >
                    <PlayCircle className="h-8 w-8" />
                  </Button>
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {course.category}
                    </Badge>
                    <Badge 
                      variant={
                        course.level === "Beginner" ? "default" :
                        course.level === "Intermediate" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {course.level}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-muted-foreground">
                    {course.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{course.duration_hours} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Students</p>
                      <p className="font-medium">{course.students_count || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium">{course.average_rating || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Level</p>
                      <p className="font-medium">{course.level}</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Card for Mobile */}
                <Card className="md:hidden">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">{formatCurrency(course.price)}</h2>
                        <p className="text-sm text-muted-foreground">Tuition Fee</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment Fee:</span>
                          <span>{formatCurrency(ENROLLMENT_FEE)}</span>
                        </div>
                        <Button 
                          className="w-full text-white"
                          onClick={handleEnroll}
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            "Enroll Now"
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Wallet Balance: {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-[1fr,300px]">
            <div className="space-y-6">
              {/* Course Content Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Online Learning</h3>
                          <p className="text-sm text-muted-foreground">
                            Learn at your own pace
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Lifetime Access</h3>
                          <p className="text-sm text-muted-foreground">
                            Learn on your schedule
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Certificate</h3>
                          <p className="text-sm text-muted-foreground">
                            Upon completion
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">What you'll learn</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {course.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">No features available</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {course.syllabus?.map((item, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className={`rounded-full p-2 ${
                              item.completed 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-secondary'
                            }`}>
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{item.title}</p>
                                <span className="text-sm text-muted-foreground">
                                  {item.duration}
                                </span>
                              </div>
                              {item.completed && (
                                <span className="text-sm text-primary">Completed</span>
                              )}
                            </div>
                          </div>
                        )) || (
                          <p className="text-muted-foreground">No curriculum available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={course.tutor?.avatar} />
                          <AvatarFallback>
                            {course.tutor?.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h3 className="font-semibold">{course.tutor?.name || 'Unknown Instructor'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.tutor?.title || 'Instructor'}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              {course.tutor?.rating || 'N/A'} Rating
                            </div>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                              {course.tutor?.students || 0} Students
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Enrollment Card for Desktop */}
            <div className="hidden md:block">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold">{formatCurrency(course.price)}</h2>
                      <p className="text-sm text-muted-foreground">Tuition Fee</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enrollment Fee:</span>
                        <span>{formatCurrency(ENROLLMENT_FEE)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          size="lg" 
                          className="flex-1"
                          onClick={handleEnroll}
                          disabled={loading}
                        >
                          {loading ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                        <div className="text-xl font-bold">
                          {formatCurrency(course.price)}
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Wallet Balance: {formatCurrency(balance)}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Start Learning Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Self-paced Learning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm">24/7 Course Access</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <InsufficientFundsModal
          open={showInsufficientFundsModal}
          onClose={() => setShowInsufficientFundsModal(false)}
          onFundWallet={handleFundWallet}
          requiredAmount={ENROLLMENT_FEE}
          currentBalance={balance}
          type="enrollment"
        />
      </div>
    </Dashboard>
  );
}