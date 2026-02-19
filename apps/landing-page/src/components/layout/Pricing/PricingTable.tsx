import Link from "next/link";
import styles from "./PricingTable.module.css";
import type { PageSection } from "../../../pages/api/page-content";

export interface PricingPlan {
  slug: string;
  title: string;
  badge?: string | null;
  description?: string | null;
  content: Record<string, any>;
}

export interface PricingTableProps {
  headerSection: PageSection | null;
  footerSection: PageSection | null;
  plans: PricingPlan[];
}

export const PricingTable = ({
  headerSection,
  footerSection,
  plans,
}: PricingTableProps) => {
  if (!headerSection) return null;
  if (!plans?.length) return null;

  const headerBadge = (headerSection.content as any)?.badge ?? "";
  const headerTitle = (headerSection.content as any)?.title ?? "";
  const headerSubtitle = (headerSection.content as any)?.subtitle ?? "";

  const footerNote = (footerSection?.content as any)?.note ?? "";
  const footerHelpText = (footerSection?.content as any)?.help_text ?? "";
  const footerHelpHref = (footerSection?.content as any)?.help_href ?? "";
  const footerHelpLabel = (footerSection?.content as any)?.help_label ?? "";

  return (
    <section className={styles.pricing} data-cy="pricing-page">
      <div className={styles.header}>
        <div className={styles.badge} data-cy="pricing-badge">
          {headerBadge}
        </div>
        <h1 data-cy="pricing-title">{headerTitle}</h1>
        <p data-cy="pricing-subtitle">{headerSubtitle}</p>
      </div>

      <div className={styles.plans} data-cy="pricing-plans">
        {plans.map((plan) => {
          const variant = (plan.content as any)?.variant as
            | "basic"
            | "premium"
            | "enterprise"
            | undefined;
          const featured = Boolean((plan.content as any)?.featured);

          const price = (plan.content as any)?.price ?? "";
          const currency = (plan.content as any)?.currency ?? "";
          const period = (plan.content as any)?.period ?? "";

          const buttonLabel = (plan.content as any)?.button?.label ?? "";
          const buttonHref = (plan.content as any)?.button?.href ?? "";
          const buttonStyle = (plan.content as any)?.button?.style as
            | "default"
            | "primary"
            | "enterprise"
            | undefined;

          const features = ((plan.content as any)?.features as string[]) || [];

          const planClassName = [
            styles.plan,
            variant === "basic"
              ? styles.basic
              : variant === "premium"
              ? styles.premium
              : variant === "enterprise"
              ? styles.enterprise
              : "",
            featured ? styles.featured : "",
          ]
            .filter(Boolean)
            .join(" ");

          const buttonClassName = [
            styles.button,
            buttonStyle === "primary" ? styles.buttonPrimary : "",
            buttonStyle === "enterprise" ? styles.buttonEnterprise : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={plan.slug}
              className={planClassName}
              data-cy={`pricing-plan-${plan.slug}`}
            >
              {plan.badge ? (
                <div
                  className={styles.planBadge}
                  data-cy={`pricing-plan-badge-${plan.slug}`}
                >
                  {plan.badge}
                </div>
              ) : null}

              <div className={styles.planHeader}>
                <h3>{plan.title}</h3>
                {plan.description ? (
                  <p className={styles.description}>{plan.description}</p>
                ) : null}

                <div className={styles.price}>
                  {currency ? (
                    <span className={styles.currency}>{currency}</span>
                  ) : null}
                  <span className={styles.amount}>{price}</span>
                  {period ? (
                    <span className={styles.period}>{period}</span>
                  ) : null}
                </div>

                {buttonLabel && buttonHref ? (
                  <Link
                    href={buttonHref}
                    className={buttonClassName}
                    data-cy={`pricing-button-${plan.slug}`}
                  >
                    {buttonLabel}
                  </Link>
                ) : null}
              </div>

              <div className={styles.divider}></div>

              {features.length ? (
                <ul
                  className={styles.features}
                  data-cy={`pricing-features-${plan.slug}`}
                >
                  {features.map((feature) => (
                    <li key={feature}>
                      <span className={styles.checkmark}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={styles.footer} data-cy="pricing-footer">
        {footerNote ? <p>{footerNote}</p> : null}
        {footerHelpText && footerHelpHref && footerHelpLabel ? (
          <p>
            {footerHelpText}{" "}
            <Link href={footerHelpHref} data-cy="pricing-contact-link">
              {footerHelpLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
};
