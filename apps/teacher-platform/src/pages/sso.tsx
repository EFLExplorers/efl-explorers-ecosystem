import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function SSOReceiver() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    // Wait until the router is ready and has parsed the URL
    if (!router.isReady) return;

    if (token) {
      // Send the token to NextAuth's Credentials provider
      signIn("sso", {
        token: token as string,
        callbackUrl: "/", // Redirect to the dashboard after login
      });
    } else {
      // If there is no token, kick them back to the Landing Page login
      window.location.href =
        process.env.NEXT_PUBLIC_LANDING_PAGE_URL + "/Auth/login/teacher";
    }
  }, [token, router.isReady]);

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
