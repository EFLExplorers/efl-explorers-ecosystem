import {
  StudentCTASection,
  StudentCharactersSection,
  StudentHeroSection,
  StudentPlanetsSection,
} from "@/components/layout/StudentPlatform";
import styles from "./student.module.css";
import type { GetStaticProps } from "next";
import type { PageSection } from "@/pages/api/page-content";
import type { StudentCharacter } from "@/components/layout/StudentPlatform/sections/CharactersSection";
import type { StudentPlanet } from "@/components/layout/StudentPlatform/sections/PlanetsSection";
import type { HeaderContent } from "@/components/layout/Header-Footer/Header";
import type { FooterContent } from "@/components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "@/utils/globalSections";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "@/utils/pageSectionMappers";

interface StudentPlatformPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  heroSection: PageSection | null;
  charactersSection: PageSection | null;
  planetsSection: PageSection | null;
  ctaSection: PageSection | null;
  characters: StudentCharacter[];
  planets: StudentPlanet[];
}

type StudentContentRow = {
  slug: string | null;
  title: string | null;
  content: any;
};

export default function StudentPlatform(props: StudentPlatformPageProps) {
  const {
    heroSection,
    charactersSection,
    planetsSection,
    ctaSection,
    characters,
    planets,
  } = props;

  return (
    <main className={styles.main}>
      <StudentHeroSection section={heroSection} />
      <StudentCharactersSection
        section={charactersSection}
        characters={characters}
      />
      <StudentPlanetsSection section={planetsSection} planets={planets} />
      <StudentCTASection section={ctaSection} />
    </main>
  );
}

export const getStaticProps: GetStaticProps<
  StudentPlatformPageProps
> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  const pageData = await prisma.page.findUnique({
    where: { route: "/platforms/student" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[StudentPlatform] Missing pages row for route '/platforms/student': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!sectionsData?.length) {
    throw new Error(
      "[StudentPlatform] Missing page_sections for '/platforms/student': none"
    );
  }

  const sections = mapPageSectionsForProps(sectionsData);

  const heroSection = sections.find((s) => s.section_key === "hero") || null;
  const charactersSection =
    sections.find((s) => s.section_key === "characters") || null;
  const planetsSection =
    sections.find((s) => s.section_key === "planets") || null;
  const ctaSection = sections.find((s) => s.section_key === "cta") || null;

  if (!heroSection) throw new Error("[StudentPlatform] Missing hero section.");
  if (!charactersSection)
    throw new Error("[StudentPlatform] Missing characters section.");
  if (!planetsSection)
    throw new Error("[StudentPlatform] Missing planets section.");
  if (!ctaSection) throw new Error("[StudentPlatform] Missing cta section.");

  const [characterItems, planetItems]: [StudentContentRow[], StudentContentRow[]] =
    await Promise.all([
      prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "student_character",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, content: true },
    }),
      prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "student_planet",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, content: true },
      }),
    ]);

  if (!characterItems || characterItems.length === 0) {
    throw new Error("[StudentPlatform] Missing student characters.");
  }
  if (!planetItems || planetItems.length === 0) {
    throw new Error("[StudentPlatform] Missing student planets.");
  }

  type StudentContentItemRow = {
    slug: string | null;
    title: string | null;
    content: unknown | null;
  };

  const characters: StudentCharacter[] = characterItems.map(
    (item: StudentContentItemRow) => {
    if (!item.slug || !item.title || !item.content) {
      throw new Error(
        "[StudentPlatform] Student character missing required fields"
      );
    }
    const content = (item.content ?? {}) as Record<string, any>;
    if (!content.imageUrl) {
      throw new Error(
        "[StudentPlatform] Student character missing imageUrl in content"
      );
    }
    return {
      slug: item.slug,
      name: item.title,
      imageUrl: content.imageUrl,
    };
    }
  );

  const planets: StudentPlanet[] = planetItems.map(
    (item: StudentContentItemRow) => {
    if (!item.slug || !item.title || !item.content) {
      throw new Error(
        "[StudentPlatform] Student planet missing required fields"
      );
    }
    const content = (item.content ?? {}) as Record<string, any>;
    if (!content.color || !content.icon) {
      throw new Error(
        "[StudentPlatform] Student planet missing color or icon in content"
      );
    }
    return {
      slug: item.slug,
      name: item.title,
      color: content.color,
      icon: content.icon,
    };
    }
  );

  return {
    props: {
      headerContent,
      footerContent,
      heroSection,
      charactersSection,
      planetsSection,
      ctaSection,
      characters,
      planets,
    },
  };
};
