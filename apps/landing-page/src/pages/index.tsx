import { GetStaticProps } from "next";
import { PageLayout } from "../components/layout/PageLayout";
import HeroSection from "../components/layout/Home/HeroSection";
import TaglineSection from "../components/layout/Home/TaglineSection";
import LearningToolsSection from "../components/layout/Home/LearningToolsSection";
import ServicesSection from "../components/layout/Home/ServicesSection";
import { PricingSection } from "../components/layout/Home/PricingSection";
import { RegisterCTASection } from "../components/layout/Home/RegisterCTASection";
import { HowWeTeachSection } from "../components/layout/Home/HowWeTeachSection";
import type { PageSection } from "./api/page-content";
import type { PricingTierLite } from "../components/layout/Home/PricingSection";
import type { ServiceLite } from "../components/layout/Home/ServicesSection";
import type { LearningToolLite } from "../components/layout/Home/LearningToolsSection";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "../utils/globalSections";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "../utils/pageSectionMappers";

interface HomePageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  heroSection: PageSection | null;
  taglineSection: PageSection | null;
  registerCTASection: PageSection | null;
  servicesSection: PageSection | null;
  pricingSection: PageSection | null;
  learningToolsSection: PageSection | null;
  howWeTeachSection: PageSection | null;
  pricingTiers: PricingTierLite[];
  services: ServiceLite[];
  learningTools: LearningToolLite[];
}

export const HomePage = ({
  heroSection,
  taglineSection,
  registerCTASection,
  servicesSection,
  pricingSection,
  learningToolsSection,
  howWeTeachSection,
  pricingTiers,
  services,
  learningTools,
}: HomePageProps) => {
  return (
    <PageLayout>
      <HeroSection section={heroSection} />
      <TaglineSection section={taglineSection} />
      <LearningToolsSection
        section={learningToolsSection}
        tools={learningTools}
      />
      <HowWeTeachSection section={howWeTeachSection} />
      <ServicesSection section={servicesSection} services={services} />
      <PricingSection section={pricingSection} pricingTiers={pricingTiers} />
      <RegisterCTASection section={registerCTASection} />
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  // Fetch page content
  const pageData = await prisma.page.findUnique({
    where: { route: "/" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[Home] Missing pages row for route '/': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!sectionsData?.length) {
    throw new Error(
      "[Home] Missing page_sections for '/': none"
    );
  }

  const sections: PageSection[] = mapPageSectionsForProps(sectionsData);

  // Find specific sections
  const heroSection = sections.find((s) => s.section_key === "hero") || null;
  const taglineSection =
    sections.find((s) => s.section_key === "tagline") || null;
  const registerCTASection =
    sections.find((s) => s.section_key === "register-cta") || null;
  const servicesSection =
    sections.find((s) => s.section_key === "services") || null;
  const pricingSection =
    sections.find((s) => s.section_key === "pricing") || null;
  const learningToolsSection =
    sections.find((s) => s.section_key === "learning-tools") || null;
  const howWeTeachSection =
    sections.find((s) => s.section_key === "how-we-teach") || null;

  // Fetch content types from the unified content_items table
  const [pricingData, servicesData, toolsData] = await Promise.all([
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "pricing",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "service",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
    prisma.contentItem.findMany({
      where: {
        pageId: pageData.id,
        contentType: "learning_tool",
        active: true,
      },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, description: true, content: true },
    }),
  ]);

  if (!pricingData || pricingData.length === 0) {
    throw new Error("[Home] Missing pricing tiers.");
  }
  if (!servicesData || servicesData.length === 0) {
    throw new Error("[Home] Missing services.");
  }
  if (!toolsData || toolsData.length === 0) {
    throw new Error("[Home] Missing learning tools.");
  }

  type ContentItemLiteRow = {
    id: string | null;
    title: string | null;
    description: string | null;
    content: unknown | null;
  };

  const pricingTiers: PricingTierLite[] = pricingData.map(
    (row: ContentItemLiteRow) => {
    if (!row.id || !row.content) {
      throw new Error(
        "[Home] Pricing tier missing required fields (id, content)"
      );
    }
    const out: any = { id: row.id, content: row.content };
    if (row.title != null) out.title = row.title;
    if (row.description != null) out.description = row.description;
    return out as PricingTierLite;
    }
  );

  const services: ServiceLite[] = servicesData.map(
    (row: ContentItemLiteRow) => {
    if (!row.id || !row.content) {
      throw new Error(
        "[Home] Service missing required fields (id, content)"
      );
    }
    const out: any = { id: row.id, content: row.content };
    if (row.title != null) out.title = row.title;
    if (row.description != null) out.description = row.description;
    return out as ServiceLite;
    }
  );

  const learningTools: LearningToolLite[] = toolsData.map(
    (row: ContentItemLiteRow) => {
    if (!row.id || !row.content) {
      throw new Error(
        "[Home] Learning tool missing required fields (id, content)"
      );
    }
    const out: any = { id: row.id, content: row.content };
    if (row.title != null) out.title = row.title;
    if (row.description != null) out.description = row.description;
    return out as LearningToolLite;
    }
  );

  return {
    props: {
      headerContent,
      footerContent,
      heroSection,
      taglineSection,
      registerCTASection,
      servicesSection,
      pricingSection,
      learningToolsSection,
      howWeTeachSection,
      pricingTiers,
      services,
      learningTools,
    },
  };
};

export default HomePage;
