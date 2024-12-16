import { apiClient } from '@/lib/axios';

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
  async getCourseDetails(courseId: string) {
    try {
      console.log(`Attempting to fetch course details for course ID: ${courseId}`);
      const response = await apiClient.get(`/courses/${courseId}`);
      
      console.log('Full course details response:', JSON.stringify(response.data, null, 2));
      
      if (!response.data.course) {
        console.warn('No course details found in response');
        throw new Error('Course details not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  },

  // Add other course management related methods here
};

export default courseManagementService;
