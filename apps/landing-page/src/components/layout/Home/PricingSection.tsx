import { PageSection } from "../../../pages/api/page-content";
import styles from "./PricingSection.module.css";

export interface PricingTierLite {
  id: string;
  title?: string;
  description?: string;
  content: Record<string, any>;
}

export interface PricingSectionProps {
  pricingTiers: PricingTierLite[];
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

export const PricingSection = ({
  pricingTiers,
  section,
}: PricingSectionProps) => {
  if (!pricingTiers?.length) return null;

  const title =
    getSectionText(section, "title") ||
    getSectionText(section, "heading") ||
    "";
  const subtitle = getSectionText(section, "subtitle") || getSectionText(section);

  return (
    <section className={styles.pricing} data-cy="pricing-section">
      {title ? (
        <h2 className={styles.title} data-cy="pricing-title">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className={styles.subtitle} data-cy="pricing-subtitle">
          {subtitle}
        </p>
      ) : null}

      <div className={styles.pricingGrid} data-cy="pricing-grid">
        {pricingTiers.map((tier) => {
          const name = tier.title || (tier.content as any)?.name || "";
          const price = (tier.content as any)?.price || "";
          const period = (tier.content as any)?.period || "";
          const description =
            tier.description || (tier.content as any)?.description || "";
          const ctaLabel = (tier.content as any)?.cta_label || "";
          const ctaHref = (tier.content as any)?.cta_href || "";
          return (
            <div
              key={tier.id}
              className={styles.pricingCard}
              data-cy="pricing-card"
            >
              <h3 className={styles.tierName}>{name}</h3>
              <div className={styles.priceContainer}>
                <span className={styles.price}>{price}</span>
                {period && <span className={styles.period}>{period}</span>}
              </div>
              <p className={styles.description}>{description}</p>
              {ctaLabel && ctaHref ? (
                <a
                  href={ctaHref}
                  className={styles.getStarted}
                  data-cy="pricing-cta"
                >
                  {ctaLabel}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
