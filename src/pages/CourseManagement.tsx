import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';  
import { useAuthStore } from '@/store/useAuthStore';
import enrollmentService from '@/services/enrollmentService';
import { courseManagementService } from '@/services/courseManagementService';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Bell, GraduationCap, FileText, BookOpen, Wallet } from "lucide-react";

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
  const [enrollments, setEnrollments] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Fetch user's enrollments first
        const fetchedEnrollments = await enrollmentService.getUserEnrollments();
        
        // Ensure fetchedEnrollments is an array
        const enrollmentsArray = Array.isArray(fetchedEnrollments) 
          ? fetchedEnrollments 
          : fetchedEnrollments.enrollments || fetchedEnrollments.data || [];
        
        setEnrollments(enrollmentsArray);

        // Log all available enrollment IDs for debugging
        console.log('Available Enrollment IDs:', enrollmentsArray.map(e => e.id || e.enrollment_id));
        console.log('Current Course ID:', courseIdState);

        // Check if the current course is in the user's enrollments
        const isEnrolled = enrollmentsArray.some(
          enrollment => 
            enrollment.course_id === courseIdState &&
            enrollment.enrollment_status === 'active'
        );

        if (!isEnrolled) {
          console.warn('User is not enrolled in this course or enrollment is not active');
          console.warn('Enrollments:', JSON.stringify(enrollmentsArray, null, 2));
          console.warn('Current Course ID:', courseIdState);
          setErrorMessage('You are not enrolled in this course or your enrollment is not active');
          return;
        }

        if (courseIdState) {
          console.log(`Fetching details for course: ${courseIdState}`);
          const details = await courseManagementService.getCourseDetails(courseIdState);
          setCourseDetails(details);
          console.log('Fetched course details:', details);
        } else {
          console.warn('No course ID provided');
        }
      } catch (error) {
        console.error('Error in fetchCourseDetails:', error);
        
        // More detailed error handling
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('An unexpected error occurred');
        }
        toast.error('Failed to load course details');
      }
    };

    fetchCourseDetails();
  }, [courseIdState]);  

  // Update the existing course and enrollment logic
  const course = React.useMemo(() => {
    return courseDetails?.course || null;
  }, [courseDetails]);

  const enrollment = React.useMemo(() => {
    // Find the enrollment for the current course
    return enrollments.find(
      enrollment => enrollment.course_id === courseIdState
    ) || null;
  }, [enrollments, courseIdState]);

  // If no course found, keep existing not found logic
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
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold break-words">{course.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
          <Badge 
            variant={enrollment?.payment_status === 'fully_paid' ? "default" : "secondary"}
            className="mt-2 text-xs"
          >
            {enrollment?.payment_status === 'fully_paid' ? "Tuition Paid" : "Payment Required"}
          </Badge>
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
                  <p className="text-sm font-medium truncate">{course.duration_hours} hours</p>
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
            <TabsTrigger value="notices">
              <Bell className="h-4 w-4 mr-2" /> Notices
            </TabsTrigger>
            <TabsTrigger value="exams">
              <FileText className="h-4 w-4 mr-2" /> Exams
            </TabsTrigger>
            <TabsTrigger value="payment">
              <Wallet className="h-4 w-4 mr-2" /> Payment
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="content">
              <CourseContent courseId={courseIdState} />
            </TabsContent>
            <TabsContent value="schedule">
              <CourseSchedule courseId={courseIdState} />
            </TabsContent>
            <TabsContent value="notices">
              <CourseNotices courseId={courseIdState} />
            </TabsContent>
            <TabsContent value="exams">
              <ExamSchedule courseId={courseIdState} />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentInfo enrollment={enrollment} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseManagement;