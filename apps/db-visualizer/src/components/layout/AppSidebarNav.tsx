"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, Lock, Network } from "lucide-react";
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
];

export const AppSidebarNav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Visualizer routes">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
          >
            <Icon size={16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
