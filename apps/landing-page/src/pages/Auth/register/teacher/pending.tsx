import Link from "next/link";
import styles from "@/styles/Auth.module.css";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import { prisma } from "@repo/database";

interface TeacherPendingPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  title: string;
  messages: string[];
  buttonLabel: string;
  buttonHref: string;
}

export const TeacherPendingPage = ({
  title,
  messages,
  buttonLabel,
  buttonHref,
}: TeacherPendingPageProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.messageBox}>
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
        <div className={styles.buttonGroup}>
          <Link href={buttonHref} className={styles.button}>
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherPendingPage;

export const getStaticProps: GetStaticProps<TeacherPendingPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  const pageData = await prisma.page.findUnique({
    where: { route: "/Auth/register/teacher/pending" },
    select: { id: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[TeacherPending] Missing pages row for route '/Auth/register/teacher/pending': no id"
    );
  }

  const sectionData = await prisma.pageSection.findFirst({
    where: {
      pageId: pageData.id,
      sectionKey: "content",
      active: true,
    },
    select: { content: true },
  });

  if (!sectionData) {
    throw new Error(
      "[TeacherPending] Missing page_sections for '/Auth/register/teacher/pending' (content): no data"
    );
  }

  const content = sectionData.content as any;
  if (
    !content.title ||
    !content.messages ||
    !Array.isArray(content.messages) ||
    content.messages.length === 0 ||
    !content.button_label ||
    !content.button_href
  ) {
    throw new Error(
      "[TeacherPending] Missing required content fields in content section"
    );
  }

  return {
    props: {
      headerContent,
      footerContent,
      title: content.title,
      messages: content.messages,
      buttonLabel: content.button_label,
      buttonHref: content.button_href,
    },
    revalidate: 300,
  };
};
