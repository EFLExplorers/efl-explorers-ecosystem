'use client';

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Bell, MessageSquare, Search, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { classNames } from "@/utils/classNames";
import styles from './TeacherHeader.module.css';

export interface TeacherHeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

function buildDisplayName(params: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  const fullName = [params.firstName, params.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;
  if (params.name?.trim()) return params.name.trim();
  if (params.email?.trim()) return params.email.trim().split("@")[0];
  return "Teacher";
}

function buildInitials(params: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  const first = params.firstName?.trim();
  const last = params.lastName?.trim();

  if (first || last) {
    return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "T";
  }

  if (params.name?.trim()) {
    const parts = params.name.trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "T";
  }

  if (params.email?.trim()) {
    return params.email.trim().slice(0, 2).toUpperCase();
  }

  return "T";
}

export function TeacherHeader({ collapsed, setCollapsed }: TeacherHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const { data: session } = useSession();

  const user = session?.user;
  const displayName = buildDisplayName({
    firstName: user?.firstName,
    lastName: user?.lastName,
    name: user?.name,
    email: user?.email,
  });
  const initials = buildInitials({
    firstName: user?.firstName,
    lastName: user?.lastName,
    name: user?.name,
    email: user?.email,
  });

  const handleLogout = async () => {
    const baseLandingUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL?.replace(/\/$/, "");
    const callbackUrl = baseLandingUrl
      ? `${baseLandingUrl}/Auth/login/teacher`
      : "/Auth/login/teacher";

    await signOut({ callbackUrl });
  };

  return (
    <header className={styles.header}>
      <div className={styles.mobileMenu}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.mobileMenuButton}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className={styles.menuIcon} />
        </Button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Input
            type="text"
            placeholder="Search for lessons, resources..."
            className={styles.searchInput}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <span className={styles.searchIcon}>
            <Search className={styles.searchIconSvg} />
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={styles.actionButton}>
              <Bell className={styles.actionIcon} />
              <span className={styles.badge}>
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.dropdownContent}>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className={styles.dropdownScroll}>
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className={styles.dropdownItem}>
                  <div className={styles.notificationContent}>
                    <p className={styles.notificationTitle}>New assignment submitted</p>
                    <p className={styles.notificationText}>
                      Emma Wilson submitted Science Lab worksheet
                    </p>
                    <p className={styles.notificationTime}>10 minutes ago</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={styles.viewAll}>
              <span className={styles.viewAllText}>View all notifications</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={styles.actionButton}>
              <MessageSquare className={styles.actionIcon} />
              <span className={styles.badge}>
                5
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.dropdownContent}>
            <DropdownMenuLabel>Messages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className={styles.dropdownScroll}>
              {[1, 2, 3, 4, 5].map((i) => (
                <DropdownMenuItem key={i} className={styles.dropdownItem}>
                  <div className={styles.messageContent}>
                    <Avatar className={styles.messageAvatar}>
                      <AvatarFallback className={styles.messageAvatarFallback}>
                        {i % 2 === 0 ? "SW" : "RM"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={styles.messageText}>
                      <p className={styles.messageName}>
                        {i % 2 === 0 ? "Sarah Wilson" : "Robert Miller"}
                      </p>
                      <p className={styles.messagePreview}>
                        Can we discuss Emma's progress in class?
                      </p>
                      <p className={styles.messageTime}>
                        {i} {i === 1 ? "hour" : "hours"} ago
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={styles.viewAll}>
              <span className={styles.viewAllText}>View all messages</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={styles.profileButton}>
              <Avatar className={styles.profileAvatar}>
                <AvatarFallback className={styles.profileAvatarFallback}>{initials}</AvatarFallback>
              </Avatar>
              <span className={styles.profileName}>{displayName}</span>
              <ChevronDown className={styles.profileChevron} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings?tab=profile"
                className={styles.dropdownLink}
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
