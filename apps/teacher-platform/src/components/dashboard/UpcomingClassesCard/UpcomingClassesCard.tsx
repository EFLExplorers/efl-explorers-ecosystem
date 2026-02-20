import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { Lesson } from "@shared/schema";
import { Languages, BookOpen, Mic, HeadphonesIcon, PenTool, BookText, GraduationCap } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import Link from "next/link";
import { classNames } from "@/utils/classNames";
import styles from './UpcomingClassesCard.module.css';

const subjectIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; bgColor: string; textColor: string }> = {
  "Speaking": { icon: Mic, bgColor: styles.iconPrimary, textColor: styles.textPrimary },
  "Listening": { icon: HeadphonesIcon, bgColor: styles.iconYellow, textColor: styles.textYellow },
  "Reading": { icon: BookOpen, bgColor: styles.iconBlue, textColor: styles.textBlue },
  "Writing": { icon: PenTool, bgColor: styles.iconGreen, textColor: styles.textGreen },
  "Vocabulary": { icon: BookText, bgColor: styles.iconPurple, textColor: styles.textPurple },
  "Grammar": { icon: Languages, bgColor: styles.iconAmber, textColor: styles.textAmber },
  "Assessment": { icon: GraduationCap, bgColor: styles.iconRed, textColor: styles.textRed },
};

export function UpcomingClassesCard() {
  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"]
  });
  
  // Sort lessons by date and time
  const upcomingLessons = lessons 
    ? [...lessons]
        .filter(lesson => lesson.status === 'upcoming')
        .sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          return a.startTime.localeCompare(b.startTime);
        })
        .slice(0, 3)
    : [];
  
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };
  
  const getSubjectIcon = (subject: string) => {
    const iconConfig = subjectIcons[subject] || { 
      icon: Languages, 
      bgColor: styles.iconDefault, 
      textColor: styles.textDefault 
    };
    
    const IconComponent = iconConfig.icon;
    
    return (
      <div className={classNames(styles.iconContainer, iconConfig.bgColor)}>
        <IconComponent className={iconConfig.textColor} />
      </div>
    );
  };
  
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <h2 className={styles.title}>Upcoming Language Lessons</h2>
        <Link href="/dashboard/lessons" className={styles.viewAll}>
          View All
        </Link>
      </CardHeader>
      
      <CardContent className={styles.content}>
        {isLoading ? (
          <div className={styles.emptyState}>Loading upcoming classes...</div>
        ) : upcomingLessons.length === 0 ? (
          <div className={styles.emptyState}>No upcoming classes scheduled</div>
        ) : (
          upcomingLessons.map((lesson) => (
            <div key={lesson.id} className={styles.lessonItem}>
              {getSubjectIcon(lesson.subject)}
              <div className={styles.lessonInfo}>
                <h4 className={styles.lessonTitle}>{lesson.title}</h4>
                <p className={styles.lessonMeta}>Class {lesson.classId} • {lesson.location}</p>
              </div>
              <div className={styles.lessonTime}>
                <p className={styles.time}>{lesson.startTime}</p>
                <p className={styles.date}>{getDateLabel(new Date(lesson.date))}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
