'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, ClipboardList, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Lesson } from "@shared/schema";
import { format } from "date-fns";
import { classNames } from "@/utils/classNames";
import styles from './lessons.module.css';

export default function LessonsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("upcoming");
  
  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"]
  });
  
  // Filter lessons based on search and tab
  const filteredLessons = lessons?.filter(lesson => 
    (lesson.title.toLowerCase().includes(search.toLowerCase()) ||
     lesson.subject.toLowerCase().includes(search.toLowerCase())) &&
    lesson.status === tab
  ) || [];
  
  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Science':
        return styles.badgePurple;
      case 'Mathematics':
        return styles.badgeBlue;
      case 'English':
        return styles.badgeGreen;
      default:
        return styles.badgeGray;
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Lessons</h1>
          <p className={styles.subtitle}>Create and manage your lesson plans</p>
        </div>
        <div className={styles.headerAction}>
          <Button className={styles.createButton}>
            <Plus className={styles.createIcon} />
            Create Lesson
          </Button>
        </div>
      </div>
      
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <div className={styles.searchBar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} />
              <Input
                placeholder="Search lessons..."
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className={styles.tabs}>
              <button 
                onClick={() => setTab("upcoming")}
                className={classNames(styles.tab, tab === 'upcoming' && styles.tabActive)}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setTab("completed")}
                className={classNames(styles.tab, tab === 'completed' && styles.tabActive)}
              >
                Completed
              </button>
              <button 
                onClick={() => setTab("draft")}
                className={classNames(styles.tab, tab === 'draft' && styles.tabActive)}
              >
                Drafts
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={styles.cardContent}>
          {isLoading ? (
            <div className={styles.emptyState}>Loading lessons...</div>
          ) : filteredLessons.length === 0 ? (
            <div className={styles.emptyState}>
              {tab === "draft" ? (
                <div className={styles.emptyStateContent}>
                  <div className={styles.emptyStateIcon}>
                    <ClipboardList className={styles.emptyIcon} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>No Draft Lessons</h3>
                  <p className={styles.emptyStateText}>
                    You haven't saved any lessons as drafts yet. Draft lessons can be edited and published later.
                  </p>
                  <Button className={styles.createButton}>
                    <Plus className={styles.createIcon} />
                    Create Draft Lesson
                  </Button>
                </div>
              ) : (
                `No ${tab} lessons found`
              )}
            </div>
          ) : (
            <div className={styles.lessonsGrid}>
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className={styles.lessonCard}>
                  <CardContent className={styles.lessonContent}>
                    <div className={styles.lessonHeader}>
                      <Badge className={getSubjectColor(lesson.subject)}>
                        {lesson.subject}
                      </Badge>
                      <Button variant="ghost" size="icon" className={styles.moreButton}>
                        <MoreVertical className={styles.moreIcon} />
                      </Button>
                    </div>
                    <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                    <p className={styles.lessonDescription}>{lesson.description}</p>
                    <div className={styles.lessonMeta}>
                      <ClipboardList className={styles.metaIcon} />
                      <span>Class {lesson.classId}</span>
                    </div>
                    <div className={styles.lessonDetails}>
                      <div>
                        <p className={styles.detailLabel}>Date</p>
                        <p className={styles.detailValue}>{format(new Date(lesson.date), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className={styles.detailLabel}>Time</p>
                        <p className={styles.detailValue}>{lesson.startTime} - {lesson.endTime}</p>
                      </div>
                      <div>
                        <p className={styles.detailLabel}>Room</p>
                        <p className={styles.detailValue}>{lesson.location && lesson.location.replace ? lesson.location.replace("Room ", "") : ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
