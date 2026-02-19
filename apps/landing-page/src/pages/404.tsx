import React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import styles from "./404.module.css";
import { prisma } from "@repo/database";

interface Custom404Props {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  title: string;
  message: string;
  homeLinkText: string;
}

export default function Custom404({
  title,
  message,
  homeLinkText,
}: Custom404Props) {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link href="/">{homeLinkText}</Link>
    </div>
  );
}

export const getStaticProps: GetStaticProps<Custom404Props> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  // Fetch 404 page content from site_sections
  const sectionData = await prisma.siteSection.findFirst({
    where: { sectionKey: "404", active: true },
    select: { content: true },
  });

  if (!sectionData) {
    throw new Error(
      "[404] Missing site_sections row for section_key '404': no data"
    );
  }

  const content = sectionData.content as any;
  if (!content.title || !content.message || !content.home_link_text) {
    throw new Error(
      "[404] Missing required content fields in 404 site_section (title, message, home_link_text)"
    );
  }

  return {
    props: {
      headerContent,
      footerContent,
      title: content.title,
      message: content.message,
      homeLinkText: content.home_link_text,
    },
  };
};
