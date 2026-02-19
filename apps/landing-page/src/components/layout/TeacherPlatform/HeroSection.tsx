import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSection.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface TeacherHeroSectionProps {
  section: PageSection | null;
}

export const TeacherHeroSection = ({ section }: TeacherHeroSectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const subtitle =
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";

  const ctaLabel =
    (section.content as any)?.cta?.label ??
    (section.content as any)?.cta_label ??
    section.cta_label ??
    "";
  const ctaHref =
    (section.content as any)?.cta?.href ??
    (section.content as any)?.cta_href ??
    section.cta_href ??
    "";

  const image = (section.content as any)?.image as
    | { src?: string; alt?: string; width?: number; height?: number }
    | undefined;
  const imageSrc = image?.src ?? "";
  const imageAlt = image?.alt ?? "Teacher portal image";
  const imageWidth = image?.width ?? 400;
  const imageHeight = image?.height ?? 300;

  return (
    <section className={styles.hero} data-cy="teacher-hero-section">
      <div className={styles.heroContent}>
        <h1 data-cy="teacher-hero-title">{title}</h1>
        <p data-cy="teacher-hero-subtitle">{subtitle}</p>
        {ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className={styles.primaryButton}
            data-cy="teacher-hero-cta"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
      <div className={styles.heroImage}>
        <div className={styles.placeholder}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className={styles.heroCharacter}
              data-cy="teacher-hero-image"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
};
