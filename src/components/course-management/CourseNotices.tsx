import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BookOpen, Calendar, FileText, MessageSquare, AlertTriangle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { courseManagementService } from "@/services/courseManagementService";

interface Notice {
  id: string;
  type: 'announcement' | 'resource' | 'assignment' | 'schedule' | 'discussion';
  title: string;
  content: string;
  date: Date;
  read: boolean;
  priority?: 'high' | 'normal';
}

export default function CourseNotices({ 
  courseId, 
  notices, 
  loading,
  onNoticeDelete 
}: { 
  courseId?: string, 
  notices: Notice[], 
  loading: boolean,
  onNoticeDelete?: (noticeId: string) => void 
}) {
  const [showFallbackNotices, setShowFallbackNotices] = React.useState(false);

  const handleDeleteNotice = React.useCallback(async (noticeId: string) => {
    try {
      const result = await courseManagementService.deleteUserCourseNotice(noticeId);
      
      if (result.success) {
        toast.success('Notice removed successfully');
        
        // Call the parent component's delete handler if provided
        if (onNoticeDelete) {
          onNoticeDelete(noticeId);
        }
      } else {
        toast.error(result.message || 'Failed to remove notice');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('An unexpected error occurred');
    }
  }, [onNoticeDelete]);

  React.useEffect(() => {
    if (loading === false && notices.length === 0) {
      toast.warning('No new notifications', {
        description: 'Showing default notifications',
        duration: 3000
      });
      setShowFallbackNotices(true);
    }
  }, [loading, notices]);

  const getNoticeIcon = (type: Notice['type']) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'resource':
        return <BookOpen className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which notices to show
  const displayNotices = showFallbackNotices 
    ? [
        {
          id: 'fallback-1',
          type: 'announcement',
          title: 'Course Communication Channel',
          content: 'Please check your email or LMS for important course updates.',
          date: new Date(),
          read: false,
          priority: 'high'
        }
      ] 
    : notices;

  // Empty state
  if (!displayNotices || displayNotices.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Notices Available</h3>
        <p className="text-sm text-muted-foreground">
          {showFallbackNotices 
            ? 'Unable to retrieve course notices. Please contact support.' 
            : 'There are currently no notifications for this course.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold">Course Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {showFallbackNotices 
                ? 'Default notifications - please check other communication channels' 
                : 'Stay updated with course announcements and updates'}
            </p>
          </div>
          <Badge variant="secondary">
            {displayNotices.filter(n => !n.read).length} New
          </Badge>
        </div>

        <ScrollArea className="h-[500px] w-full pr-2">
          <div className="space-y-3">
            {displayNotices.map((notice) => (
              <Card 
                key={notice.id}
                className={`relative ${!notice.read ? 'bg-muted/50' : ''} ${
                  showFallbackNotices ? 'border-yellow-500/50' : ''
                }`}
              >
                {!notice.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                )}
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] rounded-full flex-shrink-0 flex items-center justify-center bg-muted ${
                      notice.priority === 'high' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {getNoticeIcon(notice.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-medium leading-none">
                            {notice.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {notice.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                      {(notice.priority === 'high' || showFallbackNotices) && (
                          <Badge variant="destructive" className="text-xs">
                            {showFallbackNotices ? 'Fallback' : 'Important'}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notice.date)}
                        </span>
  
                        {!showFallbackNotices && (
                          <button 
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove Notice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}