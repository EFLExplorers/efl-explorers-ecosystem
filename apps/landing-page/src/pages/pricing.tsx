import type { NextPage } from "next";
import Head from "next/head";
import { GetStaticProps } from "next";
import {
  PricingTable,
  type PricingPlan,
} from "../components/layout/Pricing/PricingTable";
import { PageLayout } from "../components/layout/PageLayout";
import type { PageSection } from "./api/page-content";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { getGlobalLayoutContent } from "../utils/globalSections";
import { prisma } from "@repo/database";
import { mapPageSectionsForProps } from "../utils/pageSectionMappers";

interface PricingPageProps {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
  pageTitle: string;
  pageDescription: string;
  headerSection: PageSection | null;
  footerSection: PageSection | null;
  plans: PricingPlan[];
}

type PricingPlanRow = {
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: any;
  sortOrder: number | null;
  active: boolean | null;
};

export const Pricing: NextPage<PricingPageProps> = ({
  pageTitle,
  pageDescription,
  headerSection,
  footerSection,
  plans,
}) => {
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <PageLayout>
        <PricingTable
          headerSection={headerSection}
          footerSection={footerSection}
          plans={plans}
        />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps<PricingPageProps> = async () => {
  const { headerContent, footerContent } = await getGlobalLayoutContent();

  // Fetch page content
  const pageData = await prisma.page.findUnique({
    where: { route: "/pricing" },
    select: { id: true, route: true, title: true, metaDescription: true },
  });

  if (!pageData?.id) {
    throw new Error(
      "[Pricing] Missing pages row for route '/pricing': no id"
    );
  }

  const sectionsData = await prisma.pageSection.findMany({
    where: { pageId: pageData.id, active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!sectionsData?.length) {
    throw new Error(
      "[Pricing] Missing page_sections for '/pricing': none"
    );
  }

  const sections = mapPageSectionsForProps(sectionsData);
  if (!pageData.title || !pageData.metaDescription) {
    throw new Error(
      "[Pricing] Missing required page fields (title, meta_description)"
    );
  }

  const pageTitle = pageData.title;
  const pageDescription = pageData.metaDescription;

  const headerSection =
    sections.find((s) => s.section_key === "pricing-header") || null;
  const footerSection =
    sections.find((s) => s.section_key === "pricing-footer") || null;

  if (!headerSection) {
    throw new Error("[Pricing] Missing pricing-header section.");
  }

  if (!footerSection) {
    throw new Error("[Pricing] Missing pricing-footer section.");
  }

  const planItems: PricingPlanRow[] = await prisma.contentItem.findMany({
    where: {
      pageId: pageData.id,
      contentType: "pricing_plan",
      active: true,
    },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      description: true,
      content: true,
      sortOrder: true,
      active: true,
    },
  });

  if (!planItems || planItems.length === 0) {
    throw new Error("[Pricing] Missing pricing plans.");
  }

  type PricingPlanItem = {
    slug: string | null;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    content: unknown | null;
  };

  const plans: PricingPlan[] = planItems.map((item: PricingPlanItem) => {
    if (!item.slug || !item.title || !item.content) {
      throw new Error(
        "[Pricing] Pricing plan missing required fields (slug, title, content)"
      );
    }
    const content = (item.content ?? {}) as Record<string, any>;
    return {
      slug: item.slug,
      title: item.title,
      badge: item.subtitle || null,
      description: item.description || null,
      content,
    };
  });

  return {
    props: {
      headerContent,
      footerContent,
      pageTitle,
      pageDescription,
      headerSection,
      footerSection,
      plans,
    },
  };
};

export default Pricing;
