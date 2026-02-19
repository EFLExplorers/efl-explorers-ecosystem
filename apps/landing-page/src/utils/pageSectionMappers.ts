import type { PageSection } from "../pages/api/page-content";
import type { FooterContent } from "../components/layout/Header-Footer/Footer";
import type { HeaderContent } from "../components/layout/Header-Footer/Header";
import type { PageSection as PrismaPageSection } from "@repo/database";
import { getSectionContentSchema } from "../schemas/page-sections";
import { parsePrismaJson } from "./prismaJson";

export const mapFooterContentFromSection = (
  section?: PageSection | null
): FooterContent | null => {
  if (!section) return null;
  const raw = parsePrismaJson<Record<string, any>>(section.content) ?? {};
  const columns =
    (raw.columns as FooterContent["columns"]) || [];
  const bottomBar =
    (raw.bottom_bar as FooterContent["bottomBar"]) || [];

  if (!columns.length && !bottomBar.length) return null;

  return {
    columns,
    bottomBar,
  };
};

export const mapHeaderContentFromSection = (
  section?: PageSection | null
): HeaderContent | null => {
  if (!section) return null;
  const raw = parsePrismaJson<Record<string, any>>(section.content) ?? {};

  const navbar = raw.navbar ?? raw.nav ?? null;
  const authButtons = raw.auth_buttons ?? raw.authButtons ?? null;

  if (!navbar && !authButtons) return null;

  // Avoid `undefined` values in Next.js props (not JSON-serializable)
  return {
    ...(navbar ? { navbar } : {}),
    ...(authButtons ? { authButtons } : {}),
  } as HeaderContent;
};

export const mapPageSectionForProps = (
  section: PrismaPageSection
): PageSection | null => {
  const parsedContent = parseSectionContent(
    section.sectionKey ?? null,
    section.content
  );

  if (parsedContent === null) {
    return null;
  }

  const out: PageSection = {
    id: section.id,
    section_key: section.sectionKey,
    section_type: section.sectionType ?? "",
    content: parsedContent,
    sort_order: section.sortOrder,
    active: section.active,
  };

  if (section.title != null) out.title = section.title;
  if (section.subtitle != null) out.subtitle = section.subtitle;
  if (section.heading != null) out.heading = section.heading;
  if (section.subheading != null) out.subheading = section.subheading;
  if (section.body != null) out.body = section.body;
  if (section.ctaLabel != null) out.cta_label = section.ctaLabel;
  if (section.ctaHref != null) out.cta_href = section.ctaHref;
  if (section.data != null) out.data = section.data as Record<string, any>;
  if (section.settings != null)
    out.settings = section.settings as Record<string, any>;

  return out;
};

export const mapPageSectionsForProps = (
  sections: PrismaPageSection[]
): PageSection[] =>
  sections
    .map((section) => mapPageSectionForProps(section))
    .filter((section): section is PageSection => Boolean(section));

const parseSectionContent = (
  sectionKey: string | null,
  content: PrismaPageSection["content"]
): Record<string, any> | null => {
  const schema = getSectionContentSchema(sectionKey);
  const raw = parsePrismaJson<Record<string, any>>(content);

  if (!schema) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return raw as Record<string, any>;
    }
    return {};
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    console.warn("[content] Invalid section content", {
      sectionKey,
      issues: ["Content is not a valid JSON object."],
    });
    return null;
  }

  const result = schema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  console.warn("[content] Invalid section content", {
    sectionKey,
    issues: result.error.issues,
  });
  return null;
};
