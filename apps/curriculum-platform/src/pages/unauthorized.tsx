import Link from "next/link";
import { signOut } from "next-auth/react";

import styles from "@/pages/unauthorized.module.css";

export const UnauthorizedPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Access not allowed</h1>
        <p className={styles.text}>
          You are signed in, but this account is not an active curriculum
          manager. If you believe this is a mistake, contact an administrator.
        </p>
        <div className={styles.actions}>
          <Link className={styles.linkSecondary} href="/login">
            Back to login
          </Link>
          <button
            className={styles.button}
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
};

export default UnauthorizedPage;
