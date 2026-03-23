"use client";

import { formatRefetchIntervalLabel } from "@/lib/sync-constants";

import styles from "./SyncMetricsRail.module.css";

export type SyncMetricsRailProps = Readonly<{
  clientTtfbMs: number | null;
  serverQueryMs: number;
  isFetching: boolean;
  documentPollingPaused: boolean;
  isBackingOff: boolean;
  backoffRemainingMs: number;
  lastError: string | null;
  slowServerQuery: boolean;
  slowClientTtfb: boolean;
}>;

export const SyncMetricsRail = ({
  clientTtfbMs,
  serverQueryMs,
  isFetching,
  documentPollingPaused,
  isBackingOff,
  backoffRemainingMs,
  lastError,
  slowServerQuery,
  slowClientTtfb,
}: SyncMetricsRailProps) => {
  return (
    <aside className={styles.rail} aria-label="Sync performance metrics">
      <p className={styles.title}>Last poll</p>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt>Client TTFB</dt>
          <dd
            className={
              slowClientTtfb ? styles.valueWarn : clientTtfbMs !== null ? styles.valueOk : styles.valueMuted
            }
          >
            {clientTtfbMs !== null ? `${clientTtfbMs} ms` : "—"}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Server query</dt>
          <dd className={slowServerQuery ? styles.valueWarn : styles.valueOk}>{serverQueryMs} ms</dd>
        </div>
        <div className={styles.row}>
          <dt>Interval</dt>
          <dd className={styles.valueMuted}>{formatRefetchIntervalLabel()}</dd>
        </div>
        <div className={styles.row}>
          <dt>Status</dt>
          <dd className={styles.valueMuted}>
            {isFetching ? "Fetching…" : documentPollingPaused ? "Tab hidden" : "Polling"}
          </dd>
        </div>
        {isBackingOff ? (
          <div className={styles.row}>
            <dt>Backoff</dt>
            <dd className={styles.valueWarn}>{Math.ceil(backoffRemainingMs / 1000)}s</dd>
          </div>
        ) : null}
      </dl>
      {lastError ? (
        <p className={styles.error} role="status">
          {lastError}
        </p>
      ) : null}
    </aside>
  );
};
