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

export const enrollmentService = {
  async enrollInCourse(courseId: string) {
    try {
      const response = await apiClient.post('/api/enrollments/enroll', { course_id: courseId });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
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
  }
};
