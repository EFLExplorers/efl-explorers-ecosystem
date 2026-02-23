import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/Toaster";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Providers>
        <TeacherLayout>
          <Component {...pageProps} />
        </TeacherLayout>
        <Toaster />
      </Providers>
    </SessionProvider>
  );
}
