'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  MapPin,
  Grid3X3,
  Calendar as CalendarViewIcon,
  List
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Event } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './calendar.module.css';

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"]
  });
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Group events by date for the schedule view
  const todaysEvents = events?.filter(event => 
    isSameDay(new Date(event.date), new Date())
  ).sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];
  
  // Format time from 24h to 12h
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };
  
  // Determine event badge color based on type
  const getEventBadgeColor = (type: string | null) => {
    switch (type) {
      case 'class':
        return styles.badgePrimary;
      case 'meeting':
        return styles.badgeOrange;
      case 'deadline':
        return styles.badgeRed;
      default:
        return styles.badgeBlue;
    }
  };
  
  const getEventDotColor = (type: string | null) => {
    switch (type) {
      case 'class':
        return styles.dotPrimary;
      case 'meeting':
        return styles.dotOrange;
      default:
        return styles.dotBlue;
    }
  };
  
  const renderCells = () => {
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayEvents = events?.filter(event => 
          isSameDay(new Date(event.date), cloneDay)
        ) || [];
        
        days.push(
          <div
            key={day.toString()}
            className={classNames(
              styles.calendarCell,
              !isSameMonth(day, monthStart) && styles.calendarCellOtherMonth,
              isSameDay(day, new Date()) && styles.calendarCellToday
            )}
          >
            <div className={styles.cellHeader}>
              <span className={classNames(
                styles.cellDate,
                isSameDay(day, new Date()) && styles.cellDateToday
              )}>
                {formattedDate}
              </span>
              {dayEvents.length > 0 && (
                <Badge variant="outline" className={styles.cellBadge}>
                  {dayEvents.length}
                </Badge>
              )}
            </div>
            <div className={styles.cellEvents}>
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div 
                  key={idx} 
                  className={classNames(
                    styles.eventChip,
                    getEventBadgeColor(event.type)
                  )}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className={styles.moreEvents}>
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className={styles.calendarRow}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className={styles.calendarGrid}>{rows}</div>;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>Manage your schedule and events</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" className={styles.todayButton} onClick={goToToday}>
            Today
          </Button>
          <div className={styles.navigationButtons}>
            <Button variant="outline" size="sm" className={styles.navButton} onClick={goToPreviousMonth}>
              <ChevronLeft className={styles.navIcon} />
            </Button>
            <Button variant="outline" size="sm" className={styles.navButton} onClick={goToNextMonth}>
              <ChevronRight className={styles.navIcon} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className={styles.contentGrid}>
        <div className={styles.calendarSection}>
          <Card className={styles.calendarCard}>
            <CardHeader className={styles.calendarHeader}>
              <h2 className={styles.calendarTitle}>
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <div className={styles.viewButtons}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={classNames(styles.viewButton, view === "month" && styles.viewButtonActive)} 
                  onClick={() => setView("month")}
                >
                  <Grid3X3 className={styles.viewIcon} />
                  Month
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={classNames(styles.viewButton, view === "week" && styles.viewButtonActive)} 
                  onClick={() => setView("week")}
                >
                  <CalendarViewIcon className={styles.viewIcon} />
                  Week
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={classNames(styles.viewButton, view === "day" && styles.viewButtonActive)} 
                  onClick={() => setView("day")}
                >
                  <List className={styles.viewIcon} />
                  Day
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className={styles.calendarContent}>
              <div className={styles.weekDaysHeader}>
                {weekDays.map((day) => (
                  <div key={day} className={styles.weekDay}>
                    {day}
                  </div>
                ))}
              </div>
              
              {isLoading ? (
                <div className={styles.loadingState}>Loading calendar events...</div>
              ) : (
                renderCells()
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className={styles.scheduleSection}>
          <Card className={styles.scheduleCard}>
            <CardHeader className={styles.scheduleHeader}>
              <h2 className={styles.scheduleTitle}>Today's Schedule</h2>
              <p className={styles.scheduleDate}>{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </CardHeader>
            
            <CardContent className={styles.scheduleContent}>
              {isLoading ? (
                <div className={styles.loadingState}>Loading events...</div>
              ) : todaysEvents.length === 0 ? (
                <div className={styles.emptyState}>No events scheduled for today</div>
              ) : (
                <div className={styles.eventsList}>
                  {todaysEvents.map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      <div className={styles.eventContent}>
                        <div className={classNames(styles.eventDot, getEventDotColor(event.type))}></div>
                        <div className={styles.eventDetails}>
                          <h4 className={styles.eventTitle}>{event.title}</h4>
                          <p className={styles.eventDescription}>{event.description}</p>
                          <div className={styles.eventMeta}>
                            <div className={styles.eventMetaItem}>
                              <Clock className={styles.metaIcon} />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            {event.location && (
                              <div className={styles.eventMetaItem}>
                                <MapPin className={styles.metaIcon} />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
