import apiClient, { isAxiosError } from '@/lib/axios';

export interface CourseDetails {
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
}

export const courseManagementService = {
  async getCourseDetails(courseId: string): Promise<CourseDetails> {
    try {
      const response = await apiClient.get(`/courses/${courseId}/details`);
      
      // Detailed course information with related models
      return {
        course: response.data.course,
        modules: response.data.modules || [],
        lessons: response.data.lessons || [],
        exams: response.data.exams || [],
        schedules: response.data.schedules || [],
        notices: response.data.notices || [],
        features: response.data.features || [],
        instructor: response.data.instructor || null,
        enrollment: response.data.enrollment || null,
        installments: response.data.installments || []
      };
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      
      if (isAxiosError(error)) {
        throw new Error(error.response?.data.message || 'Failed to fetch course details');
      }
      
      throw error;
    }
  }
};

export default courseManagementService;
