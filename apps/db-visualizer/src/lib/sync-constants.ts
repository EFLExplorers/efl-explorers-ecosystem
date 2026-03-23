export const SYNC_ALL_PATH = "/api/efl/internal/sync-all";
/** Browser polling interval for `/api/efl/internal/sync-all` (reduces load vs frequent polls). */
export const REFETCH_INTERVAL_MS = 60 * 60 * 1000;
export const SYNC_HEADER = "x-efl-internal-sync";
export const SLOW_SERVER_QUERY_MS = 8000;
export const SLOW_CLIENT_TTFB_MS = 2500;
export const BASE_BACKOFF_MS = 15_000;
export const MAX_BACKOFF_MS = 120_000;
export const SERVER_FAILURE_THRESHOLD = 3;

/** Label shown in the sync rail; stays aligned with {@link REFETCH_INTERVAL_MS}. */
export const formatRefetchIntervalLabel = (): string => {
  const ms = REFETCH_INTERVAL_MS;
  const wholeHours = ms / 3_600_000;
  if (Number.isInteger(wholeHours) && wholeHours >= 1) {
    return wholeHours === 1 ? "1 h" : `${wholeHours} h`;
  }
  const wholeMinutes = ms / 60_000;
  if (Number.isInteger(wholeMinutes) && wholeMinutes >= 1) {
    return `${wholeMinutes} min`;
  }
  return `${Math.round(ms / 1000)} s`;
};
