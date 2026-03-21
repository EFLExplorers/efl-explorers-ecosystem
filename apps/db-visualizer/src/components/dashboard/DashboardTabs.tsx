import Link from "next/link";
import { BookOpen, Boxes, Lock, Network } from "lucide-react";
import type { ComponentType } from "react";

import styles from "./DashboardTabs.module.css";

type DashboardTab = "landing" | "auth" | "curriculum" | "connectivity";

type DashboardTabsProps = {
  activeTab: DashboardTab;
  selectedUserId?: string;
};

const tabs: {
  id: DashboardTab;
  label: string;
  icon: ComponentType<{ size?: number }>;
}[] = [
  { id: "landing", label: "Landing Logic", icon: Boxes },
  { id: "auth", label: "Auth & Mapping", icon: Lock },
  { id: "curriculum", label: "Curriculum Engine", icon: BookOpen },
  { id: "connectivity", label: "Global Connectivity", icon: Network },
];

export const DashboardTabs = ({ activeTab, selectedUserId }: DashboardTabsProps) => {
  return (
    <nav className={styles.tabList} aria-label="Database visualizer sections">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        const params = new URLSearchParams({ tab: tab.id });
        if (selectedUserId) {
          params.set("userId", selectedUserId);
        }

        return (
          <Link
            key={tab.id}
            href={`/?${params.toString()}`}
            className={`${styles.tabLink} ${isActive ? styles.tabLinkActive : ""}`}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
