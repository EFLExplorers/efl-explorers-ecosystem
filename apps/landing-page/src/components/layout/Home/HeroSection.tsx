import Link from "next/link";
import { PageSection } from "../../../pages/api/page-content";
import styles from "./HeroSection.module.css";

export interface HeroSectionProps {
  section: PageSection | null;
}

export const HeroSection = ({ section }: HeroSectionProps) => {
  if (!section) return null;

  const title =
    (section.content as any)?.title ?? section.heading ?? section.title ?? "";
  const subtitle =
    (section.content as any)?.subtitle ??
    section.subheading ??
    section.subtitle ??
    "";
  const buttons = ((section.content as any)?.buttons ??
    (section.data as any)?.buttons ??
    []) as Array<{
    label?: string;
    href?: string;
    text?: string;
    url?: string;
  }>;

  const normalizedButtons = (buttons || [])
    .map((button) => ({
      label: button.label ?? button.text ?? "",
      href: button.href ?? button.url ?? "",
    }))
    .filter((button) => button.label && button.href);

  return (
    <section className={styles.hero} data-cy="hero-section">
      <div className={styles.content}>
        <h1 className={styles.title} data-cy="hero-title">
          {title}
        </h1>
        <p className={styles.subtitle} data-cy="hero-subtitle">
          {subtitle}
        </p>
        {normalizedButtons.length ? (
          <div className={styles.buttonGroup}>
            {normalizedButtons.map((button) => (
              <Link
                key={button.href}
                href={button.href}
                className={styles.button}
                data-cy={
                  button.href.includes("/student")
                    ? "hero-register-student"
                    : "hero-register-teacher"
                }
              >
                {button.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HeroSection;
