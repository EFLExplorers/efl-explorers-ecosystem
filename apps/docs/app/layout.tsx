import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

import "./globals.css";

const repositoryUrl = "https://github.com/6obby/efl-explorers-ecosystem";
const docsRepositoryBase = `${repositoryUrl}/tree/main/apps/docs`;
const landingPageUrl = "http://localhost:3000";
const teacherPlatformUrl = "http://localhost:3001";
const studentPlatformUrl = "http://localhost:3002";

export const metadata: Metadata = {
  title: {
    default: "EFL Explorers Docs",
    template: "%s | EFL Explorers Docs",
  },
  description: "Documentation for the EFL Explorers ecosystem.",
  applicationName: "EFL Explorers Docs",
  keywords: [
    "EFL Explorers",
    "documentation",
    "teacher platform",
    "student platform",
    "api reference",
  ],
};

export const RootLayout = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>
                  EFL Explorers Docs
                </span>
              }
            >
              <a href={landingPageUrl}>Landing</a>
              <a href={teacherPlatformUrl}>Teacher</a>
              <a href={studentPlatformUrl}>Student</a>
              <a href={repositoryUrl}>GitHub</a>
            </Navbar>
          }
          footer={
            <Footer>
              <span>
                EFL Explorers Docs - {new Date().getFullYear()} -{" "}
                <a href={repositoryUrl}>Repository</a>
              </span>
            </Footer>
          }
          pageMap={await getPageMap()}
          docsRepositoryBase={docsRepositoryBase}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
};

export default RootLayout;
