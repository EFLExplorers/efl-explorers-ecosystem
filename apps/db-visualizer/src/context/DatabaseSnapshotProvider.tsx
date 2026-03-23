"use client";

import type { ReactNode } from "react";
import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  BASE_BACKOFF_MS,
  MAX_BACKOFF_MS,
  REFETCH_INTERVAL_MS,
  SERVER_FAILURE_THRESHOLD,
  SLOW_CLIENT_TTFB_MS,
  SLOW_SERVER_QUERY_MS,
  SYNC_ALL_PATH,
  SYNC_HEADER,
} from "@/lib/sync-constants";
import { parseSyncSnapshotPayload } from "@/lib/parse-sync-snapshot";
import { VIRTUAL_HEALTH_TABLE_ID } from "@/lib/sync-grid-data";
import type { NormalizedDatabaseSyncSnapshot, SchemaDriftReport } from "@/types/sync-snapshot";

const pickDefaultTableId = (snapshot: NormalizedDatabaseSyncSnapshot): string => {
  const ids = new Set(snapshot.schemaGraph.tables.map((t) => t.id));
  if (ids.has("auth.users")) {
    return "auth.users";
  }
  return snapshot.schemaGraph.tables[0]?.id ?? VIRTUAL_HEALTH_TABLE_ID;
};

export type DatabaseSnapshotContextValue = {
  snapshot: NormalizedDatabaseSyncSnapshot;
  drift: SchemaDriftReport;
  schemaOutOfSync: boolean;
  lastError: string | null;
  clientTtfbMs: number | null;
  isFetching: boolean;
  isBackingOff: boolean;
  backoffRemainingMs: number;
  documentPollingPaused: boolean;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  refresh: () => void;
  slowServerQuery: boolean;
  slowClientTtfb: boolean;
};

const DatabaseSnapshotContext = createContext<DatabaseSnapshotContextValue | null>(null);

const getClientSyncSecret = () =>
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_EFL_INTERNAL_SYNC_SECRET?.trim() ?? "" : "";

export type DatabaseSnapshotProviderProps = Readonly<{
  children: ReactNode;
  initialPayload: unknown;
  initialLoadError?: string;
}>;

type DatabaseSnapshotProviderInnerProps = DatabaseSnapshotProviderProps & {
  authUserId?: string;
};

const DatabaseSnapshotProviderInner = ({
  children,
  initialPayload,
  initialLoadError = "",
  authUserId,
}: DatabaseSnapshotProviderInnerProps) => {
  const initialParse = useMemo(() => parseSyncSnapshotPayload(initialPayload), [initialPayload]);

  const [snapshot, setSnapshot] = useState<NormalizedDatabaseSyncSnapshot>(initialParse.snapshot);
  const [drift, setDrift] = useState<SchemaDriftReport>(initialParse.drift);
  const [lastError, setLastError] = useState<string | null>(
    initialLoadError ? initialLoadError : null,
  );
  const [clientTtfbMs, setClientTtfbMs] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [documentPollingPaused, setDocumentPollingPaused] = useState(
    typeof document !== "undefined" ? document.visibilityState === "hidden" : false,
  );
  const [backoffRemainingMs, setBackoffRemainingMs] = useState(0);
  const [selectedTableId, setSelectedTableIdState] = useState<string | null>(() =>
    pickDefaultTableId(initialParse.snapshot),
  );

  const consecutiveFailuresRef = useRef(0);
  const backoffExponentRef = useRef(0);
  const nextAllowedFetchAtRef = useRef(0);
  const lastSuccessAtRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevAuthUserIdRef = useRef<string | undefined>(undefined);

  const schemaOutOfSync =
    drift.topLevelUnknownKeys.length > 0 || drift.metaZodFailed;

  const slowServerQuery = snapshot.meta.serverQueryMs >= SLOW_SERVER_QUERY_MS;
  const slowClientTtfb =
    clientTtfbMs !== null && clientTtfbMs >= SLOW_CLIENT_TTFB_MS;

  const isBackingOff = backoffRemainingMs > 0;

  const runFetch = useCallback(async () => {
    const now = Date.now();
    if (now < nextAllowedFetchAtRef.current) {
      return;
    }

    const secret = getClientSyncSecret();
    const headers = new Headers();
    if (secret) {
      headers.set(SYNC_HEADER, secret);
    }

    const url = new URL(SYNC_ALL_PATH, window.location.origin);
    if (authUserId) {
      url.searchParams.set("userId", authUserId);
    }

    setIsFetching(true);
    const t0 = performance.now();
    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers,
        cache: "no-store",
      });
      const ttfb = Math.round(performance.now() - t0);
      setClientTtfbMs(ttfb);

      if (!res.ok) {
        const body = await res.text();
        let message = `HTTP ${res.status}`;
        if (res.status === 401) {
          message =
            "Sync unauthorized: set NEXT_PUBLIC_EFL_INTERNAL_SYNC_SECRET to match EFL_INTERNAL_SYNC_SECRET for browser polling.";
        }
        try {
          const j = JSON.parse(body) as { error?: string };
          if (j.error) {
            message = j.error;
          }
        } catch {
          if (body) {
            message = body.slice(0, 200);
          }
        }
        setLastError(message);
        if (res.status >= 500) {
          consecutiveFailuresRef.current += 1;
          if (consecutiveFailuresRef.current >= SERVER_FAILURE_THRESHOLD) {
            backoffExponentRef.current = Math.min(backoffExponentRef.current + 1, 8);
            const delay = Math.min(
              BASE_BACKOFF_MS * 2 ** backoffExponentRef.current,
              MAX_BACKOFF_MS,
            );
            nextAllowedFetchAtRef.current = Date.now() + delay;
          }
        } else {
          consecutiveFailuresRef.current = 0;
          backoffExponentRef.current = 0;
          nextAllowedFetchAtRef.current = 0;
        }
        return;
      }

      consecutiveFailuresRef.current = 0;
      backoffExponentRef.current = 0;
      nextAllowedFetchAtRef.current = 0;
      setLastError(null);
      lastSuccessAtRef.current = Date.now();

      const raw = (await res.json()) as unknown;
      const parsed = parseSyncSnapshotPayload(raw);
      setSnapshot(parsed.snapshot);
      setDrift(parsed.drift);
      setSelectedTableIdState((prev) => {
        if (prev === VIRTUAL_HEALTH_TABLE_ID) {
          return VIRTUAL_HEALTH_TABLE_ID;
        }
        if (prev && parsed.snapshot.schemaGraph.tables.some((t) => t.id === prev)) {
          return prev;
        }
        return pickDefaultTableId(parsed.snapshot);
      });
    } catch (e) {
      setClientTtfbMs(Math.round(performance.now() - t0));
      const message = e instanceof Error ? e.message : "Network error";
      setLastError(message);
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= SERVER_FAILURE_THRESHOLD) {
        backoffExponentRef.current = Math.min(backoffExponentRef.current + 1, 8);
        const delay = Math.min(
          BASE_BACKOFF_MS * 2 ** backoffExponentRef.current,
          MAX_BACKOFF_MS,
        );
        nextAllowedFetchAtRef.current = Date.now() + delay;
      }
    } finally {
      setIsFetching(false);
    }
  }, [authUserId]);

  const refresh = useCallback(() => {
    nextAllowedFetchAtRef.current = 0;
    void runFetch();
  }, [runFetch]);

  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      setDocumentPollingPaused(hidden);
      if (!hidden) {
        const stale = Date.now() - lastSuccessAtRef.current > REFETCH_INTERVAL_MS;
        if (stale) {
          void runFetch();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [runFetch]);

  useEffect(() => {
    if (backoffTickRef.current) {
      clearInterval(backoffTickRef.current);
      backoffTickRef.current = null;
    }
    const tick = () => {
      const left = Math.max(0, nextAllowedFetchAtRef.current - Date.now());
      setBackoffRemainingMs(left);
    };
    tick();
    backoffTickRef.current = setInterval(tick, 500);
    return () => {
      if (backoffTickRef.current) {
        clearInterval(backoffTickRef.current);
      }
    };
  }, [isFetching, lastError, snapshot.meta.generatedAt]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (documentPollingPaused) {
      return;
    }
    intervalRef.current = setInterval(() => {
      void runFetch();
    }, REFETCH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [documentPollingPaused, runFetch]);

  useEffect(() => {
    if (prevAuthUserIdRef.current === authUserId) {
      return;
    }
    prevAuthUserIdRef.current = authUserId;
    void runFetch();
  }, [authUserId, runFetch]);

  const setSelectedTableId = useCallback((id: string | null) => {
    setSelectedTableIdState(id);
  }, []);

  const value = useMemo<DatabaseSnapshotContextValue>(
    () => ({
      snapshot,
      drift,
      schemaOutOfSync,
      lastError,
      clientTtfbMs,
      isFetching,
      isBackingOff,
      backoffRemainingMs,
      documentPollingPaused,
      selectedTableId,
      setSelectedTableId,
      refresh,
      slowServerQuery,
      slowClientTtfb,
    }),
    [
      snapshot,
      drift,
      schemaOutOfSync,
      lastError,
      clientTtfbMs,
      isFetching,
      isBackingOff,
      backoffRemainingMs,
      documentPollingPaused,
      selectedTableId,
      setSelectedTableId,
      refresh,
      slowServerQuery,
      slowClientTtfb,
    ],
  );

  return (
    <DatabaseSnapshotContext.Provider value={value}>{children}</DatabaseSnapshotContext.Provider>
  );
};

const DatabaseSnapshotProviderQueryParams = (props: DatabaseSnapshotProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authUserId =
    pathname.startsWith("/auth") ? (searchParams.get("userId") ?? undefined) : undefined;
  return <DatabaseSnapshotProviderInner {...props} authUserId={authUserId} />;
};

export const DatabaseSnapshotProvider = (props: DatabaseSnapshotProviderProps) => (
  <Suspense
    fallback={
      <div style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
        Loading database sync…
      </div>
    }
  >
    <DatabaseSnapshotProviderQueryParams {...props} />
  </Suspense>
);

export const useDatabaseSnapshot = (): DatabaseSnapshotContextValue => {
  const ctx = useContext(DatabaseSnapshotContext);
  if (!ctx) {
    throw new Error("useDatabaseSnapshot must be used within DatabaseSnapshotProvider");
  }
  return ctx;
};

export const useDatabaseSync = useDatabaseSnapshot;
