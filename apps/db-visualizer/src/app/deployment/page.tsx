import {
  getDeploymentEnvReport,
  probeDatabaseReachability,
} from "@/lib/envDiagnostics";
import type { DeploymentEnvVarStatus } from "@/types/db-visualizer";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const statusLabel = (status: DeploymentEnvVarStatus): string => {
  switch (status) {
    case "ok":
      return "OK";
    case "missing":
      return "Missing";
    case "suspicious":
      return "Check";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

const statusBadgeClass = (status: DeploymentEnvVarStatus): string => {
  switch (status) {
    case "ok":
      return `${styles.badge} ${styles.badgeOk}`;
    case "missing":
      return `${styles.badge} ${styles.badgeMissing}`;
    case "suspicious":
      return `${styles.badge} ${styles.badgeSuspicious}`;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

export const DeploymentRoutePage = async () => {
  const report = getDeploymentEnvReport();
  const probe = await probeDatabaseReachability();

  return (
    <>
      {report.criticalIssues.length > 0 ? (
        <div className={styles.criticalBanner} role="alert">
          <strong>Configuration issues</strong>
          <ul>
            {report.criticalIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className={styles.section} aria-labelledby="runtime-heading">
        <h2 id="runtime-heading" className={styles.sectionTitle}>
          Runtime context
        </h2>
        <div className={styles.contextGrid}>
          <span className={styles.contextItem}>
            NODE_ENV={report.context.nodeEnv}
          </span>
          {report.context.vercelEnv ? (
            <span className={styles.contextItem}>
              VERCEL_ENV={report.context.vercelEnv}
            </span>
          ) : null}
          {report.context.vercelRegion ? (
            <span className={styles.contextItem}>
              VERCEL_REGION={report.context.vercelRegion}
            </span>
          ) : null}
          <span className={styles.contextItem}>
            commit={report.context.commitShort}
          </span>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="vars-heading">
        <h2 id="vars-heading" className={styles.sectionTitle}>
          Environment variables (this app)
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Variable</th>
                <th className={styles.th}>Importance</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {report.variables.map((row) => (
                <tr key={row.key}>
                  <td className={`${styles.td} ${styles.mono}`}>{row.key}</td>
                  <td className={styles.td}>{row.importance}</td>
                  <td className={styles.td}>
                    <span className={statusBadgeClass(row.status)}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {row.hint ? (
                      <p className={styles.hint}>{row.hint}</p>
                    ) : (
                      <span className={styles.hint}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="probe-heading">
        <h2 id="probe-heading" className={styles.sectionTitle}>
          Database connectivity
        </h2>
        <div
          className={`${styles.probeCard} ${probe.ok ? styles.probeOk : styles.probeFail}`}
        >
          <p className={styles.probeLabel}>
            {probe.ok ? "Probe succeeded" : "Probe failed"}
          </p>
          <p className={styles.probeMessage}>{probe.message}</p>
        </div>
      </section>
    </>
  );
};

export default DeploymentRoutePage;
