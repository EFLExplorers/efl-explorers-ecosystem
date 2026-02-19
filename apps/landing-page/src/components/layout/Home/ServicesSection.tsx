import { PageSection } from "../../../pages/api/page-content";
import styles from "./ServicesSection.module.css";

export interface ServiceLite {
  id: string;
  title?: string;
  description?: string;
  content: Record<string, any>;
}

export interface ServicesSectionProps {
  services: ServiceLite[];
  section?: PageSection | null;
}

const getSectionText = (
  section?: PageSection | null,
  key?: string
): string => {
  if (!section) return "";
  const contentText = (section.content as Record<string, any> | undefined)?.[
    key || "text"
  ];
  return (
    contentText ??
    section.body ??
    section.subtitle ??
    section.title ??
    section.heading ??
    ""
  );
};

export const ServicesSection = ({ services, section }: ServicesSectionProps) => {
  if (!services?.length) return null;

  const title =
    getSectionText(section, "title") ||
    getSectionText(section, "heading") ||
    "";
  const subtitle = getSectionText(section, "subtitle") || getSectionText(section);

  return (
    <section className={styles.services} data-cy="services-section">
      <div className={styles.content}>
        {title ? (
          <h2 className={styles.title} data-cy="services-title">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className={styles.subtitle} data-cy="services-subtitle">
            {subtitle}
          </p>
        ) : null}

        <div className={styles.servicesGrid} data-cy="services-grid">
          {services.map((service) => {
            const title = service.title || "";
            const description =
              service.description || (service.content as any)?.description || "";
            const icon = (service.content as any)?.icon || "";
            const backgroundIcons =
              (service.content as any)?.background_icons || [];
            const ctaLabel = (service.content as any)?.cta_label || "";
            const ctaHref = (service.content as any)?.cta_href || "";

            return (
              <div
                key={service.id}
                className={styles.serviceCard}
                data-cy="service-card"
              >
                {backgroundIcons.map((bgIcon: string, bgIndex: number) => (
                  <div
                    key={`${service.id}-${bgIndex}`}
                    className={`${styles.backgroundIcon} ${styles[`backgroundIcon${bgIndex + 1}`]}`}
                  >
                    {bgIcon}
                  </div>
                ))}
                <div className={styles.serviceIcon}>{icon}</div>
                <h3 className={styles.serviceTitle}>{title}</h3>
                <p className={styles.serviceDescription}>{description}</p>
                {ctaLabel && ctaHref ? (
                  <a
                    href={ctaHref}
                    className={styles.learnMore}
                    data-cy="service-learn-more"
                  >
                    {ctaLabel}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
