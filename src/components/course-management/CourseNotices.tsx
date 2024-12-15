import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BookOpen, Calendar, FileText, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { courseNotices } from "@/data/courseNotices";

interface Notice {
  id: string;
  type: 'announcement' | 'resource' | 'assignment' | 'schedule' | 'discussion';
  title: string;
  content: string;
  date: Date;
  read: boolean;
  priority?: 'high' | 'normal';
}

export default function CourseNotices({ courseId }: { courseId?: string }) {
  const notices = courseNotices[courseId] || [];

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

  return (
    <div className="space-y-4">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold">Course Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay updated with course announcements and updates
            </p>
          </div>
          <Badge variant="secondary">
            {notices.filter(n => !n.read).length} New
          </Badge>
        </div>

        <ScrollArea className="h-[500px] w-full pr-2">
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card 
                key={notice.id}
                className={`relative ${!notice.read ? 'bg-muted/50' : ''}`}
              >
                {!notice.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                )}
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-full bg-muted ${
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
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {notice.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notice.date)}
                        </span>
                        {notice.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Important
                          </Badge>
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