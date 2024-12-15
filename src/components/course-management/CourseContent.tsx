import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { courseContent } from "@/data/courseContent";

interface Module {
  id: string;
  title: string;
  description: string;
  topics: {
    title: string;
    description: string;
    learningOutcomes: string[];
  }[];
  duration: string;
}

export default function CourseContent({ courseId }: { courseId?: string }) {
  const content = courseContent[courseId] || { modules: [] };

  return (
    <div className="space-y-4 max-w-full">
      {content.modules.map((module, moduleIndex) => (
        <Card key={module.id}>
          <CardHeader className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <Badge variant="outline" className="mb-2">
                  {module.duration}
                </Badge>
                <h3 className="text-lg font-semibold">
                  Module {moduleIndex + 1}: {module.title}
                </h3>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {module.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="space-y-2">
                  <h4 className="font-medium">
                    {moduleIndex + 1}.{topicIndex + 1} {topic.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                  <div className="pl-4 space-y-1">
                    {topic.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 