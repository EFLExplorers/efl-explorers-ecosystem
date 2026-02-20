'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  BookMarked, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  Menu, 
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useIsMobile } from "@/hooks/use-mobile";
import { classNames } from "@/utils/classNames";
import styles from './TeacherSidebar.module.css';

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface TeacherSidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export function TeacherSidebar({ collapsed, setCollapsed }: TeacherSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  // Handle automatic collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  const mainNavItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Students",
      href: "/dashboard/students",
      icon: Users,
    },
    {
      title: "Lessons",
      href: "/dashboard/lessons",
      icon: BookOpen,
    },
    {
      title: "Curriculum",
      href: "/dashboard/curriculum",
      icon: FileText,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: Calendar,
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: 5,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: BarChart2,
    },
    {
      title: "Materials",
      href: "/dashboard/materials",
      icon: BookMarked,
    },
    {
      title: "Bookmarks",
      href: "/dashboard/bookmarks",
      icon: Bookmark,
    },
  ];

  const bottomNavItems: SidebarNavItem[] = [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Help Center",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ];

  return (
    <aside 
      className={classNames(
        styles.sidebar,
        collapsed ? styles.collapsed : styles.expanded,
        isMobile && collapsed && styles.hidden
      )}
    >
      {/* Logo section */}
      <div className={styles.logoSection}>
        <div className={styles.logoContainer}>
          <GraduationCap className={styles.logoIcon} />
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>ESL Explorers</span>
              <span className={styles.logoSubtitle}>Teacher Portal</span>
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={styles.mobileToggle} 
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className={styles.menuIcon} />
        </Button>
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className={styles.collapseToggle} 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className={styles.collapseIcon} />
            ) : (
              <ChevronLeft className={styles.collapseIcon} />
            )}
          </Button>
        )}
      </div>
      
      {/* Main navigation */}
      <ScrollArea className={styles.scrollArea}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={classNames(
                      styles.navItem,
                      pathname === item.href && styles.active
                    )}
                  >
                    <item.icon className={classNames(styles.navIcon, collapsed && styles.navIconCentered)} />
                    {!collapsed && (
                      <span className={styles.navTitle}>{item.title}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className={styles.badge}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className={styles.badgeCollapsed}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      
      {/* Bottom actions */}
      <div className={styles.bottomSection}>
        <ul className={styles.bottomList}>
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div
                  className={classNames(
                    styles.navItem,
                    pathname === item.href && styles.active
                  )}
                >
                  <item.icon className={classNames(styles.navIcon, collapsed && styles.navIconCentered)} />
                  {!collapsed && (
                    <span className={styles.navTitle}>{item.title}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
