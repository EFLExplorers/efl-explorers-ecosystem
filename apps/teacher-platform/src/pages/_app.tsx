import type { AppProps } from "next/app";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/Toaster";
import { TeacherLayout } from "@/components/layout/TeacherLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <TeacherLayout>
        <Component {...pageProps} />
      </TeacherLayout>
      <Toaster />
    </Providers>
  );
}
