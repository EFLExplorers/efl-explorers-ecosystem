'use client';

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingClassesCard } from "@/components/dashboard/UpcomingClassesCard";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { TasksCard } from "@/components/dashboard/TasksCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { Button } from "@/components/ui/Button";
import { 
  UserRound, 
  BookOpen, 
  Calendar, 
  Clock, 
  Plus 
} from "lucide-react";
import { Student, Lesson, Task } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { data: session } = useSession();
  const displayName =
    session?.user?.firstName?.trim() ||
    session?.user?.name?.trim() ||
    "there";

  // Queries for dashboard stats
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"]
  });
  
  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"]
  });
  
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });
  
  const activeCourses = Array.from(new Set(lessons?.map(lesson => lesson.subject) || [])).length;
  
  const upcomingEvents = lessons
    ?.filter(lesson => lesson.status === 'upcoming')
    .length || 0;
  
  const teachingHours = lessons
    ?.reduce((total, lesson) => {
      const start = parseInt(lesson.startTime.split(':')[0]);
      const end = parseInt(lesson.endTime.split(':')[0]);
      return total + (end - start);
    }, 0) || 0;
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>ESL Teacher Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {displayName}. Here&apos;s what&apos;s on your schedule today.
          </p>
        </div>
        <div className={styles.headerAction}>
          <Button className={styles.createButton}>
            <Plus className={styles.createIcon} />
            Create Language Lesson
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className={styles.statsGrid}>
        <StatsCard 
          title="ESL Students" 
          value={students?.length || 0}
          icon={<UserRound className={styles.iconPrimary} />}
          change={{
            value: "From your live roster",
            type: "neutral"
          }}
          iconClassName={styles.iconBgPrimary}
        />
        
        <StatsCard 
          title="Language Levels" 
          value={activeCourses || 0}
          icon={<BookOpen className={styles.iconSecondary} />}
          change={{
            value: "Distinct subjects in lessons",
            type: "neutral"
          }}
          iconClassName={styles.iconBgSecondary}
        />
        
        <StatsCard 
          title="Upcoming Lessons" 
          value={upcomingEvents}
          icon={<Calendar className={styles.iconPurple} />}
          change={{ 
            value: `${upcomingEvents > 0 ? upcomingEvents : 'No'} scheduled this week`, 
            type: "neutral"
          }}
          iconClassName={styles.iconBgPurple}
        />
        
        <StatsCard 
          title="Language Teaching Hours" 
          value={teachingHours}
          icon={<Clock className={styles.iconGreen} />}
          change={{
            value: "Sum of scheduled lesson hours",
            type: "neutral"
          }}
          iconClassName={styles.iconBgGreen}
        />
      </div>
      
      {/* Main dashboard content */}
      <div className={styles.contentGrid}>
        {/* Left column */}
        <div className={styles.leftColumn}>
          <UpcomingClassesCard />
          <PerformanceCard />
        </div>
        
        {/* Right column */}
        <div className={styles.rightColumn}>
          <TasksCard />
          <AnnouncementsCard />
        </div>
      </div>
    </div>
  );
}
