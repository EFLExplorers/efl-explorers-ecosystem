import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const landingLoginUrl =
  (typeof window !== "undefined" && process.env.NEXT_PUBLIC_LANDING_PAGE_URL) ||
  "";

function getTokenFromQuery(token: string | string[] | undefined): string | null {
  if (token == null) return null;
  const raw = Array.isArray(token) ? token[0] : token;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

export default function SSOReceiver() {
  const router = useRouter();
  const { token: tokenQuery } = router.query;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const token = getTokenFromQuery(tokenQuery);

    if (!token) {
      window.location.href = landingLoginUrl
        ? `${landingLoginUrl}/Auth/login/teacher`
        : "/Auth/login/teacher";
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
      ? `${landingLoginUrl}/Auth/login/teacher`
      : "#";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: "1rem", maxWidth: "24rem" }}>{error}</p>
        <a
          href={loginUrl}
          style={{
            color: "var(--color-primary, #3b82f6)",
            textDecoration: "underline",
          }}
        >
          Log in again
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2>Authenticating your session...</h2>
    </div>
  );
}
