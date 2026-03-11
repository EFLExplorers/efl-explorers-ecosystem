import styles from "./state-view.module.css";

type Metric = {
  readonly label: string;
  readonly value: string;
};

type StudentStateViewProps = {
  readonly blockTitle: string;
  readonly blockText: string;
  readonly metrics: readonly Metric[];
};

export const StudentStateView = ({
  blockTitle,
  blockText,
  metrics,
}: StudentStateViewProps) => {
  return (
    <>
      <div className={styles.grid}>
        {metrics.map((metric) => (
          <article key={metric.label} className={styles.card}>
            <p className={styles.label}>{metric.label}</p>
            <p className={styles.value}>{metric.value}</p>
          </article>
        ))}
      </div>

      <article className={styles.panel}>
        <h2 className={styles.panelTitle}>{blockTitle}</h2>
        <p className={styles.panelText}>{blockText}</p>
        <div className={styles.statusRow}>
          <span className={styles.badge}>Loading state ready</span>
          <span className={styles.badge}>Empty state ready</span>
          <span className={styles.badge}>Error retry ready</span>
        </div>
      </article>
    </>
  );
};
