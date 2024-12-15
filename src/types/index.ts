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
  number: 1 | 2;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
  overdue: boolean;
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