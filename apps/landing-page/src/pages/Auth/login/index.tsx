import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/Auth.module.css";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import { prisma } from "@repo/database";

interface LoginPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  title: string;
  subtitle: string;
  studentButtonLabel: string;
  teacherButtonLabel: string;
  registerPrompt: string;
  registerLinkText: string;
  registerHref: string;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied.",
  Verification: "The sign-in link may have expired or already been used.",
  Default: "Sign-in failed. Please try again.",
};

export const LoginPage = ({
  title,
  subtitle,
  studentButtonLabel,
  teacherButtonLabel,
  registerPrompt,
  registerLinkText,
  registerHref,
}: LoginPageProps) => {
  const router = useRouter();
  const errorCode =
    typeof router.query.error === "string" ? router.query.error : null;
  const errorMessage = errorCode
    ? AUTH_ERROR_MESSAGES[errorCode] ?? AUTH_ERROR_MESSAGES.Default
    : null;

  const handlePlatformSelect = (platform: "student" | "teacher") => {
    router.push(`/Auth/login/${platform}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={() => handlePlatformSelect("student")}
            className={`${styles.button} ${styles.studentButton}`}
          >
            {studentButtonLabel}
          </button>
          <button
            onClick={() => handlePlatformSelect("teacher")}
            className={`${styles.button} ${styles.teacherButton}`}
          >
            {teacherButtonLabel}
          </button>
        </div>

        <p className={styles.registerLink}>
          {registerPrompt}{" "}
          <Link href={registerHref} className={styles.link}>
            {registerLinkText}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

export const getStaticProps: GetStaticProps<LoginPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  const pageData = await prisma.page.findUnique({
    where: { route: "/Auth/login" },
    select: { id: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[Login] Missing pages row for route '/Auth/login': no id"
    );
  }

  const sectionData = await prisma.pageSection.findFirst({
    where: {
      pageId: pageData.id,
      sectionKey: "selection",
      active: true,
    },
    select: { content: true },
  });

  if (!sectionData) {
    throw new Error(
      "[Login] Missing page_sections for '/Auth/login' (selection): no data"
    );
  }

  const content = sectionData.content as any;
  if (
    !content.title ||
    !content.subtitle ||
    !content.student_button_label ||
    !content.teacher_button_label ||
    !content.register_prompt ||
    !content.register_link_text ||
    !content.register_href
  ) {
    throw new Error(
      "[Login] Missing required content fields in selection section"
    );
  }

  return {
    props: {
      headerContent,
      footerContent,
      title: content.title,
      subtitle: content.subtitle,
      studentButtonLabel: content.student_button_label,
      teacherButtonLabel: content.teacher_button_label,
      registerPrompt: content.register_prompt,
      registerLinkText: content.register_link_text,
      registerHref: content.register_href,
    },
    revalidate: 300,
  };
};
