import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

import styles from "./sso.module.css";
const landingLoginUrl =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_LANDING_PAGE_URL) ||
  "";

const getTokenFromQuery = (
  token: string | string[] | undefined
): string | null => {
  if (token == null) return null;
  const raw = Array.isArray(token) ? token[0] : token;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
};

export const StudentSSOReceiver = () => {
  const router = useRouter();
  const { token: tokenQuery } = router.query;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const token = getTokenFromQuery(tokenQuery);

    if (!token) {
      window.location.href = landingLoginUrl
        ? `${landingLoginUrl}/Auth/login/student`
        : "/Auth/login/student";
      return;
    }

    signIn("sso", {
      token,
      callbackUrl: "/",
      redirect: false,
    }).then((result) => {
      if (result?.ok && result?.url) {
        window.location.href = result.url;
        return;
      }
      setError(
        result?.error === "CredentialsSignin"
          ? "This sign-in link is invalid or has already been used. Please log in again from the start."
          : "Sign-in failed. Please try again from the start."
      );
    });
  }, [tokenQuery, router.isReady]);

  if (error) {
    const loginUrl = landingLoginUrl
      ? `${landingLoginUrl}/Auth/login/student`
      : "#";
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <a href={loginUrl} className={styles.errorLink}>
          Log in again
        </a>
      </div>
    );
  }

  return (
    <div className={styles.loadingContainer}>
      <h2>Authenticating your session...</h2>
    </div>
  );
};

export default StudentSSOReceiver;
