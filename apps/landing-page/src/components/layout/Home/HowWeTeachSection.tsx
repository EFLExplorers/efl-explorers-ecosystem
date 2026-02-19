import { PageSection } from "../../../pages/api/page-content";
import styles from "./HowWeTeachSection.module.css";

export interface HowWeTeachSectionProps {
  section: PageSection | null;
}

interface HowWeTeachCard {
  title: string;
  content?: string;
  description?: string;
  icon?: string;
}

export const HowWeTeachSection = ({ section }: HowWeTeachSectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const description =
    (section.content as any)?.description ??
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";
  const cards =
    ((section.content as any)?.tabs as HowWeTeachCard[] | undefined) ?? [];
  if (!cards.length) return null;

  return (
    <section className={styles.teaching}>
      <div className={styles.content}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {description && <p className={styles.subtitle}>{description}</p>}

        <div className={styles.methodsGrid}>
          {cards.map((card, index) => (
            <div key={`${card.title}-${index}`} className={styles.methodCard}>
              <div className={styles.methodIcon}>{card.icon || ""}</div>
              <h3 className={styles.methodTitle}>{card.title}</h3>
              <p className={styles.methodDescription}>
                {card.content || card.description || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeTeachSection;
