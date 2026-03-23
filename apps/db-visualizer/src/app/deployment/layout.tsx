import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./layout.module.css";

type DeploymentLayoutProps = {
  readonly children: ReactNode;
};

export const DeploymentLayout = ({ children }: DeploymentLayoutProps) => {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.title}>Deployment / environment</h1>
            <p className={styles.subtitle}>
              Presence and shape checks only — secret values are never shown or
              logged.
            </p>
          </div>
          <Link className={styles.backLink} href="/landing">
            Back to visualizer
          </Link>
        </div>
      </header>
      <div className={styles.main}>{children}</div>
    </div>
  );
};

export default DeploymentLayout;
