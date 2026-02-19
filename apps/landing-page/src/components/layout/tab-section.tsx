"use client";

import { useState } from "react";
import styles from "./tab-section.module.css";

interface Tab {
  title: string;
  content: string;
}

interface TabSectionProps {
  tabs: Tab[];
}

export default function TabSection({ tabs }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.tabSection}>
      <div className={styles.tabHeaders}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`${styles.tabButton} ${
              activeTab === index ? styles.active : ""
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeTab].content}</div>
    </div>
  );
}
