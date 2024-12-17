import apiClient, { isAxiosError } from '@/lib/axios';
import axios from 'axios';

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

const courseNotices = {
  // Add local course notices data here
};

export const courseManagementService = {
  async getCourseDetails(courseId: string) {
    try {
      console.log(`Attempting to fetch course details for course ID: ${courseId}`);
      const response = await apiClient.get(`/courses/${courseId}`);
      
      console.log('Full course details response:', JSON.stringify(response.data, null, 2));
      
      // Log specific details about schedules
      console.log('Schedules in response:', response.data.schedules);
      console.log('Schedules length:', response.data.schedules?.length);
      console.log('Schedules type:', typeof response.data.schedules);
      
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

  async getCourseNotices(courseId: string) {
    try {
      console.log(`Fetching notices for courseId: ${courseId}`);
      
      // Validate courseId
      if (!courseId) {
        console.warn('No courseId provided');
        throw new Error('Course ID is required');
      }
      
      const response = await apiClient.get(`/courses/${courseId}/notices`);
      
      // Log the full response for debugging
      console.log('Full Notices Response:', {
        status: response.status,
        data: JSON.stringify(response.data, null, 2)
      });
      
      // Validate response structure
      if (!response || !response.data || !response.data.notices) {
        console.warn('Invalid response structure for course notices');
        throw new Error('Invalid response from server');
      }
      
      // Transform the notices to match the existing type structure
      const transformedNotices = response.data.notices.map((notice: any) => ({
        id: notice.id.toString(),
        type: notice.is_important ? 'announcement' : 'resource',
        title: notice.title,
        content: notice.content,
        date: new Date(notice.published_at),
        read: false, // You might want to implement read status later
        priority: notice.is_important ? 'high' : 'normal'
      }));

      console.log('Transformed Notices:', JSON.stringify(transformedNotices, null, 2));

      return {
        success: true,
        notices: transformedNotices
      };
    } catch (error) {
      // More detailed error logging
      console.error('Full Error Object:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          message: error.message,
          status: error.response?.status,
          data: JSON.stringify(error.response?.data, null, 2)
        });
      }

      // Fallback to local notices if backend fails
      const localNotices = courseNotices[courseId as keyof typeof courseNotices] || [];
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch notices from server',
        notices: localNotices
      };
    }
  },

  async deleteUserCourseNotice(courseNoticeId: string) {
    try {
      console.log(`Deleting notice with ID: ${courseNoticeId}`);
      
      const response = await apiClient.delete(`/courses/notices/${courseNoticeId}`);
      
      console.log('Delete Notice Response:', {
        status: response.status,
        data: JSON.stringify(response.data, null, 2)
      });

      return {
        success: true,
        message: response.data.message || 'Notice deleted successfully',
        courseNoticeId: courseNoticeId
      };
    } catch (error) {
      console.error('Error deleting course notice:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          message: error.message,
          status: error.response?.status,
          data: JSON.stringify(error.response?.data, null, 2)
        });
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete notice',
        courseNoticeId: courseNoticeId
      };
    }
  },

  // Add other course management related methods here
};

export default courseManagementService;
