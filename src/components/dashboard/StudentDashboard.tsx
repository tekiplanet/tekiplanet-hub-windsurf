import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Trophy, Bell, Wallet, Gift, ArrowRight, 
  PlayCircle, Calendar, Users, Target, ChevronRight, Star,
  Zap, Award, BookMarked, GraduationCap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    progress: 45,
    nextClass: "Tomorrow at 10:00 AM",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
    instructor: "Dr. Sarah Johnson",
    totalLessons: 24,
    completedLessons: 11
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    progress: 30,
    nextClass: "Today at 2:00 PM",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    instructor: "Prof. Michael Chen",
    totalLessons: 18,
    completedLessons: 5
  }
];

const mockStats = [
  {
    title: "Wallet Balance",
    value: "₦45,231.89",
    icon: <Wallet className="h-5 w-5 text-primary" />,
    trend: "+₦5,000 this week",
    actionLabel: "Top up"
  },
  {
    title: "Study Hours",
    value: "24.5h",
    icon: <Clock className="h-5 w-5 text-primary" />,
    trend: "+2.5h from last week",
    actionLabel: "View stats"
  },
  {
    title: "Achievements",
    value: "12",
    icon: <Trophy className="h-5 w-5 text-primary" />,
    trend: "3 new badges",
    actionLabel: "See all"
  },
  {
    title: "Course Progress",
    value: "45%",
    icon: <Target className="h-5 w-5 text-primary" />,
    trend: "On track",
    actionLabel: "Details"
  }
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  const handleManageCourse = (courseId: string) => {
    navigate(`/dashboard/academy/${courseId}/manage`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">Welcome back, John! 👋</h1>
            <p className="text-sm text-muted-foreground">Ready to continue learning?</p>
          </div>
        </div>
        
        {/* Add back the Set Learning Goals button */}
        <Card className="bg-primary/5 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Set Your Learning Goals</h3>
                  <p className="text-xs text-muted-foreground">Track your progress and stay motivated</p>
                </div>
              </div>
              <Button size="sm" className="shrink-0 text-white">
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {mockStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {stat.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{stat.value}</h3>
                  <p className="text-xs text-primary">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Course Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">My Courses</h2>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>

        {/* Updated grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Button 
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-2 right-2 text-white"
                  >
                    <PlayCircle className="h-6 w-6" />
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor}
                    </p>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} Lessons
                    </span>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-xs bg-primary text-white hover:bg-primary/90"
                      onClick={() => handleManageCourse(course.id)}
                    >
                      Manage Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Quick Actions</h2>
        <div className="flex flex-col gap-3">
          <QuickActionCard 
            icon={<BookOpen className="h-5 w-5" />}
            title="Continue Learning"
            description="Resume your last lesson"
            actionLabel="Continue"
          />
          <QuickActionCard 
            icon={<Calendar className="h-5 w-5" />}
            title="Upcoming Classes"
            description="View your schedule"
            actionLabel="View Schedule"
          />
          <QuickActionCard 
            icon={<Award className="h-5 w-5" />}
            title="Achievements"
            description="Track your progress"
            actionLabel="View All"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, actionLabel }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 text-primary hover:text-primary">
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}