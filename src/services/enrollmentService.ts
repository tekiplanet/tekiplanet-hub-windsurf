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
            description: enrollment.course.description,
            category: enrollment.course.category,
            level: enrollment.course.level,
            instructor: enrollment.course.instructor,
            image_url: enrollment.course.image_url,
            duration_hours: enrollment.course.duration_hours,
          },
          progress: parseFloat(enrollment.progress) * 100, // Convert to percentage
          lastAccessed: enrollment.updated_at,
          paymentPlan: 'full', // Default to full payment
          installments: [] // You might want to fetch actual installments later
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
