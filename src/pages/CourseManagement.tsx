import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Bell, GraduationCap, FileText, BookOpen, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import courseManagementService from '@/services/courseManagementService';

// Components for each tab
import PaymentInfo from '@/components/course-management/PaymentInfo';
import CourseSchedule from '@/components/course-management/CourseSchedule';
import CourseNotices from '@/components/course-management/CourseNotices';
import ExamSchedule from '@/components/course-management/ExamSchedule';
import CourseContent from '@/components/course-management/CourseContent';

// Import the mockCourses data
import { Course, mockCourses } from "@/data/mockCourses";
import enrollmentService from '@/services/enrollmentService';

const CourseManagement = () => {
  const { courseId } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] = React.useState<{
    course: any;
    modules: any[];
    lessons: any[];
    exams: any[];
    schedules: any[];
    notices: any[];
    features: any[];
    instructor: any;
    enrollment: any;
    installments: any[];
  } | null>(null);

  React.useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseId) {
        try {
          const details = await courseManagementService.getCourseDetails(courseId);
          setCourseDetails(details);
          console.log('Fetched course details:', details);
        } catch (error) {
          console.error('Error fetching course details:', error);
          toast.error('Failed to load course details');
        }
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Update the existing course and enrollment logic
  const course = React.useMemo(() => {
    return courseDetails?.course || null;
  }, [courseDetails]);

  const enrollment = React.useMemo(() => {
    return courseDetails?.enrollment || null;
  }, [courseDetails]);

  // If no course or enrollment found, keep existing not found logic
  if (!course || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The course you're looking for doesn't exist or you're not enrolled.
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
            variant={enrollment.tuitionPaid ? "default" : "secondary"}
            className="mt-2 text-xs"
          >
            {enrollment.tuitionPaid ? "Tuition Paid" : "Payment Required"}
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
                  <p className="text-sm font-medium truncate">{course.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Enrolled On</p>
                  <p className="font-medium">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Progress</p>
                  <p className="font-medium">45% Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Next Exam</p>
                  <p className="font-medium">In 5 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="w-full">
          <Tabs defaultValue="content" className="w-full">
            {/* Make tabs scrollable on mobile */}
            <div className="border-b">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <TabsList className="h-10">
                    <TabsTrigger value="content" className="px-4">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="px-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="notices" className="px-4">
                      <Bell className="h-4 w-4 mr-2" />
                      Notices
                    </TabsTrigger>
                    <TabsTrigger value="exams" className="px-4">
                      <FileText className="h-4 w-4 mr-2" />
                      Exams
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="px-4">
                      <Wallet className="h-4 w-4 mr-2" />
                      Payment
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              <TabsContent value="content">
                <CourseContent courseId={courseId} />
              </TabsContent>
              <TabsContent value="schedule">
                <CourseSchedule courseId={courseId} />
              </TabsContent>
              <TabsContent value="notices">
                <CourseNotices courseId={courseId} />
              </TabsContent>
              <TabsContent value="exams">
                <ExamSchedule courseId={courseId} />
              </TabsContent>
              <TabsContent value="payment">
                <PaymentInfo enrollment={enrollment} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;