import { z } from "zod";

export const heroButtonSchema = z
  .object({
    label: z.string().optional(),
    href: z.string().optional(),
    text: z.string().optional(),
    url: z.string().optional(),
  })
  .passthrough();

export const heroSectionContentSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    buttons: z.array(heroButtonSchema).optional(),
  })
  .passthrough();

export const taglineSectionContentSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    text: z.string().optional(),
  })
  .passthrough();

export const pageSectionContentSchema = z.discriminatedUnion("section_key", [
  z.object({
    section_key: z.literal("hero"),
    content: heroSectionContentSchema,
  }),
  z.object({
    section_key: z.literal("tagline"),
    content: taglineSectionContentSchema,
  }),
]);

export type HeroSectionContent = z.infer<typeof heroSectionContentSchema>;
export type TaglineSectionContent = z.infer<typeof taglineSectionContentSchema>;
export type PageSectionContent = z.infer<typeof pageSectionContentSchema>;

export const getSectionContentSchema = (sectionKey?: string | null) => {
  switch (sectionKey) {
    case "hero":
      return heroSectionContentSchema;
    case "tagline":
      return taglineSectionContentSchema;
    default:
      return null;
  }
};
