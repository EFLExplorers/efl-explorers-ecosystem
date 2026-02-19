import styles from "./TeacherBenefitsSection.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface TeacherBenefitLite {
  id: string;
  title: string;
  description: string;
}

export interface TeacherBenefitsSectionProps {
  section: PageSection | null;
  benefits: TeacherBenefitLite[];
}

export const TeacherBenefitsSection = ({
  section,
  benefits,
}: TeacherBenefitsSectionProps) => {
  if (!section) return null;
  if (!benefits?.length) return null;

  const title =
    (section.content as any)?.title ?? "Why Teachers Choose EFL Explorers";

  return (
    <section
      className={styles.teacherBenefits}
      data-cy="teacher-benefits-section"
    >
      <h2 data-cy="teacher-benefits-title">{title}</h2>
      <div className={styles.benefitsGrid} data-cy="teacher-benefits-grid">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className={styles.benefitCard}
            data-cy="teacher-benefit-card"
          >
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
