import Link from "next/link";
import { useRouter } from "next/router";

import { STUDENT_ROUTES } from "@/lib/navigation/student-routes";

import styles from "./student-nav.module.css";

export const StudentNav = () => {
  const router = useRouter();

  return (
    <nav className={styles.nav} aria-label="Student primary navigation">
      {STUDENT_ROUTES.map((route) => {
        const isActive = router.pathname === route.href;
        const className = isActive
          ? `${styles.link} ${styles.linkActive}`
          : styles.link;

        return (
          <Link key={route.href} href={route.href} className={className}>
            <span className={styles.linkLabel}>{route.label}</span>
            <span className={styles.linkHint}>{route.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
};
