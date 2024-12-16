import apiClient, { isAxiosError } from '@/lib/axios';

export interface Enrollment {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  course_image: string;
  enrollment_status: 'active' | 'completed' | 'dropped';
  payment_status: 'not_started' | 'partially_paid' | 'fully_paid' | 'overdue';
  total_tuition: number;
  paid_amount: number;
  progress: number;
  lastAccessed: string;
  nextLesson: string;
  nextDeadline: string;
  paymentPlan: 'full' | 'installment';
  installments: {
    id: string;
    amount: number;
    due_date: string;
    status: string;
    paid_at: string | null;
  }[];
  course: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
}

export interface EnrolledCourse {
  course: any;
  progress: number;
  lastAccessed: string;
  nextLesson: string;
  nextDeadline: string;
}

export const enrollmentService = {
  async enrollInCourse(courseId: string) {
    try {
      // First, check if already enrolled
      const existingEnrollments = await this.getUserEnrollments();
      const isAlreadyEnrolled = existingEnrollments.some(
        enrollment => enrollment.course_id === courseId
      );

      if (isAlreadyEnrolled) {
        return {
          success: false,
          message: 'You are already enrolled in this course',
          data: null
        };
      }

      // Proceed with enrollment if not already enrolled
      const response = await apiClient.post('/api/enrollments/enroll', { course_id: courseId });
      
      return {
        success: true,
        message: 'Successfully enrolled in the course',
        data: {
          transactionId: response.data.enrollment_id,
          courseId: courseId,
          amount: response.data.enrollment_fee || 1000
        }
      };
    } catch (error) {
      if (isAxiosError(error)) {
        // Check for specific error codes or messages
        if (error.response?.status === 409) {
          return {
            success: false,
            message: 'You are already enrolled in this course',
            data: null
          };
        }
        
        throw new Error(error.response?.data.message || 'Failed to enroll in course');
      }
      throw error;
    }
  },

  async getUserEnrollments() {
    try {
      const response = await apiClient.get('/api/enrollments');
      return response.data.enrollments;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data.message || 'Failed to fetch enrollments');
      }
      throw error;
    }
  },

  async getUserEnrolledCourses() {
    try {
      console.log('Attempting to fetch enrolled courses');
      const response = await apiClient.get('/api/courses/enrolled');
      
      console.log('Enrolled courses response:', response.data);
      
      // Map the backend response to the expected frontend format
      const enrolledCourses = response.data.enrollments.map((enrollment: any) => {
        console.log('Individual enrollment:', enrollment);
        return {
          enrollment_id: enrollment.enrollment_id,
          course_id: enrollment.course_id,
          course_title: enrollment.course_title,
          course_image: enrollment.course_image,
          enrollment_status: enrollment.enrollment_status,
          payment_status: enrollment.payment_status,
          total_tuition: enrollment.total_tuition || 0,
          paid_amount: enrollment.paid_amount || 0,
          installments: enrollment.installments || [],
          course: {
            id: enrollment.course_id,
            title: enrollment.course_title,
            image: enrollment.course_image,
            price: enrollment.total_tuition || 0
          },
          progress: enrollment.paid_amount || 0,
          lastAccessed: new Date().toISOString(),
          nextLesson: 'Introduction to the Course', // Placeholder
          nextDeadline: enrollment.installments && enrollment.installments.length > 0 
            ? enrollment.installments[0].due_date 
            : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          paymentPlan: enrollment.payment_status === 'fully_paid' ? 'full' : 'installment'
        };
      });

      console.log('Mapped enrolled courses:', enrolledCourses);

      return enrolledCourses;
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      throw error;
    }
  }
};
