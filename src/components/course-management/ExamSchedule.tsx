import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Timer, Calendar, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { format } from 'date-fns';
import { enrollmentService } from "@/services/enrollmentService";
import { toast } from 'sonner';

// Define interface for exam data
interface Exam {
    id: string;
    title: string;
    type: 'quiz' | 'midterm' | 'final' | 'assignment';
    date: Date;
    duration: string;
    userExamStatus: string;
    score?: number;
    totalScore?: number;
    instructions?: string;
    topics?: string[] | string | null;
    attempts?: number;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'green';
        case 'in_progress': return 'blue';
        case 'missed': return 'red';
        case 'not_started': return 'gray';
        default: return 'gray';
    }
};

export default function ExamSchedule({ courseId, refreshExams }: { 
    courseId?: string, 
    refreshExams?: () => void 
}) {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [participatingExamId, setParticipatingExamId] = useState<string | null>(null);

    // Helper function to parse topics
    const parseTopics = (topics: string[] | string | null): string[] => {
        if (Array.isArray(topics)) return topics;
        if (typeof topics === 'string') {
            try {
                // Try parsing as JSON
                const parsedTopics = JSON.parse(topics);
                return Array.isArray(parsedTopics) ? parsedTopics : [];
            } catch {
                // If not JSON, split by comma or return as single-item array
                return topics.includes(',') ? topics.split(',').map(t => t.trim()) : [topics];
            }
        }
        return [];
    };

    // Helper function to determine if an exam is missed
    const isExamMissed = (exam: Exam): boolean => {
        // If exam date is not set, it can't be missed
        if (!exam.date) return false;

        const now = new Date();
        const examDate = new Date(exam.date);

        // Check if the exam date has passed
        return examDate < now && 
               // And the user has no existing exam attempt
               (!exam.attempts || exam.attempts === 0) && 
               // And the current status is not already completed or in progress
               exam.userExamStatus !== 'completed' && 
               exam.userExamStatus !== 'in_progress';
    };

    // Helper function to determine if an exam is upcoming
    const isExamUpcoming = (exam: Exam): boolean => {
        // If exam date is not set, it can't be upcoming
        if (!exam.date) return false;

        const now = new Date();
        const examDate = new Date(exam.date);

        // Check if the exam date is in the future
        return examDate > now && 
               // And the user has an existing exam attempt or record
               (exam.attempts && exam.attempts > 0);
    };

    // Helper function to determine if an exam is in progress
    const isExamInProgress = (exam: Exam): boolean => {
        // If exam date is not set, it can't be in progress
        if (!exam.date) return false;

        const now = new Date();
        const examDate = new Date(exam.date);

        // Normalize dates to compare just the date part
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

        // Check if the exam date is today
        return nowDate.getTime() === examDateOnly.getTime() && 
               // And the user has an existing exam attempt or record
               (exam.attempts && exam.attempts > 0);
    };

    // Helper function to determine if an exam is completed
    const isExamCompleted = (exam: Exam): boolean => {
        // If exam date is not set, it can't be completed
        if (!exam.date) return false;

        const now = new Date();
        const examDate = new Date(exam.date);

        // Normalize dates to compare just the date part
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

        // Check if the exam date is today or in the past
        return (nowDate.getTime() >= examDateOnly.getTime()) && 
               // And the user has an existing exam attempt
               (exam.attempts && exam.attempts > 0) &&
               // And the current status is already marked as completed
               exam.userExamStatus === 'completed';
    };

    // Helper function to determine the exam score display
    const getExamScoreDisplay = (exam: Exam): string => {
        // Normalize dates to compare just the date part
        const now = new Date();
        const examDate = new Date(exam.date);
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

        // Check if the exam date is today or in the past
        const isExamDatePassed = nowDate.getTime() >= examDateOnly.getTime();

        // Check if the exam is completed or in progress and has attempts
        const isCompletedOrInProgress = 
            (exam.userExamStatus === 'completed' || exam.userExamStatus === 'in_progress') && 
            exam.attempts && 
            exam.attempts > 0;

        // If exam is past or today, completed or in progress, and has attempts
        if (isExamDatePassed && isCompletedOrInProgress) {
            // If score is null or undefined, show "Awaiting Result"
            if (exam.score == null) {
                return "Awaiting Result";
            }
            
            // If total score is available, display it
            if (exam.totalScore != null) {
                return `${exam.score} / ${exam.totalScore}`;
            }
            
            // Fallback to just showing the score
            return `${exam.score}`;
        }

        // Default case: no score to display
        return "—";
    };

    useEffect(() => {
        const fetchExams = async () => {
            if (!courseId) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await enrollmentService.getCourseExams(courseId);
                
                // Defensive checks to ensure we have an array
                const fetchedExams = Array.isArray(response) 
                    ? response 
                    : response.data 
                    ? (Array.isArray(response.data) ? response.data : [])
                    : [];

                // Transform exams to ensure topics is always an array
                // And update status for missed, upcoming, in_progress, and completed exams
                const transformedExams = fetchedExams.map(exam => {
                    const transformedExam = {
                        ...exam,
                        // Ensure date is a valid Date object
                        date: exam.date ? new Date(exam.date) : new Date(),
                        // Parse topics safely
                        topics: parseTopics(exam.topics)
                    };

                    // Normalize dates to compare just the date part
                    const now = new Date();
                    const examDate = new Date(transformedExam.date);
                    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

                    // Check if the exam date is today
                    const isExamToday = nowDate.getTime() === examDateOnly.getTime();

                    // Prioritize completed status if exam is today and has completed status
                    if (isExamToday && transformedExam.userExamStatus === 'completed') {
                        transformedExam.userExamStatus = 'completed';
                    }
                    // Update status to missed if applicable
                    else if (isExamMissed(transformedExam)) {
                        transformedExam.userExamStatus = 'missed';
                    } 
                    // Update status to upcoming if applicable
                    else if (isExamUpcoming(transformedExam)) {
                        transformedExam.userExamStatus = 'upcoming';
                    }
                    // Update status to in_progress if applicable
                    else if (isExamInProgress(transformedExam)) {
                        transformedExam.userExamStatus = 'in_progress';
                    }

                    return transformedExam;
                }).filter(exam => exam.id); // Remove any invalid exams

                setExams(transformedExams);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch exams:', error);
                setIsLoading(false);
                toast.error('Error Loading Exams', {
                    description: 'Failed to load exams for this course'
                });
                // Set exams to empty array to prevent further errors
                setExams([]);
            }
        };

        fetchExams();
    }, [courseId]);

    const handleParticipate = async (examId: string) => {
        if (!courseId) return;

        try {
            setParticipatingExamId(examId);
            
            // Start exam participation
            await enrollmentService.startExamParticipation(courseId, examId);
            
            // Show success toast
            toast.success('Exam Started', {
                description: 'You have successfully started the exam.'
            });

            // Refresh exams to update status
            if (refreshExams) {
                refreshExams();
            }
        } catch (err: any) {
            // Show error toast
            toast.error('Error Starting Exam', {
                description: err.response?.data?.message || 'Failed to start exam'
            });
        } finally {
            setParticipatingExamId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center">
                {error}
            </div>
        );
    }

    if (exams.length === 0) {
        return (
            <div className="text-center text-gray-500">
                No exams found for this course
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
                                            <span>{exam.date ? format(exam.date, 'MMM dd, yyyy') : 'Not scheduled'}</span>
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
                                            exam.userExamStatus === 'missed' ? 'bg-destructive text-white' :
                                            exam.userExamStatus === 'upcoming' ? 'bg-blue-500 text-white' :
                                            exam.userExamStatus === 'not_started' ? 'bg-primary text-white' :
                                            exam.userExamStatus === 'completed' ? 'bg-green-500 text-white' :
                                            exam.userExamStatus === 'in_progress' ? 'bg-yellow-500 text-white' :
                                            'bg-gray-500 text-white'
                                        }
                                    >
                                        {exam.userExamStatus}
                                    </Badge>

                                    {/* Score Display */}
                                    {((new Date().getTime() >= new Date(exam.date).getTime()) && 
                                      (exam.userExamStatus === 'completed' || exam.userExamStatus === 'in_progress') && 
                                      exam.attempts && 
                                      exam.attempts > 0) && (
                                        <div className="text-sm">
                                            <span className="font-medium">Score: </span>
                                            <span className={
                                                getExamScoreDisplay(exam) === "Awaiting Result" 
                                                    ? "text-yellow-600" 
                                                    : "text-green-600"
                                            }>
                                                {getExamScoreDisplay(exam)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Only show participate button if not started */}
                                {exam.userExamStatus === 'not_started' && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="shrink-0"
                                        onClick={() => handleParticipate(exam.id)}
                                        disabled={participatingExamId === exam.id}
                                    >
                                        {participatingExamId === exam.id ? 'Starting...' : 'Participate'}
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
};