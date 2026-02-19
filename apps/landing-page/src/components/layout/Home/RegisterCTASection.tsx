import Link from "next/link";
import { PageSection } from "../../../pages/api/page-content";
import styles from "./RegisterCTASection.module.css";

export interface RegisterCTASectionProps {
  section: PageSection | null;
}

export const RegisterCTASection = ({ section }: RegisterCTASectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const subtitle =
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";
  const ctaLabel =
    (section.content as any)?.cta_label ??
    (section.data as any)?.cta_label ??
    section.cta_label ??
    "";
  const ctaHref =
    (section.content as any)?.cta_href ??
    (section.data as any)?.cta_href ??
    section.cta_href ??
    "";

  return (
    <section className={styles.registerCta} data-cy="register-cta-section">
      <div className={styles.registerCtaContent}>
        <h2 className={styles.registerCtaTitle} data-cy="register-cta-title">
          {title}
        </h2>
        <p className={styles.registerCtaSubtitle} data-cy="register-cta-subtitle">
          {subtitle}
        </p>
        {ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className={styles.registerCtaButton}
            data-cy="register-cta-button"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
};
