import styles from "./ContactHeroSection.module.css";
import type { PageSection } from "../../../pages/api/page-content";

export interface ContactHeroSectionProps {
  section: PageSection | null;
}

export const ContactHeroSection = ({ section }: ContactHeroSectionProps) => {
  if (!section) return null;

  const title = (section.content as any)?.title ?? "";
  const subtitle = (section.content as any)?.subtitle ?? "";
  const contactMethods =
    ((section.content as any)?.contact_methods as Array<{
      icon?: string;
      href?: string;
      text?: string;
    }>) || [];

  return (
    <section className={styles.hero} data-cy="contact-hero">
      <div className={styles.content}>
        <h1 className={styles.title} data-cy="contact-title">
          {title}
        </h1>
        <p className={styles.subtitle} data-cy="contact-subtitle">
          {subtitle}
        </p>
        <div className={styles.contactInfo}>
          {contactMethods.map((method) => (
            <div className={styles.infoItem} key={method.href || method.text}>
              <span className={styles.icon}>{method.icon || ""}</span>
              <div className={styles.infoText}>
                <a
                  href={method.href || "#"}
                  data-cy={
                    (method.href || "").startsWith("mailto:")
                      ? "contact-email"
                      : (method.href || "").startsWith("tel:")
                        ? "contact-phone"
                        : "contact-link"
                  }
                >
                  {method.text || ""}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
