import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database";
import { requireApiKey } from "../../utils/apiAuth";

export interface ContentItem {
  id: string;
  content_type: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: Record<string, any>;
  metadata?: Record<string, any>;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Backward compatibility interfaces
export interface PricingTier extends ContentItem {
  content: {
    price: string;
    period: string;
    description: string;
    is_featured?: boolean;
  };
}

export interface Service extends ContentItem {
  description: string;
  content: {
    icon: string;
    background_icons: string[];
  };
}

export interface LearningTool extends ContentItem {
  description: string;
  content: {
    icon: string;
  };
}

export interface FAQ extends ContentItem {
  description: string;
  content: {
    category: string;
  };
}

type ContentItemRow = {
  id: string;
  contentType: string;
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: any;
  metadata: any;
  sortOrder: number;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ContentType =
  | "pricing"
  | "pricing_plan"
  | "service"
  | "learning_tool"
  | "faq"
  | "team_member"
  | "about_stat"
  | "core_value"
  | "student_character"
  | "student_planet"
  | "teaching_tool"
  | "lesson_module"
  | "teacher_benefit"
  | "testimonial";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentItem[] | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireApiKey(req, res)) {
    return;
  }

  const { type, category } = req.query;

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "Type parameter is required" });
  }

  try {
    const whereClause: any = {
      contentType: type,
      active: true,
    };

    if (type === "faq" && category && typeof category === "string") {
      whereClause.content = { path: ["category"], equals: category };
    }

    const data: ContentItemRow[] = await prisma.contentItem.findMany({
      where: whereClause,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        contentType: true,
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        content: true,
        metadata: true,
        sortOrder: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const serialized = data.map((item) => ({
      id: item.id,
      content_type: item.contentType,
      slug: item.slug ?? undefined,
      title: item.title ?? "",
      subtitle: item.subtitle ?? undefined,
      description: item.description ?? undefined,
      content: (item.content ?? {}) as Record<string, any>,
      metadata: (item.metadata ?? {}) as Record<string, any>,
      sort_order: item.sortOrder,
      active: item.active,
      created_at: item.createdAt?.toISOString(),
      updated_at: item.updatedAt?.toISOString(),
    }));

    res.status(200).json(serialized);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}