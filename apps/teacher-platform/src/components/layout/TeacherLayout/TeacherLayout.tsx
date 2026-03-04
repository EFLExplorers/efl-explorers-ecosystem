'use client';

import { useState } from "react";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { TeacherHeader } from "@/components/layout/TeacherHeader";
import { classNames } from "@/utils/classNames";
import styles from './TeacherLayout.module.css';

export interface TeacherLayoutProps {
  children: React.ReactNode;
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <TeacherSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div 
        className={classNames(
          styles.content,
          collapsed ? styles.contentCollapsed : styles.contentExpanded
        )}
      >
        <TeacherHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
