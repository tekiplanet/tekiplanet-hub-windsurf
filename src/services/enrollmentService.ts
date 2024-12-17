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
      const enrollmentsResponse = await this.getUserEnrollments();
      
      // Check if there are existing enrollments
      const existingEnrollments = enrollmentsResponse.enrollments || [];
      
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
        message: 'Course enrollment successful',
        data: response.data
      };
    } catch (error) {
      console.error('Enrollment error:', error);
      
      if (isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Enrollment failed',
          data: null
        };
      }
      
      throw error;
    }
  },

  async getUserEnrollments() {
    try {
      const response = await apiClient.get('/courses/enrolled');
      
      console.log('Full user enrollments response:', JSON.stringify(response.data, null, 2));
      
      // Add more robust error checking
      if (!response.data || !response.data.enrollments) {
        console.warn('No enrollments found in response');
        return [];
      }

      console.log('Parsed enrollments:', JSON.stringify(response.data.enrollments, null, 2));
      
      return {
        success: true,
        enrollments: response.data.enrollments
      };
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
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
          installments: enrollment.installments.map(installment => ({
            ...installment,
            due_date: new Date(installment.due_date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          })),
          course: {
            id: enrollment.course_id,
            title: enrollment.course_title,
            image: enrollment.course_image,
            price: enrollment.total_tuition || 0
          },
          enrolled_at: enrollment.enrolled_at,
          progress: enrollment.progress ?? 0,
          lastAccessed: new Date().toISOString(),
          nextLesson: enrollment.next_course_schedule 
            ? ` ${new Date(enrollment.next_course_schedule).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}` 
            : 'No upcoming classes',
          nextDeadline: enrollment.payment_status === 'fully_paid'
            ? 'No upcoming payment deadlines'
            : enrollment.next_payment_deadline
            ? `${new Date(enrollment.next_payment_deadline).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}` 
            : 'No upcoming payment deadlines',
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

  getCourseInstallments: async (courseId: string) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/installments`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch course installments', error);
      throw error;
    }
  }, 
  
  
  async getUserCourseEnrollment(courseId: number | string) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/enrollment`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course enrollment:', error);
      throw error;
    }
  },  

  async getCourseDetails(courseId: string) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  },

  async getCourseExams(courseId: string) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/exams`);
      return response;
    } catch (error) {
      console.error('Error fetching course exams:', error);
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
    amount: number,
    dueDate?: string
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
    console.log('Processing Installment Payment', {
      course_id: courseId,
      installment_id: installmentId,
      amount,
      due_date: dueDate
    });

    try {
      // First, fetch the current enrollment to get all installments
      const enrollments = await this.getUserEnrolledCourses();
      const enrollment = enrollments.find(e => e.course_id === courseId);

      if (!enrollment) {
        throw new Error('No enrollment found for this course');
      }

      // Find the next unpaid installment if the provided installment is already paid
      const installments = enrollment.installments || [];
      const targetInstallment = installments.find(inst => inst.id === installmentId);

      if (!targetInstallment) {
        throw new Error('Invalid installment');
      }

      if (targetInstallment.status === 'paid') {
        // Find the next unpaid installment
        const nextUnpaidInstallment = installments.find(inst => inst.status !== 'paid');

        if (nextUnpaidInstallment) {
          console.warn(`Installment ${installmentId} already paid. Using next unpaid installment.`);
          installmentId = nextUnpaidInstallment.id;
          amount = nextUnpaidInstallment.amount;
        } else {
          throw new Error('All installments have been paid');
        }
      }

      const response = await apiClient.post('/enrollments/specific-installment-payment', {
        course_id: courseId,
        installment_id: installmentId,
        amount,
        due_date: dueDate
      });

      return {
        success: true,
        message: 'Installment payment processed successfully',
        installment: response.data.installment || {
          id: installmentId,
          amount,
          due_date: dueDate || '',
          status: 'paid',
          paid_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Installment payment error:', error);

      if (isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to process installment payment';
        
        // If the installment is already paid, try to find the next unpaid installment
        if (errorMessage.toLowerCase().includes('already been paid')) {
          try {
            const enrollments = await this.getUserEnrolledCourses();
            const enrollment = enrollments.find(e => e.course_id === courseId);
            
            if (enrollment) {
              const nextUnpaidInstallment = enrollment.installments
                .find(inst => inst.status !== 'paid');
              
              if (nextUnpaidInstallment) {
                return this.processInstallmentPayment(
                  courseId, 
                  nextUnpaidInstallment.id, 
                  nextUnpaidInstallment.amount
                );
              }
            }
          } catch (retryError) {
            console.error('Error finding next unpaid installment:', retryError);
          }
        }

        throw new Error(errorMessage);
      }
      
      throw error;
    }
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

  async payInstallment(
    installmentId: string, 
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
    installment?: {
      id: string;
      amount: number;
      due_date: string;
      status: 'pending' | 'paid' | 'overdue';
      paid_at: string | null;
    };
    enrollment?: {
      id: string;
      payment_status: 'unpaid' | 'partially_paid' | 'fully_paid';
    };
  }> {
    try {
      console.log('Processing installment payment', { installmentId, amount });
      
      const response = await apiClient.post('/enrollments/pay-installment', {
        installment_id: installmentId,
        amount: amount
      });

      console.log('Installment payment response:', JSON.stringify(response.data, null, 2));

      // Validate response structure
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to pay installment');
      }

      return response.data;
    } catch (error) {
      console.error('Error in payInstallment:', error);
      
      // Provide more detailed error information
      if (isAxiosError(error)) {
        console.error('Axios error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        throw new Error(
          error.response?.data?.message || 
          'Network error occurred while paying installment'
        );
      }
      
      throw error;
    }
  },

  async startExamParticipation(courseId: string, examId: string) {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/exams/${examId}/participate`
      );
      return response.data;
    } catch (error) {
      console.error('Error starting exam participation:', error);
      throw error;
    }
  },
};

export default enrollmentService;
