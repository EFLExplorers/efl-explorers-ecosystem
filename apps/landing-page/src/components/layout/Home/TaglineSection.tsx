import { PageSection } from "../../../pages/api/page-content";
import styles from "./TaglineSection.module.css";

export interface TaglineSectionProps {
  section: PageSection | null;
}

export const TaglineSection = ({ section }: TaglineSectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const subtitle =
    (section.content as any)?.text ??
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";

  return (
    <section className={styles.tagline} data-cy="tagline-section">
      <div className={styles.content}>
        {title && (
          <h2 className={styles.title} data-cy="tagline-title">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className={styles.subtitle} data-cy="tagline-subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
};

export default TaglineSection;
