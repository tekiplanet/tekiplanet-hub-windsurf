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
      const response = await apiClient.post('/enrollments/enroll', { course_id: courseId });
      
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
      const response = await apiClient.get('/enrollments');
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
      const response = await apiClient.get('/courses/enrolled');
      
      console.log('Enrolled courses response:', JSON.stringify(response.data, null, 2));
      
      // Map the backend response to the expected frontend format
      const enrolledCourses = response.data.enrollments.map((enrollment: any) => {
        console.log('Individual enrollment:', JSON.stringify(enrollment, null, 2));
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
          progress: enrollment.progress ?? 0,
          lastAccessed: new Date().toISOString(),
          nextLesson: 'Introduction to the Course', // Placeholder
          nextDeadline: enrollment.installments && enrollment.installments.length > 0 
            ? enrollment.installments[0].due_date 
            : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
          paymentPlan: enrollment.payment_status === 'fully_paid' ? 'full' : 'installment'
        };
      });

      console.log('Mapped enrolled courses:', JSON.stringify(enrolledCourses, null, 2));

      return enrolledCourses;
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      throw error;
    }
  },

  async processFullPayment(courseId: string, amount: number) {
    try {
      const response = await apiClient.post('/enrollments/full-payment', {
        course_id: courseId,
        amount: amount
      });

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data.message || 'Failed to process full payment');
      }
      throw error;
    }
  },

  async processFullTuitionPayment(courseId: string, amount: number) {
    try {
      const response = await apiClient.post('/enrollments/full-tuition-payment', {
        course_id: courseId,
        amount: amount
      });

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data.message || 'Failed to process full tuition payment');
      }
      throw error;
    }
  },

  async processInstallmentPayment(
    courseId: string, 
    installmentId: string,
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
    installment: {
      id: string;
      amount: number;
      due_date: string;
      status: 'pending' | 'paid' | 'overdue';
      paid_at: string | null;
    }
  }> {
    return apiClient.post('/enrollments/specific-installment-payment', {
      course_id: courseId,
      installment_id: installmentId,
      amount: amount
    });
  },

  async processInitialInstallmentPlan(
    courseId: string, 
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
    installments: {
      id: string;
      amount: number;
      due_date: string;
      status: 'pending' | 'paid' | 'overdue';
      paid_at: string | null;
    }[]
  }> {
    try {
      console.log('Processing initial installment plan', { courseId, amount });
      const response = await apiClient.post('/enrollments/installment-plan', {
        course_id: courseId,
        amount: amount
      });

      console.log('Installment plan response:', JSON.stringify(response.data, null, 2));

      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to create installment plan');
      }

      // Ensure installments exist
      if (!response.data.installments || response.data.installments.length === 0) {
        throw new Error('No installments returned');
      }

      return response.data;
    } catch (error) {
      console.error('Error in processInitialInstallmentPlan:', error);
      
      // Provide more detailed error information
      if (isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        throw new Error(
          error.response?.data?.message || 
          'Network error occurred while creating installment plan'
        );
      }
      
      throw error;
    }
  },
};
