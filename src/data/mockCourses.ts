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
  tutor: {
    name: string;
    avatar: string;
    title: string;
    rating: number;
    students: number;
  };
  syllabus: {
    title: string;
    duration: string;
    completed: boolean;
  }[];
  features: string[];
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    description: "Master the core concepts of web development with this comprehensive course. Learn HTML, CSS, and JavaScript from scratch and build real-world projects.",
    level: "Beginner",
    duration: "8 weeks",
    price: 99000.99,
    students: 1234,
    rating: 4.5,
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop",
    tutor: {
      name: "Sarah Johnson",
      avatar: "/tutors/sarah.jpg",
      title: "Senior Web Developer",
      rating: 4.8,
      students: 3456,
    },
    syllabus: [
      {
        title: "Introduction to HTML",
        duration: "2 hours",
        completed: true,
      },
      {
        title: "CSS Fundamentals",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "JavaScript Basics",
        duration: "4 hours",
        completed: false,
      },
      {
        title: "Building Responsive Layouts",
        duration: "3 hours",
        completed: false,
      },
    ],
    features: [
      "24/7 Support",
      "Lifetime Access",
      "Project-Based Learning",
      "Certificate of Completion",
      "Interactive Assignments",
      "Real-world Projects",
    ]
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and design patterns for scalable applications",
    level: "Advanced",
    duration: "6 weeks",
    price: 149000.99,
    students: 856,
    rating: 4.8,
    category: "Frontend",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
    tutor: {
      name: "Michael Chen",
      avatar: "/tutors/michael.jpg",
      title: "React Specialist",
      rating: 4.9,
      students: 2890,
    },
    syllabus: [
      {
        title: "Introduction to React",
        duration: "2 hours",
        completed: true,
      },
      {
        title: "Advanced React Concepts",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "React Design Patterns",
        duration: "4 hours",
        completed: false,
      },
      {
        title: "Building Scalable Applications",
        duration: "3 hours",
        completed: false,
      },
    ],
    features: [
      "24/7 Support",
      "Lifetime Access",
      "Project-Based Learning",
      "Certificate of Completion",
      "Interactive Assignments",
      "Real-world Projects",
    ]
  },
  {
    id: "3",
    title: "Cybersecurity Essentials",
    description: "Learn fundamental cybersecurity concepts and practices for digital safety",
    level: "Intermediate",
    duration: "10 weeks",
    price: 199000.99,
    students: 567,
    rating: 4.6,
    category: "Security",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    tutor: {
      name: "Alex Thompson",
      avatar: "/tutors/alex.jpg",
      title: "Security Expert",
      rating: 4.7,
      students: 1890,
    },
    syllabus: [
      {
        title: "Introduction to Cybersecurity",
        duration: "2 hours",
        completed: true,
      },
      {
        title: "Network Security",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "Threat Detection",
        duration: "4 hours",
        completed: false,
      },
      {
        title: "Security Best Practices",
        duration: "3 hours",
        completed: false,
      },
    ],
    features: [
      "24/7 Support",
      "Lifetime Access",
      "Hands-on Labs",
      "Certificate of Completion",
      "Real-world Scenarios",
      "Security Tools Training"
    ]
  },
  {
    id: "4",
    title: "UI/UX Design Masterclass",
    description: "Create stunning user interfaces and exceptional user experiences",
    level: "Intermediate",
    duration: "12 weeks",
    price: 179000.99,
    students: 923,
    rating: 4.7,
    category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    tutor: {
      name: "Emma Rodriguez",
      avatar: "/tutors/emma.jpg",
      title: "Senior UX Designer",
      rating: 4.8,
      students: 2100,
    },
    syllabus: [
      {
        title: "Design Principles",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "User Research",
        duration: "4 hours",
        completed: true,
      },
      {
        title: "Wireframing",
        duration: "3 hours",
        completed: false,
      },
      {
        title: "Prototyping",
        duration: "4 hours",
        completed: false,
      },
    ],
    features: [
      "Design Tools Access",
      "Portfolio Projects",
      "Industry Feedback",
      "Certificate of Completion",
      "Real Client Projects",
      "Design Resources"
    ]
  },
  {
    id: "5",
    title: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native",
    level: "Intermediate",
    duration: "10 weeks",
    price: 149000.99,
    students: 782,
    rating: 4.4,
    category: "Mobile Development",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    tutor: {
      name: "James Wilson",
      avatar: "/tutors/james.jpg",
      title: "Mobile Dev Specialist",
      rating: 4.6,
      students: 1560,
    },
    syllabus: [
      {
        title: "React Native Basics",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "Mobile UI Components",
        duration: "4 hours",
        completed: true,
      },
      {
        title: "State Management",
        duration: "3 hours",
        completed: false,
      },
      {
        title: "App Deployment",
        duration: "2 hours",
        completed: false,
      },
    ],
    features: [
      "Cross-platform Development",
      "Real Device Testing",
      "App Store Publishing",
      "Certificate of Completion",
      "Code Reviews",
      "Project Templates"
    ]
  },
  {
    id: "6",
    title: "Data Science Fundamentals",
    description: "Introduction to data analysis, visualization, and machine learning",
    level: "Beginner",
    duration: "14 weeks",
    price: 199000.99,
    students: 1567,
    rating: 4.9,
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    tutor: {
      name: "Lisa Wang",
      avatar: "/tutors/lisa.jpg",
      title: "Data Scientist",
      rating: 4.9,
      students: 3200,
    },
    syllabus: [
      {
        title: "Python for Data Science",
        duration: "4 hours",
        completed: true,
      },
      {
        title: "Data Analysis",
        duration: "5 hours",
        completed: true,
      },
      {
        title: "Machine Learning Basics",
        duration: "6 hours",
        completed: false,
      },
      {
        title: "Data Visualization",
        duration: "3 hours",
        completed: false,
      },
    ],
    features: [
      "Data Analysis Tools",
      "Real Dataset Projects",
      "ML Model Building",
      "Certificate of Completion",
      "Industry Projects",
      "Statistical Analysis"
    ]
  },
  {
    id: "7",
    title: "Cloud Computing with AWS",
    description: "Master cloud services and deployment with Amazon Web Services",
    level: "Advanced",
    duration: "8 weeks",
    price: 189000.99,
    students: 645,
    rating: 4.7,
    category: "Cloud Computing",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    tutor: {
      name: "Mark Anderson",
      avatar: "/tutors/mark.jpg",
      title: "AWS Solutions Architect",
      rating: 4.8,
      students: 1890,
    },
    syllabus: [
      {
        title: "AWS Fundamentals",
        duration: "4 hours",
        completed: true,
      },
      {
        title: "Cloud Architecture",
        duration: "5 hours",
        completed: true,
      },
      {
        title: "Serverless Computing",
        duration: "4 hours",
        completed: false,
      },
      {
        title: "DevOps on AWS",
        duration: "5 hours",
        completed: false,
      },
    ],
    features: [
      "AWS Free Tier Access",
      "Cloud Projects",
      "Architecture Reviews",
      "Certificate of Completion",
      "Best Practices",
      "Cost Optimization"
    ]
  },
  {
    id: "8",
    title: "Digital Marketing Strategy",
    description: "Learn modern digital marketing techniques and growth strategies",
    level: "Beginner",
    duration: "6 weeks",
    price: 89000.99,
    students: 1123,
    rating: 4.5,
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    tutor: {
      name: "Sarah Miller",
      avatar: "/tutors/sarah-m.jpg",
      title: "Digital Marketing Expert",
      rating: 4.7,
      students: 2450,
    },
    syllabus: [
      {
        title: "Marketing Fundamentals",
        duration: "3 hours",
        completed: true,
      },
      {
        title: "Social Media Marketing",
        duration: "4 hours",
        completed: true,
      },
      {
        title: "SEO Strategies",
        duration: "3 hours",
        completed: false,
      },
      {
        title: "Analytics & Reporting",
        duration: "2 hours",
        completed: false,
      },
    ],
    features: [
      "Marketing Tools Access",
      "Campaign Projects",
      "Analytics Training",
      "Certificate of Completion",
      "Growth Strategies",
      "ROI Tracking"
    ]
  }
]; 