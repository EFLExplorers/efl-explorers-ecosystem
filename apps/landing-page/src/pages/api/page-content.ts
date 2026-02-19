import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";
import { requireApiKey } from "../../utils/apiAuth";
import { mapPageSectionsForProps } from "../../utils/pageSectionMappers";

export interface PageSection {
  id: string;
  section_key: string;
  section_type: string;
  title?: string;
  subtitle?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  cta_label?: string;
  cta_href?: string;
  content: Record<string, any>;
  data?: Record<string, any>;
  settings?: Record<string, any>;
  sort_order: number;
  active: boolean;
}

export interface PageContent {
  id: string;
  route: string;
  title?: string;
  meta_description?: string;
  sections: PageSection[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PageContent | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireApiKey(req, res)) {
    return;
  }

  const { route } = req.query;

  if (!route || typeof route !== "string") {
    return res.status(400).json({ error: "Route parameter is required" });
  }

  try {
    // Fetch page data
    const pageData = await prisma.page.findUnique({
      where: { route },
      select: { id: true, route: true, title: true, metaDescription: true },
    });

    if (!pageData) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Fetch page sections
    const sectionsData = await prisma.pageSection.findMany({
      where: { pageId: pageData.id, active: true },
      orderBy: { sortOrder: "asc" },
    });

    const pageContent: PageContent = {
      id: pageData.id,
      route: pageData.route,
      title: pageData.title ?? undefined,
      meta_description: pageData.metaDescription ?? undefined,
      sections: mapPageSectionsForProps(sectionsData || []),
    };

    res.status(200).json(pageContent);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
