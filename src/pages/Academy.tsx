import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { 
  BookOpen, Clock, Star, Users, Search, 
  GraduationCap, Filter, ChevronRight 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const mockCourses = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript",
    level: "Beginner",
    duration: "8 weeks",
    price: 99000.99,
    students: 1234,
    rating: 4.5,
    category: "Web Development",
    instructor: "Dr. Sarah Johnson",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "Prof. Michael Chen",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Cybersecurity Essentials",
    description: "Learn fundamental cybersecurity concepts and practices for digital safety",
    level: "Intermediate",
    price: 199000.99,
    duration: "10 weeks",
    students: 567,
    rating: 4.6,
    category: "Security",
    instructor: "Dr. Alex Thompson",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "Emma Rodriguez",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "James Wilson",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "Dr. Lisa Wang",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "Mark Anderson",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop"
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
    instructor: "Sarah Miller",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function Academy() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === "all" || course.level.toLowerCase() === selectedLevel
    const matchesCategory = selectedCategory === "all" || course.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesLevel && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-primary/5 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Your Next Skill
            </h1>
            <p className="text-muted-foreground mb-6">
              Explore our wide range of courses and start your learning journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web development">Web Development</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge 
                    className="absolute top-4 right-4"
                    variant={
                      course.level === "Beginner" ? "default" :
                      course.level === "Intermediate" ? "secondary" : 
                      "destructive"
                    }
                  >
                    {course.level}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.category}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <Button 
                      className="w-full text-white"
                      onClick={() => navigate(`/dashboard/academy/${course.id}`)}
                    >
                      Enroll Now
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}