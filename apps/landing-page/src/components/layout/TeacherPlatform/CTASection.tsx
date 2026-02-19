import Link from "next/link";
import styles from "./CTASection.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface TeacherCTASectionProps {
  section: PageSection | null;
}

export const TeacherCTASection = ({ section }: TeacherCTASectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const subtitle =
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";
  const buttonLabel =
    (section.content as any)?.button?.label ??
    (section.content as any)?.cta_label ??
    section.cta_label ??
    "";
  const buttonHref =
    (section.content as any)?.button?.href ??
    (section.content as any)?.cta_href ??
    section.cta_href ??
    "";

  return (
    <section className={styles.cta} data-cy="teacher-cta-section">
      <h2 data-cy="teacher-cta-title">{title}</h2>
      <p data-cy="teacher-cta-subtitle">{subtitle}</p>
      {buttonLabel && buttonHref ? (
        <Link
          href={buttonHref}
          className={styles.registerButton}
          data-cy="teacher-cta-button"
        >
          {buttonLabel}
        </Link>
      ) : null}
    </section>
  );
};
