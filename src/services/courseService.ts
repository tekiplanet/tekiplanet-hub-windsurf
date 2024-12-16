import { EnrollmentRequest, EnrollmentResponse } from '@/types';
import apiClient from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';

class CourseService {
  async enrollInCourse(data: EnrollmentRequest): Promise<EnrollmentResponse> {
    try {
      const response = await this.mockEnrollmentAPI(data);
      return response;
    } catch (error) {
      throw new Error('Failed to process enrollment');
    }
  }

  async getCourseDetails(courseId: string) {
    try {
      const courseResponse = await apiClient.get(`/courses/${courseId}`);
      const featuresResponse = await apiClient.get(`/courses/${courseId}/features`);
      const curriculumResponse = await apiClient.get(`/courses/${courseId}/curriculum`);
      
      // Get current user ID from auth store
      const userId = useAuthStore.getState().user?.id;
      
      // Get wallet balance from wallet store
      const walletBalance = userId 
        ? useWalletStore.getState().getBalance(userId) 
        : 0;

      return {
        ...courseResponse.data.course,
        instructor: courseResponse.data.instructor,
        features: featuresResponse.data.map((feature: any) => feature.feature),
        curriculum: curriculumResponse.data,
        user: { wallet_balance: walletBalance }
      };
    } catch (error) {
      console.error('Failed to fetch course details', error);
      throw error;
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