import type { AppProps } from "next/app";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/Toaster";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import { applyAppearance, getStoredAppearance } from "@/utils/appearance";
import "@/styles/globals.css";

function AppearanceBootstrap() {
  useEffect(() => {
    const stored = getStoredAppearance();
    applyAppearance(stored);

    if (stored.theme !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const updated = getStoredAppearance();
      if (updated.theme === "system") {
        applyAppearance(updated);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return null;
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Providers>
        <AppearanceBootstrap />
        <TeacherLayout>
          <Component {...pageProps} />
        </TeacherLayout>
        <Toaster />
      </Providers>
    </SessionProvider>
  );
}
