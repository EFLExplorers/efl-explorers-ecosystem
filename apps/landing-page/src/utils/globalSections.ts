import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import type { PageSection } from "../pages/api/page-content";
import { mapFooterContentFromSection, mapHeaderContentFromSection } from "./pageSectionMappers";
import { prisma } from "@repo/database";

export interface GlobalLayoutContent {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

interface SectionPayload {
  id: string;
  sectionKey: string;
  sectionType: string;
  content: unknown;
  sortOrder: number;
  active: boolean;
}

const mapSiteSectionToPageSection = (
  section: SectionPayload | null
): PageSection | null => {
  if (!section) return null;

  return {
    id: section.id,
    section_key: section.sectionKey,
    section_type: section.sectionType ?? "",
    content: (section.content ?? {}) as Record<string, unknown>,
    sort_order: section.sortOrder,
    active: section.active,
  };
};

export const getGlobalLayoutContent = async (): Promise<GlobalLayoutContent> => {
  const data: SectionPayload[] = await prisma.siteSection.findMany({
    where: {
      sectionKey: { in: ["header", "footer"] },
      active: true,
    },
    select: {
      id: true,
      sectionKey: true,
      sectionType: true,
      content: true,
      sortOrder: true,
      active: true,
    },
  });

  if (!data?.length) {
    return { headerContent: null, footerContent: null };
  }

  const headerRow = data.find((s) => s.sectionKey === "header") || null;
  const footerRow = data.find((s) => s.sectionKey === "footer") || null;

  return {
    headerContent: mapHeaderContentFromSection(
      mapSiteSectionToPageSection(headerRow)
    ),
    footerContent: mapFooterContentFromSection(
      mapSiteSectionToPageSection(footerRow)
    ),
  };
};

