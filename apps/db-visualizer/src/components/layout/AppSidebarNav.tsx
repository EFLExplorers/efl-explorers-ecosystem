"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, Lock, Network, Table2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import styles from "./AppSidebarNav.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/landing", label: "Landing Logic", icon: Boxes },
  { href: "/auth", label: "Auth & Mapping", icon: Lock },
  { href: "/curriculum", label: "Curriculum Engine", icon: BookOpen },
  { href: "/connectivity", label: "Global Connectivity", icon: Network },
  { href: "/schema-map", label: "Schema map", icon: Table2 },
];

export const AppSidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Visualizer routes">
      <p className={styles.navHeading}>Views</p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={16} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
