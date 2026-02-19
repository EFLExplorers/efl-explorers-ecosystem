import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import { mapFooterContentFromSection, mapHeaderContentFromSection } from "./pageSectionMappers";
import { prisma } from "@repo/database";

export interface GlobalLayoutContent {
  headerContent: HeaderContent | null;
  footerContent: FooterContent | null;
}

export const getGlobalLayoutContent = async (): Promise<GlobalLayoutContent> => {
  const data = await prisma.siteSection.findMany({
    where: {
      sectionKey: { in: ["header", "footer"] },
      active: true,
    },
    select: {
      sectionKey: true,
      content: true,
      active: true,
    },
  });

  if (!data?.length) {
    return { headerContent: null, footerContent: null };
  }

  const headerRow = data.find((s) => s.sectionKey === "header") || null;
  const footerRow = data.find((s) => s.sectionKey === "footer") || null;

  return {
    headerContent: mapHeaderContentFromSection(headerRow as any),
    footerContent: mapFooterContentFromSection(footerRow as any),
  };
};

