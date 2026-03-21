import styles from "./SchemaHealthPanel.module.css";

import type { SchemaHealthData } from "@/types/db-visualizer";

type SchemaHealthPanelProps = {
  data: SchemaHealthData;
};

export const SchemaHealthPanel = ({ data }: SchemaHealthPanelProps) => {
  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h2>Schema Health</h2>
        <p>
          <span className={styles.okCount}>{data.summary.ok} ok</span>
          <span className={styles.errorCount}>{data.summary.error} errors</span>
        </p>
      </header>

      <ul className={styles.checkList}>
        {data.checks.map((check) => (
          <li key={check.id} className={styles.checkRow}>
            <span
              className={`${styles.statusBadge} ${
                check.status === "ok" ? styles.statusOk : styles.statusError
              }`}
            >
              {check.status}
            </span>
            <div className={styles.checkBody}>
              <span className={styles.target}>
                {check.schema}.{check.table}
              </span>
              <span className={styles.message}>{check.message}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
