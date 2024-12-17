import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Timer, Calendar, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enrollmentService } from "@/services/enrollmentService";
import { Spinner } from "@/components/ui/spinner";

interface Exam {
  id: string;
  title: string;
  type: 'quiz' | 'midterm' | 'final' | 'assignment';
  date: Date;
  duration: string;
  status: 'upcoming' | 'completed' | 'ongoing' | 'missed';
  score?: number;
  totalScore?: number;
  instructions?: string;
  topics: string[];
}

export default function ExamSchedule({ courseId }: { courseId?: string }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedExams = await enrollmentService.getCourseExams(courseId);
        setExams(fetchedExams);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setIsLoading(false);
      }
    };

    fetchExams();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Upcoming Exams</h2>
      </div>

      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{exam.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{exam.date.toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{exam.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exam.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <Badge 
                    className={
                      exam.status === 'upcoming' ? 'bg-primary text-white' :
                      exam.status === 'completed' ? 'bg-green-500 text-white' :
                      exam.status === 'ongoing' ? 'bg-yellow-500 text-white' :
                      'bg-destructive text-white'
                    }
                  >
                    {exam.status}
                  </Badge>
                </div>

                {exam.status === 'upcoming' && (
                  <Button variant="outline" size="sm" className="shrink-0">
                    View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {exams.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No upcoming exams scheduled
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}