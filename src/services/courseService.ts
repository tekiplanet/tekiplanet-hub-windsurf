import { EnrollmentRequest, EnrollmentResponse } from '@/types';

class CourseService {
  async enrollInCourse(data: EnrollmentRequest): Promise<EnrollmentResponse> {
    try {
      const response = await this.mockEnrollmentAPI(data);
      return response;
    } catch (error) {
      throw new Error('Failed to process enrollment');
    }
  }

  async mockEnrollmentAPI(data: EnrollmentRequest): Promise<EnrollmentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!data.courseId || !data.userId || !data.amount) {
      throw new Error('Invalid enrollment data');
    }

    return {
      success: true,
      message: 'Enrollment successful',
      data: {
        transactionId: `TRX-${Date.now()}`,
        courseId: data.courseId,
        amount: data.amount
      }
    };
  }
}

export const courseService = new CourseService(); 