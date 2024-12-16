import apiClient, { isAxiosError } from '@/lib/axios';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  enrolled_at: string;
  completed_at?: string;
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
          courseId: enrollment.course_id,
          enrollmentDate: enrollment.enrolled_at,
          transactionId: enrollment.id,
          userId: enrollment.user_id,
          tuitionPaid: enrollment.status === 'active',
          tuitionFee: enrollment.course.price,
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            image: enrollment.course.image_url,
          },
          progress: parseFloat(enrollment.progress) * 100, // Convert to percentage
          lastAccessed: enrollment.updated_at,
          nextLesson: 'Introduction to the Course', // Placeholder
          nextDeadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now
          paymentPlan: 'full', // Default to full payment
          installments: [] // Placeholder for future installment logic
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
