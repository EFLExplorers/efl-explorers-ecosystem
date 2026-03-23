import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EFL Database Visualizer",
  description: "Read-only top-down visualization across shared, auth, teachers, students, and curriculum schemas.",
};

export const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
