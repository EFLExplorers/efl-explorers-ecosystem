import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@shared/schema";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import styles from './AnnouncementsCard.module.css';

export function AnnouncementsCard() {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"]
  });
  
  const recentAnnouncements = announcements 
    ? [...announcements]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 2)
    : [];
  
  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className={styles.badgeHigh}>Important</Badge>;
      case 'medium':
        return <Badge variant="outline" className={styles.badgeMedium}>Medium</Badge>;
      default:
        return <Badge variant="outline" className={styles.badgeGeneral}>General</Badge>;
    }
  };
  
  const getTimeAgo = (date: Date | null) => {
    if (!date) return "unknown time";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <h2 className={styles.title}>Recent Announcements</h2>
        <Link href="/dashboard/messages" className={styles.viewAll}>
          View All
        </Link>
      </CardHeader>
      
      <CardContent className={styles.content}>
        {isLoading ? (
          <div className={styles.emptyState}>Loading announcements...</div>
        ) : recentAnnouncements.length === 0 ? (
          <div className={styles.emptyState}>No recent announcements</div>
        ) : (
          recentAnnouncements.map((announcement) => (
            <div key={announcement.id} className={styles.announcementItem}>
              <div className={styles.announcementHeader}>
                {getPriorityBadge(announcement.priority)}
                <span className={styles.timeAgo}>
                  {getTimeAgo(announcement.createdAt)}
                </span>
              </div>
              <h4 className={styles.announcementTitle}>{announcement.title}</h4>
              <p className={styles.announcementContent}>{announcement.content}</p>
            </div>
          ))
        )}
      </CardContent>
      
      <CardFooter className={styles.footer}>
        <Button 
          variant="ghost" 
          className={styles.createButton}
        >
          <Megaphone className={styles.createIcon} />
          Create announcement
        </Button>
      </CardFooter>
    </Card>
  );
}
