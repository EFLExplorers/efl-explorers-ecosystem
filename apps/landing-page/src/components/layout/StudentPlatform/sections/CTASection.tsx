import Link from "next/link";
import styles from "@/pages/platforms/student.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface StudentCTASectionProps {
  section: PageSection | null;
}

export const StudentCTASection = ({ section }: StudentCTASectionProps) => {
  if (!section) return null;

  const title = (section.content as any)?.title ?? "";
  const buttonLabel = (section.content as any)?.button?.label ?? "";
  const buttonHref = (section.content as any)?.button?.href ?? "";

  return (
    <section className={styles.cta} data-cy="student-cta-section">
      <div className={styles.ctaContent}>
        <h2 data-cy="student-cta-title">{title}</h2>
        {buttonLabel && buttonHref ? (
          <Link
            href={buttonHref}
            className={styles.registerButton}
            data-cy="student-cta-button"
          >
            {buttonLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
};
