import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';  
import { useAuthStore } from '@/store/useAuthStore';
import enrollmentService from '@/services/enrollmentService';
import { courseManagementService } from '@/services/courseManagementService';
import apiClient, { isAxiosError } from '@/lib/axios';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, GraduationCap, FileText, BookOpen, Wallet } from "lucide-react";
import PagePreloader from '@/components/ui/PagePreloader';

// Components for each tab
import PaymentInfo from '@/components/course-management/PaymentInfo';
import CourseContent from '@/components/course-management/CourseContent';
import CourseSchedule from '@/components/course-management/CourseSchedule';
import CourseNotices from '@/components/course-management/CourseNotices';
import ExamSchedule from '@/components/course-management/ExamSchedule';

const CourseManagement: React.FC = () => {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [courseIdState, setCourseId] = React.useState<string | null>(courseId || null);
  const [courseDetails, setCourseDetails] = React.useState<{
    course: any;
    modules: any[];
    lessons: any[];
    exams: any[];
    schedules: any[];
    notices: any[];
    features: any[];
    instructor: any;
    enrollment: {
      id: string;
      status: string;
      progress: number;
      enrolled_at: string;
    } | null;
    installments: any[];
  } | null>(null);

  const [errorMessage, setErrorMessage] = React.useState('');
  // const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);

  const [upcomingExamsCount, setUpcomingExamsCount] = React.useState(0);

  const handleNoticeDelete = React.useCallback((noticeId: string) => {
    setNotices(prevNotices => 
      prevNotices.filter(notice => notice.id !== noticeId)
    );
  }, []);

  const handleUpcomingExamsCountChange = React.useCallback((count: number) => {
    setUpcomingExamsCount(count);
  }, []);


    // Function to calculate upcoming exams
    const calculateUpcomingExams = React.useCallback((exams: any[] = []) => {
      const now = new Date();
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const upcomingExams = exams.filter(exam => {
        const examDate = new Date(exam.date);
        
        // Log details for debugging
        console.log('Upcoming Exams Calculation:', {
          examTitle: exam.title,
          examDate: examDate.toISOString(),
          nowDate: nowDate.toISOString(),
          isUpcoming: examDate >= nowDate
        });
        
        return examDate >= nowDate;
      });
  
      // Set the count of upcoming exams
      setUpcomingExamsCount(upcomingExams.length);
  
      return upcomingExams.length;
    }, []);

  // Add this method near other React.useCallback methods
  const refreshExams = React.useCallback(async () => {
    try {
      if (!courseIdState) return;
  
      const examsResponse = await apiClient.get(`/courses/${courseIdState}/exams`);
      const exams = examsResponse.data;
  
      // Recalculate upcoming exams
      const upcomingCount = calculateUpcomingExams(exams);
  
      // Update course details to reflect new exam state
      if (courseDetails) {
        setCourseDetails(prevDetails => ({
          ...prevDetails!,
          exams: exams
        }));
      }
  
      // Call the callback to update upcoming exams count if provided
      if (handleUpcomingExamsCountChange) {
        handleUpcomingExamsCountChange(upcomingCount);
      }
  
      // Optional: Add a toast to confirm refresh
      toast.success('Exams Refreshed', {
        description: 'Exam schedule has been updated'
      });
  
      return exams;
    } catch (error) {
      console.error('Error refreshing exams:', error);
      toast.error('Failed to Refresh Exams', {
        description: 'Could not update exam schedule'
      });
      
      return [];
    }
  }, [courseIdState, calculateUpcomingExams, courseDetails, handleUpcomingExamsCountChange]);


  // Separate effect to fetch exams
  React.useEffect(() => {
    const fetchCourseExams = async () => {
      try {
        if (!courseIdState) return;

        const examsResponse = await apiClient.get(`/courses/${courseIdState}/exams`);
        const exams = examsResponse.data;

        // Calculate upcoming exams immediately
        calculateUpcomingExams(exams);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    fetchCourseExams();
  }, [courseIdState, calculateUpcomingExams]);

  // React.useEffect(() => {
  //   const fetchCourseDetails = async () => {
  //     setIsLoading(true);
  //     try {
  //       if (!courseIdState) return;

  //       const courseDetails = await courseManagementService.getCourseDetails(courseIdState);
  //       setCourseDetails(courseDetails);
  //       setEnrollment(courseDetails.enrollment);

  //       setIsLoading(false);
  //     } catch (error) {
  //       console.error('Error fetching course details:', error);
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchCourseDetails();
  // }, [courseIdState]);





  // const [enrollment, setEnrollment] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchCourseDetails = async () => {
      setIsLoading(true);
      try {
        if (!courseIdState) return;
  
        const courseDetails = await courseManagementService.getCourseDetails(courseIdState);
        setCourseDetails(courseDetails);
  
        // If enrollment is not in course details, fetch it separately
        if (!courseDetails.enrollment) {
          const enrollmentDetails = await enrollmentService.getUserCourseEnrollment(courseIdState);
          setCourseDetails(prev => ({
            ...prev,
            enrollment: enrollmentDetails
          }));
        }
  
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setIsLoading(false);
        toast.error('Failed to fetch course details');
      }
    };
  
    fetchCourseDetails();
  }, [courseIdState]);



  React.useEffect(() => {
    const fetchCourseNotices = async () => {
      if (!courseId) return;

      try {
        setNoticesLoading(true);
        console.log(`Fetching notices for courseId: ${courseId}`);
        
        const noticesResponse = await courseManagementService.getCourseNotices(courseId);
        
        console.log('Notices Response:', {
          success: noticesResponse.success,
          message: noticesResponse.message,
          noticesCount: noticesResponse.notices?.length,
          noticesDetails: JSON.stringify(noticesResponse.notices, null, 2)
        });
        
        // Sort notices by date, most recent first
        const sortedNotices = (noticesResponse.notices || [])
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setNotices(sortedNotices);
        
        // Log any error message if notices fetch was unsuccessful
        if (!noticesResponse.success) {
          toast.warning(noticesResponse.message || 'Could not fetch all notices', {
            description: 'Falling back to default notifications'
          });
        }
      } catch (error) {
        console.error('Comprehensive Error in fetchCourseNotices:', error);
        toast.error('Failed to load course notices', {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } finally {
        setNoticesLoading(false);
      }
    };

    fetchCourseNotices();
  }, [courseId]);

  // Update the existing course and enrollment logic
  const course = React.useMemo(() => {
    return courseDetails?.course || null;
  }, [courseDetails]);

  const enrollment = React.useMemo(() => {
    // Use the enrollment from courseDetails instead of enrollments
    return courseDetails?.enrollment || null;
  }, [courseDetails]);

  // Debug curriculum
  React.useEffect(() => {
    console.log('Course Object:', course);
  }, [course]);

  // Render Curriculum Section
  const renderCurriculum = () => {
    console.log('Rendering Curriculum - Course:', course);
    
    // Try different possible curriculum paths
    const curriculumData = 
      course?.curriculum || 
      course?.modules || 
      course?.content || 
      course?.courseContent;

    console.log('Curriculum Data:', curriculumData);

    if (!curriculumData || curriculumData.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No curriculum available for this course. 
          <pre className="mt-2 text-xs">{JSON.stringify(course, null, 2)}</pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {curriculumData.map((module, moduleIndex) => (
            <div key={module.id || moduleIndex} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold">
                  Module {moduleIndex + 1}: {module.title || module.name || `Unnamed Module`}
                </h4>
                <span className="text-sm text-muted-foreground">
                  {(module.topics?.length || module.lessons?.length || 0) + " " + 
                   (module.topics ? "Topics" : module.lessons ? "Lessons" : "Items")}
                </span>
              </div>
              
              {/* Handle different curriculum structures */}
              {(module.topics || module.lessons || module.content)?.map((item, itemIndex) => (
                <div 
                  key={item.id || itemIndex} 
                  className="bg-secondary/50 p-3 rounded-md mt-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {item.title || item.name || `Item ${itemIndex + 1}`}
                    </span>
                    {item.duration && (
                      <span className="text-sm text-muted-foreground">
                        {item.duration} min
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // If loading, show preloader
  if (isLoading) {
    return <PagePreloader />;
  }

  // If no course found after loading, show not found
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The course you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/dashboard/academy/my-courses')}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main container with proper padding */}
      <div className="flex-1 px-4 md:px-6 py-4 max-w-[100vw] overflow-x-hidden">
        {/* Header Section with Course Image */}
        <div className="mb-6 flex flex-col md:flex-row items-center gap-6">


          {/* Course Details */}
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold break-words mb-2">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
            <Badge 
              variant={enrollment?.payment_status === 'fully_paid' ? "secondary" : "default"}
              className="mb-2 text-xs"
            >
              {enrollment?.payment_status === 'fully_paid' ? "Tuition Paid" : "Payment Required"}
            </Badge>
            
            {/* Additional Course Info */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Level: {course.level}</span>
              <span>•</span>
              <span>Duration: {course.duration_hours} Months</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">Duration</p>
                  <p className="text-sm font-medium truncate">{course.duration_hours} Months</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Enrolled On</p>
                  <p className="text-sm font-medium">
                    {enrollment?.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Progress</p>
                  <p className="text-sm font-medium">{enrollment?.progress || 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Total Cost</p>
                  <p className="text-sm font-medium">{formatCurrency(Number(course.price))}</p>
                </div>
              </div>
            </div>
            {enrollment?.progress !== undefined && (
              <div className="mt-4">
                <Progress value={enrollment.progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>



        {/* Tabs Section */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="content">
              <BookOpen className="h-4 w-4 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="notices" className="relative">
              <Bell className="h-4 w-4 mr-2" /> Notices
              {notices.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="exams" className="relative">
              <FileText className="h-4 w-4 mr-2" /> Exams
              {upcomingExamsCount > 0 && (
                <span 
                  className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse"
                ></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="payment">
              <Wallet className="h-4 w-4 mr-2" /> Payment
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="content" className="space-y-4">
              {renderCurriculum()}
            </TabsContent>
            <TabsContent value="schedule">
              <CourseSchedule courseId={courseIdState} />
            </TabsContent>
            <TabsContent value="notices">
              <CourseNotices 
                courseId={courseIdState} 
                notices={notices} 
                loading={noticesLoading} 
                onNoticeDelete={handleNoticeDelete} 
              />
            </TabsContent>
            <TabsContent value="exams">
            <ExamSchedule 
              courseId={courseIdState} 
              refreshExams={refreshExams}
              onUpcomingExamsCountChange={handleUpcomingExamsCountChange}
            />
            </TabsContent>
            <TabsContent value="payment">
            {courseIdState && (
  <PaymentInfo courseId={courseIdState} />
)}            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseManagement;