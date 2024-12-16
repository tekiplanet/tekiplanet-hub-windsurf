export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    courseId: string;
    amount: number;
  };
}

export interface EnrollmentRequest {
  courseId: string;
  userId: string;
  amount: number;
}

export interface Installment {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paid: boolean;
  overdue: boolean;
  paid_at: string | null;
}

export interface CourseLesson {
  id: number | string;
  title: string;
  description?: string;
  duration?: string;
  content_type?: 'video' | 'text' | 'quiz';
  order?: number;
}

export interface CourseTopic {
  id: number | string;
  title: string;
  description?: string;
  order?: number;
  lessons?: CourseLesson[];
}

export interface CourseModule {
  id: number | string;
  title: string;
  description?: string;
  order?: number;
  topics?: CourseTopic[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  price: number;
  students: number;
  rating: number;
  category: string;
  image: string;
  curriculum?: CourseModule[];
}

export interface EnrolledCourse {
  courseId: string;
  enrollmentDate: string;
  transactionId: string;
  userId: string;
  tuitionPaid: boolean;
  tuitionFee: number;
  course?: Course;
  paymentPlan: 'full' | 'installment';
  installments?: Installment[];
}