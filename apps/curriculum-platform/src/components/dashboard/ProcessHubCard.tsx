import Link from "next/link";
import type { ReactNode } from "react";

import styles from "@/components/dashboard/ProcessHubCard.module.css";

export type ProcessHubCardProps = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly actionLabel: string;
  readonly meta?: string | null;
  readonly secondaryHref?: string;
  readonly secondaryLabel?: string;
  readonly footer?: ReactNode;
};

export const ProcessHubCard = ({
  title,
  description,
  href,
  actionLabel,
  meta,
  secondaryHref,
  secondaryLabel,
  footer,
}: ProcessHubCardProps) => {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      <div className={styles.actions}>
        <Link className={styles.primaryLink} href={href}>
          {actionLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link className={styles.secondaryLink} href={secondaryHref}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
      {footer}
    </article>
  );
};
