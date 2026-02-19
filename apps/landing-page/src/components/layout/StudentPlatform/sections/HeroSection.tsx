import Link from "next/link";
import Image from "next/image";
import styles from "@/pages/platforms/student.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface StudentHeroSectionProps {
  section: PageSection | null;
}

export const StudentHeroSection = ({ section }: StudentHeroSectionProps) => {
  if (!section) return null;

  const title = (section.content as any)?.title ?? "";
  const subtitle = (section.content as any)?.subtitle ?? "";
  const ctaLabel = (section.content as any)?.cta?.label ?? "";
  const ctaHref = (section.content as any)?.cta?.href ?? "";
  const imageSrc = (section.content as any)?.image?.src ?? "";
  const imageAlt = (section.content as any)?.image?.alt ?? "";
  const imageWidth = Number((section.content as any)?.image?.width || 0);
  const imageHeight = Number((section.content as any)?.image?.height || 0);

  return (
    <section className={styles.hero} data-cy="student-hero-section">
      <div className={styles.heroContent}>
        <h1 data-cy="student-hero-title">{title}</h1>
        <p data-cy="student-hero-subtitle">{subtitle}</p>
        {ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className={styles.primaryButton}
            data-cy="student-hero-cta"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
      <div className={styles.heroImage}>
        <div className={styles.placeholder} data-cy="student-hero-placeholder">
          {imageSrc && imageAlt && imageWidth && imageHeight ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className={styles.heroCharacter}
              priority
            />
          ) : null}
        </div>
      </div>
    </section>
  );
};
