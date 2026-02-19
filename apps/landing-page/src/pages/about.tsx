import type { NextPage } from "next";
import Head from "next/head";
import { GetStaticProps } from "next";
import {
  AboutUsSection,
  TeamMember,
  AboutStat,
  CoreValue,
} from "../components/layout/About/AboutUsSection";
import { PageSection } from "./api/page-content";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "../utils/globalSections";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "../utils/pageSectionMappers";

interface AboutPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  pageTitle: string;
  pageDescription: string;
  teamMembers: TeamMember[];
  stats: AboutStat[];
  coreValues: CoreValue[];
  heroSection: PageSection | null;
  descriptionSection: PageSection | null;
  taglineSection: PageSection | null;
  missionSection: PageSection | null;
  visionSection: PageSection | null;
  teamIntroSection: PageSection | null;
  valuesHeaderSection: PageSection | null;
}

type AboutContentRow = {
  id: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: any;
  slug: string | null;
  sortOrder: number | null;
  active: boolean | null;
};

export const AboutPage: NextPage<AboutPageProps> = ({
  pageTitle,
  pageDescription,
  teamMembers,
  stats,
  coreValues,
  heroSection,
  descriptionSection,
  taglineSection,
  missionSection,
  visionSection,
  teamIntroSection,
  valuesHeaderSection,
}) => {

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Head>
      <AboutUsSection
        heroSection={heroSection}
        descriptionSection={descriptionSection}
        taglineSection={taglineSection}
        missionSection={missionSection}
        visionSection={visionSection}
        teamIntroSection={teamIntroSection}
        valuesHeaderSection={valuesHeaderSection}
        teamMembers={teamMembers}
        stats={stats}
        coreValues={coreValues}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps<AboutPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  // Fetch page content
  const pageData = await prisma.page.findUnique({
    where: { route: "/about" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[About] Missing pages row for route '/about': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  const sections = mapPageSectionsForProps(sectionsData || []);
  if (!pageData.title || !pageData.metaDescription) {
    throw new Error(
      "[About] Missing required page fields (title, meta_description)"
    );
  }

  const pageTitle = pageData.title;
  const pageDescription = pageData.metaDescription;

  // Find specific sections
  const heroSection = sections.find((s) => s.section_key === "hero") || null;
  const descriptionSection =
    sections.find((s) => s.section_key === "description") || null;
  const taglineSection =
    sections.find((s) => s.section_key === "tagline") || null;
  const missionSection =
    sections.find((s) => s.section_key === "mission") || null;
  const visionSection =
    sections.find((s) => s.section_key === "vision") || null;
  const teamIntroSection =
    sections.find((s) => s.section_key === "team-intro") || null;
  const valuesHeaderSection =
    sections.find((s) => s.section_key === "values-header") || null;

  // Fetch content types from the unified content_items table (scoped to /about)
  const [teamData, statsData, valuesData]: [
    AboutContentRow[],
    AboutContentRow[],
    AboutContentRow[]
  ] = await Promise.all([
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "team_member",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        content: true,
        slug: true,
        sortOrder: true,
        active: true,
      },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "about_stat",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        content: true,
        slug: true,
        sortOrder: true,
        active: true,
      },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "core_value",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        content: true,
        slug: true,
        sortOrder: true,
        active: true,
      },
    }),
  ]);

  if (!teamData || teamData.length === 0) {
    throw new Error("[About] Missing team members.");
  }
  if (!statsData || statsData.length === 0) {
    throw new Error("[About] Missing about stats.");
  }
  if (!valuesData || valuesData.length === 0) {
    throw new Error("[About] Missing core values.");
  }

  type AboutContentItemRow = {
    id: string | null;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    content: Record<string, any> | null;
  };

  const teamMembers: TeamMember[] = teamData.map((row: AboutContentItemRow) => {
    if (
      !row.id ||
      !row.title ||
      !row.subtitle ||
      !row.description ||
      !row.content
    ) {
      throw new Error(
        "[About] Team member missing required fields"
      );
    }
    return {
      id: row.id,
      name: row.title,
      role: row.subtitle,
      title: row.content.role || "",
      image: row.content.image || "",
      bio: row.description,
      expertise: row.content.expertise || [],
    };
  });

  const stats: AboutStat[] = statsData.map((row: AboutContentItemRow) => {
    if (!row.id || !row.title || !row.description) {
      throw new Error(
        "[About] About stat missing required fields (id, title, description)"
      );
    }
    return {
      id: row.id,
      number: row.title,
      label: row.description,
    };
  });

  const coreValues: CoreValue[] = valuesData.map((row: AboutContentItemRow) => {
    if (!row.id || !row.title || !row.description || !row.content) {
      throw new Error(
        "[About] Core value missing required fields"
      );
    }
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.content.icon || "",
    };
  });

  if (!heroSection) throw new Error("[About] Missing hero section.");
  if (!descriptionSection)
    throw new Error("[About] Missing description section.");
  if (!taglineSection) throw new Error("[About] Missing tagline section.");
  if (!missionSection) throw new Error("[About] Missing mission section.");
  if (!visionSection) throw new Error("[About] Missing vision section.");
  if (!teamIntroSection) throw new Error("[About] Missing team-intro section.");
  if (!valuesHeaderSection)
    throw new Error("[About] Missing values-header section.");
  if (!teamMembers.length) throw new Error("[About] Missing team members.");
  if (!stats.length) throw new Error("[About] Missing stats.");
  if (!coreValues.length) throw new Error("[About] Missing core values.");

  return {
    props: {
      headerContent,
      footerContent,
      pageTitle,
      pageDescription,
      teamMembers,
      stats,
      coreValues,
      heroSection,
      descriptionSection,
      taglineSection,
      missionSection,
      visionSection,
      teamIntroSection,
      valuesHeaderSection,
    },
  };
};

export default AboutPage;
