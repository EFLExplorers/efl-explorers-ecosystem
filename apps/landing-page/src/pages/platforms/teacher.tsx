import {
  TeacherHeroSection,
  TeachingToolsSection,
  LessonModulesSection,
  TeacherBenefitsSection,
  TeacherCTASection,
} from "@/components/layout/TeacherPlatform";
import styles from "./teacher.module.css";
import type { GetStaticProps } from "next";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import type { PageSection } from "@/pages/api/page-content";
import type { TeachingToolLite } from "@/components/layout/TeacherPlatform/TeachingToolsSection";
import type {
  LessonModuleLite,
  LessonModuleColorKey,
} from "@/components/layout/TeacherPlatform/LessonModulesSection";
import type { TeacherBenefitLite } from "@/components/layout/TeacherPlatform/TeacherBenefitsSection";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "@/utils/pageSectionMappers";

interface TeacherPlatformPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  heroSection: PageSection | null;
  toolsSection: PageSection | null;
  modulesSection: PageSection | null;
  benefitsSection: PageSection | null;
  ctaSection: PageSection | null;
  tools: TeachingToolLite[];
  modules: LessonModuleLite[];
  benefits: TeacherBenefitLite[];
}

type TeacherContentRow = {
  id: string | null;
  title: string | null;
  description: string | null;
  content: any;
};

export default function TeacherPlatform(props: TeacherPlatformPageProps) {
  return (
    <main className={styles.main}>
      <TeacherHeroSection section={props.heroSection} />
      <TeachingToolsSection section={props.toolsSection} tools={props.tools} />
      <LessonModulesSection
        section={props.modulesSection}
        modules={props.modules}
      />
      <TeacherBenefitsSection
        section={props.benefitsSection}
        benefits={props.benefits}
      />
      <TeacherCTASection section={props.ctaSection} />
    </main>
  );
}

export const getStaticProps: GetStaticProps<
  TeacherPlatformPageProps
> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  const pageData = await prisma.page.findUnique({
    where: { route: "/platforms/teacher" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[TeacherPlatform] Missing pages row for route '/platforms/teacher': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!sectionsData?.length) {
    throw new Error(
      "[TeacherPlatform] Missing page_sections for '/platforms/teacher': none"
    );
  }

  const sections = mapPageSectionsForProps(sectionsData);
  const heroSection = sections.find((s) => s.section_key === "hero") || null;
  const toolsSection = sections.find((s) => s.section_key === "tools") || null;
  const modulesSection =
    sections.find((s) => s.section_key === "lesson-modules") || null;
  const benefitsSection =
    sections.find((s) => s.section_key === "benefits") || null;
  const ctaSection = sections.find((s) => s.section_key === "cta") || null;

  if (!heroSection) throw new Error("[TeacherPlatform] Missing hero section.");
  if (!toolsSection)
    throw new Error("[TeacherPlatform] Missing tools section.");
  if (!modulesSection)
    throw new Error("[TeacherPlatform] Missing lesson-modules section.");
  if (!benefitsSection)
    throw new Error("[TeacherPlatform] Missing benefits section.");
  if (!ctaSection) throw new Error("[TeacherPlatform] Missing cta section.");

  const [toolsData, modulesData, benefitsData]: [
    TeacherContentRow[],
    TeacherContentRow[],
    TeacherContentRow[]
  ] = await Promise.all([
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "teaching_tool",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "lesson_module",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "teacher_benefit",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
  ]);

  if (!toolsData || toolsData.length === 0) {
    throw new Error("[TeacherPlatform] Missing teaching tools.");
  }
  if (!modulesData || modulesData.length === 0) {
    throw new Error("[TeacherPlatform] Missing lesson modules.");
  }
  if (!benefitsData || benefitsData.length === 0) {
    throw new Error("[TeacherPlatform] Missing teacher benefits.");
  }

  type TeacherContentItemRow = {
    id: string | null;
    title: string | null;
    description: string | null;
    content: unknown | null;
  };

  const tools: TeachingToolLite[] = toolsData.map(
    (row: TeacherContentItemRow) => {
    if (!row.id || !row.title || !row.description || !row.content) {
      throw new Error(
        "[TeacherPlatform] Teaching tool missing required fields"
      );
    }
    const content = (row.content ?? {}) as Record<string, any>;
    if (!content.icon) {
      throw new Error(
        "[TeacherPlatform] Teaching tool missing icon in content"
      );
    }
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      icon: content.icon,
    };
    }
  );

  const modules: LessonModuleLite[] = modulesData.map(
    (row: TeacherContentItemRow) => {
    if (!row.id || !row.title || !row.description || !row.content) {
      throw new Error(
        "[TeacherPlatform] Lesson module missing required fields"
      );
    }
    const content = (row.content ?? {}) as Record<string, any>;
    if (
      !content.students ||
      !content.lessons ||
      !content.duration ||
      !content.colorKey
    ) {
      throw new Error(
        "[TeacherPlatform] Lesson module missing required content fields (students, lessons, duration, colorKey)"
      );
    }
    return {
      id: row.id,
      name: row.title,
      description: row.description,
      students: content.students,
      lessons: content.lessons,
      duration: content.duration,
      colorKey: content.colorKey as LessonModuleColorKey,
    };
    }
  );

  const benefits: TeacherBenefitLite[] = benefitsData.map(
    (row: TeacherContentItemRow) => {
    if (!row.id || !row.title || !row.description) {
      throw new Error(
        "[TeacherPlatform] Teacher benefit missing required fields (id, title, description)"
      );
    }
    return {
      id: row.id,
      title: row.title,
      description: row.description,
    };
    }
  );

  return {
    props: {
      headerContent,
      footerContent,
      heroSection,
      toolsSection,
      modulesSection,
      benefitsSection,
      ctaSection,
      tools,
      modules,
      benefits,
    },
  };
};
