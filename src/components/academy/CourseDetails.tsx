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
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { courseService } from '@/services/courseService';
import { settingsService } from '@/services/settingsService';
import { enrollmentService } from '@/services/enrollmentService';
import { InsufficientFundsModal } from "@/components/wallet/InsufficientFundsModal";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@/data/mockCourses";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    courseId: string;
    amount: number;
  };
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const user = useAuthStore((state) => state.user);
  
  const walletBalance = user?.wallet_balance || 0;
  
  // Manually initialize wallet balance if not set
  React.useEffect(() => {
    if (user && (!user.wallet_balance || user.wallet_balance === 0)) {
      // Fetch initial balance from backend or set a default
      const fetchInitialBalance = async () => {
        try {
          const response = await apiClient.get('/api/user/wallet-balance');
          const initialBalance = response.data.balance;
          // walletStore.addBalance(user.id, initialBalance);
        } catch (error) {
          console.error('Failed to fetch initial balance', error);
          // Set a default balance if fetch fails
          // walletStore.addBalance(user.id, 1000); // Default to 1000
        }
      };

      fetchInitialBalance();
    }
  }, [user]);
  
  console.log('User:', user);
  console.log('Wallet Balance:', walletBalance);

  const [ENROLLMENT_FEE, setENROLLMENT_FEE] = React.useState(1000);
  const [DEFAULT_CURRENCY, setDEFAULT_CURRENCY] = React.useState('USD');

  React.useEffect(() => {
    const fetchSettings = async () => {
      const enrollmentFee = await settingsService.getSetting('enrollment_fee');
      const defaultCurrency = await settingsService.getSetting('default_currency');
      
      setENROLLMENT_FEE(enrollmentFee || 1000);
      setDEFAULT_CURRENCY(defaultCurrency || 'USD');
    };

    fetchSettings();
  }, []);

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

  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = React.useState(false);
  const [showConfirmEnrollmentModal, setShowConfirmEnrollmentModal] = React.useState(false);

  // Render Curriculum Section
  const renderCurriculum = () => {
    if (!course || !course.curriculum || course.curriculum.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No curriculum available for this course.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {course.curriculum.map((module, moduleIndex) => (
            <div key={module.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold">
                  Module {moduleIndex + 1}: {module.title}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {module.topics?.length || 0} Topics
                </span>
              </div>
              
              {module.topics && module.topics.length > 0 && (
                <div className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <div 
                      key={topic.id} 
                      className="bg-secondary/50 p-3 rounded-md"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">
                          Topic {topicIndex + 1}: {topic.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {topic.lessons?.length || 0} Lessons
                        </span>
                      </div>
                      
                      {topic.lessons && topic.lessons.length > 0 && (
                        <ul className="pl-4 mt-2 space-y-1 text-sm">
                          {topic.lessons.map((lesson, lessonIndex) => (
                            <li 
                              key={lesson.id} 
                              className="list-disc list-inside"
                            >
                              Lesson {lessonIndex + 1}: {lesson.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInstructor = () => {
    if (!course || !course.instructor) {
      return (
        <div className="text-center text-muted-foreground">
          No instructor information available.
        </div>
      );
    }

    const { first_name, last_name, bio, avatar } = course.instructor;
    const fullName = `${first_name} ${last_name}`;

    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <Avatar className="w-24 h-24">
          <AvatarImage 
            src={avatar || '/default-avatar.png'} 
            alt={fullName} 
          />
          <AvatarFallback>
            {first_name[0]}{last_name[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h3 className="text-xl font-bold">{fullName}</h3>
          <p className="text-muted-foreground text-sm mt-2">
            {bio || 'No bio available'}
          </p>
        </div>
      </div>
    );
  };

  if (isCourseLoading) {
    return (
      <Dashboard>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
        </div>
      </Dashboard>
    );
  }

  if (courseError || !course) {
    return (
      <Dashboard>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <p className="text-2xl text-muted-foreground mb-4">Course Not Found</p>
          <p className="text-muted-foreground mb-6">
            The course you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Button onClick={() => navigate('/dashboard/academy')}>
            Back to Courses
          </Button>
        </div>
      </Dashboard>
    );
  }

  const handleConfirmEnrollment = async () => {
    if (!user || !course) {
      toast.error('Please log in to enroll');
      return;
    }

    // Check wallet balance first
    if (walletBalance < ENROLLMENT_FEE) {
      setShowInsufficientFundsModal(true);
      return;
    }

    // Check if already enrolled
    try {
      const existingEnrollments = await enrollmentService.getUserEnrollments();
      const isAlreadyEnrolled = existingEnrollments.some(
        enrollment => enrollment.course_id === courseId
      );

      if (isAlreadyEnrolled) {
        toast.info('You are already enrolled in this course', {
          description: 'Continue learning in My Courses'
        });
        setShowConfirmEnrollmentModal(false);
        return;
      }
    } catch (error) {
      console.error('Error checking existing enrollments:', error);
    }

    // Proceed with enrollment
    setLoading(true);
    try {
      const response: EnrollmentResponse = await enrollmentService.enrollInCourse(courseId!);

      if (response.success) {
        // Deduct enrollment fee from wallet
        const { deductBalance } = useWalletStore.getState();
        deductBalance(user.id, ENROLLMENT_FEE);

        toast.success('Course Enrollment Successful!', {
          description: `You are now enrolled in ${course.title}`
        });

        // Navigate to My Courses
        navigate('/dashboard/academy/my-courses');
      } else {
        toast.error(response.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('An unexpected error occurred during enrollment');
    } finally {
      setLoading(false);
      setShowConfirmEnrollmentModal(false);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      toast.error('Please log in to enroll');
      return;
    }

    if (walletBalance < ENROLLMENT_FEE) {
      setShowInsufficientFundsModal(true);
      return;
    }

    // Show confirmation modal instead of directly enrolling
    setShowConfirmEnrollmentModal(true);
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
                      <p className="font-medium">{course.duration_hours} Months</p>
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
                        <h2 className="text-2xl font-bold">{formatCurrency(course.price, DEFAULT_CURRENCY)}</h2>
                        <p className="text-sm text-muted-foreground">Tuition Fee</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment Fee:</span>
                          <span>{formatCurrency(ENROLLMENT_FEE, DEFAULT_CURRENCY)}</span>
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
                          Wallet Balance: {formatCurrency(walletBalance, DEFAULT_CURRENCY)}
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
                  <Card>
                    {/* <CardContent className="p-6">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">What you'll learn</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {course.features && course.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              <span className="text-sm text-primary">{feature.feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent> */}
                  </Card>
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
                      {(course.features?.length ? course.features : [
                        "Comprehensive understanding of core concepts",
                        "Practical skills through hands-on projects",
                        "Industry-relevant techniques and best practices",
                        "Professional tools and technologies",
                        "Problem-solving and critical thinking skills",
                        "Preparation for real-world challenges"
                      ])?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum">
                  {renderCurriculum()}
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="p-6">
                      {renderInstructor()}
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
                      <h2 className="text-3xl font-bold">{formatCurrency(course.price, DEFAULT_CURRENCY)}</h2>
                      <p className="text-sm text-muted-foreground">Tuition Fee</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enrollment Fee:</span>
                        <span>{formatCurrency(ENROLLMENT_FEE, DEFAULT_CURRENCY)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          size="lg" 
                          className="flex-1"
                          onClick={() => setShowConfirmEnrollmentModal(true)}
                          disabled={loading}
                        >
                          {loading ? 'Enrolling...' : 'Enroll Now'}
                        </Button>

                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Wallet Balance: {formatCurrency(walletBalance, DEFAULT_CURRENCY)}
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

        {showConfirmEnrollmentModal && (
          <Dialog open={showConfirmEnrollmentModal} onOpenChange={setShowConfirmEnrollmentModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Enrollment</DialogTitle>
                <DialogDescription>
                  Are you sure you want to enroll in {course.title}? 
                  An enrollment fee of {formatCurrency(ENROLLMENT_FEE, DEFAULT_CURRENCY)} will be deducted from your wallet.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmEnrollmentModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmEnrollment} 
                  disabled={loading}
                >
                  {loading ? 'Enrolling...' : 'Confirm Enrollment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <InsufficientFundsModal
          open={showInsufficientFundsModal}
          onClose={() => setShowInsufficientFundsModal(false)}
          onFundWallet={handleFundWallet}
          requiredAmount={ENROLLMENT_FEE}
          currentBalance={walletBalance}
          type="enrollment"
        />
      </div>
    </Dashboard>
  );
}