import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, Users } from "lucide-react";
import { courseManagementService } from "@/services/courseManagementService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClassSession {
  id: string;
  title: string;
  type: 'lecture' | 'practical' | 'workshop' | 'tutorial';
  date: Date;
  duration: string;
  instructor: string;
  location: 'online' | 'physical';
  meetingLink?: string;
}

export default function CourseSchedule({ courseId }: { courseId?: string }) {
  const [schedules, setSchedules] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchCourseSchedule = async () => {
      if (!courseId) {
        toast.error("No course ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const courseDetails = await courseManagementService.getCourseDetails(courseId);
        
        // Transform schedules to match ClassSession interface
        const transformedSchedules = (courseDetails.schedules || []).map(schedule => ({
          id: schedule.id?.toString() || Math.random().toString(),
          title: schedule.title || 'Untitled Session',
          type: schedule.type || 'lecture',
          date: new Date(schedule.date || Date.now()),
          duration: schedule.duration || '1 hour',
          instructor: schedule.instructor || 'TBA',
          location: schedule.location || 'online',
          meetingLink: schedule.meetingLink
        }));

        setSchedules(transformedSchedules);
      } catch (error) {
        console.error("Error fetching course schedule:", error);
        toast.error("Failed to load course schedule");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseSchedule();
  }, [courseId]);

  const upcomingClasses = schedules
    .filter(session => session.date > new Date());

  // Function to check if a date has classes
  const isDayWithClass = (day: Date) => {
    return upcomingClasses.some(session => 
      session.date.toDateString() === day.toDateString()
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground animate-pulse">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Loading Schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Class Schedule</h2>
          <p className="text-sm text-muted-foreground">
            View your upcoming classes and sessions
          </p>
        </div>
      </div>

      {/* Calendar and Schedule Grid */}
      <div className="flex flex-col gap-6">
        {/* Calendar - now visible on all screens */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={{
                hasClass: (date) => isDayWithClass(date)
              }}
              modifiersStyles={{
                hasClass: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "white"
                }
              }}
              className="rounded-md mx-auto"
            />
          </CardContent>
        </Card>

        {/* Schedule List */}
        <div className="space-y-4">
          {upcomingClasses.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Title and Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {session.type}
                      </Badge>
                      <Badge variant="secondary">
                        {session.location}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{session.title}</h3>
                  </div>

                  {/* Details */}
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span>
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' at '}
                        {new Date(session.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>Instructor: {session.instructor}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {upcomingClasses.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No Upcoming Classes</p>
                  <p className="text-sm mt-1">
                    Check back later for new class schedules
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}