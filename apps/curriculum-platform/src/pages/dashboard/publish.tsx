import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import styles from "@/pages/dashboard/workspace.module.css";

type Program = {
  id: number;
  title: string;
  slug: string;
};

type Level = {
  id: number;
  title: string;
  slug: string;
  orderIndex: number;
  status: "draft" | "published" | "archived";
  _count?: { units: number };
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }
  return { props: {} };
};

export const PublishPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewBody, setPreviewBody] = useState<string | null>(null);

  const selectedLevel = useMemo(
    () => levels.find((level) => level.id === selectedLevelId) ?? null,
    [levels, selectedLevelId]
  );

  const activeUnitCount = selectedLevel?._count?.units ?? 0;
  const canPublish = Boolean(selectedLevelId) && activeUnitCount > 0;

  useEffect(() => {
    const load = async () => {
      setLoadingPrograms(true);
      const response = await fetch("/api/programs");
      const data = (await response.json()) as { programs?: Program[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Failed to load programs");
        setLoadingPrograms(false);
        return;
      }
      const nextPrograms = data.programs ?? [];
      setPrograms(nextPrograms);
      if (nextPrograms.length > 0) {
        const firstProgram = nextPrograms[0];
        if (firstProgram) {
          setSelectedProgramId(firstProgram.id);
        }
      }
      setLoadingPrograms(false);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedProgramId) {
      return;
    }
    const load = async () => {
      setLoadingLevels(true);
      const response = await fetch(`/api/levels?programId=${selectedProgramId}`);
      const data = (await response.json()) as { levels?: Level[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Failed to load levels");
        setLoadingLevels(false);
        return;
      }
      const nextLevels = data.levels ?? [];
      setLevels(nextLevels);
      setSelectedLevelId(nextLevels[0]?.id ?? null);
      setLoadingLevels(false);
    };
    void load();
  }, [selectedProgramId]);

  useEffect(() => {
    setPreviewBody(null);
    setPreviewError(null);
  }, [selectedLevelId]);

  const publishLevel = async () => {
    if (!selectedLevelId || !canPublish) {
      return;
    }
    setError(null);
    setPublishing(true);
    setStatus(null);

    const response = await fetch(`/api/publish/levels/${selectedLevelId}`, {
      method: "POST",
    });
    const data = (await response.json()) as {
      error?: string;
      snapshot?: { version: number };
    };
    if (!response.ok) {
      setError(data.error ?? "Failed to publish level");
      setPublishing(false);
      return;
    }

    setStatus(`Published snapshot v${data.snapshot?.version ?? "?"}`);
    setPublishing(false);
  };

  const loadAssignmentPreview = async () => {
    if (!selectedLevelId) {
      return;
    }
    setPreviewError(null);
    setPreviewBody(null);
    setPreviewLoading(true);

    const response = await fetch(`/api/hooks/assignments/preview/${selectedLevelId}`);
    const data = (await response.json()) as {
      error?: string;
      invalidUnits?: unknown;
      payload?: unknown;
      currentSnapshotVersion?: number | null;
      previewSnapshotVersion?: number;
    };

    if (!response.ok) {
      const message =
        typeof data.error === "string"
          ? data.error
          : "Failed to load assignment hooks preview";
      setPreviewError(message);
      setPreviewLoading(false);
      return;
    }

    setPreviewBody(JSON.stringify(data, null, 2));
    setPreviewLoading(false);
  };

  return (
    <DashboardShell
      pageTitle="Publish"
      pageSubtitle="Validate readiness, preview assignment hooks, then publish a level snapshot."
    >
      <div className={styles.workspaceRoot}>
        <section className={styles.card}>
          <h2>Select level to publish</h2>
          <label className={styles.field}>
            Program
            <select
              className={styles.select}
              value={selectedProgramId ?? ""}
              onChange={(event) => setSelectedProgramId(Number(event.target.value))}
              disabled={loadingPrograms || programs.length === 0}
            >
              <option value="" disabled>
                Select a program
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
            {loadingPrograms ? (
              <p className={styles.meta}>Loading programs...</p>
            ) : null}
            {!loadingPrograms && programs.length === 0 ? (
              <p className={styles.empty}>
                No programs available yet. Create one in Programs Workspace first.
              </p>
            ) : null}
          </label>

          <label className={styles.field}>
            Level
            <select
              className={styles.select}
              value={selectedLevelId ?? ""}
              onChange={(event) => setSelectedLevelId(Number(event.target.value))}
              disabled={!selectedProgramId || loadingLevels || levels.length === 0}
            >
              <option value="" disabled>
                Select a level
              </option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.title}
                </option>
              ))}
            </select>
            {loadingLevels ? <p className={styles.meta}>Loading levels...</p> : null}
            {!loadingLevels && selectedProgramId && levels.length === 0 ? (
              <p className={styles.empty}>No levels to publish for this program yet.</p>
            ) : null}
          </label>
        </section>

        <section className={styles.card}>
          <h2>Readiness</h2>
          {!selectedLevel ? (
            <p className={styles.empty}>Select a level to see readiness checks.</p>
          ) : (
            <>
              <ul className={styles.readinessList}>
                <li>
                  <span className={styles.readinessOk}>Level status:</span>{" "}
                  {selectedLevel.status}
                </li>
                <li>
                  {activeUnitCount === 0 ? (
                    <span className={styles.readinessWarn}>
                      No active (non-archived) units — cannot publish or preview hooks.
                    </span>
                  ) : (
                    <span className={styles.readinessOk}>
                      {activeUnitCount} active unit(s) in this level.
                    </span>
                  )}
                </li>
              </ul>
              <p className={styles.meta}>
                Publish requires at least one unit and valid assignmentConfig on every
                unit (same rules as the server).
              </p>
            </>
          )}
        </section>

        <section className={styles.card}>
          <h2>Assignment hooks preview</h2>
          <p className={styles.meta}>
            Fetches the normalized payload that the next publish would embed (no snapshot
            written).
          </p>
          <div className={styles.actions}>
            <button
              className={styles.button}
              type="button"
              disabled={!selectedLevelId || activeUnitCount === 0 || previewLoading}
              onClick={() => void loadAssignmentPreview()}
            >
              {previewLoading ? "Loading preview…" : "Preview assignment hooks"}
            </button>
          </div>
          {previewError ? (
            <p className={styles.error} role="alert">
              {previewError}
            </p>
          ) : null}
          {previewBody ? (
            <pre className={styles.preJson} tabIndex={0}>
              {previewBody}
            </pre>
          ) : null}
        </section>

        <section className={styles.card}>
          <h2>Publish snapshot</h2>
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              type="button"
              onClick={() => void publishLevel()}
              disabled={!canPublish || publishing}
            >
              {publishing ? "Publishing..." : "Publish current level"}
            </button>
          </div>

          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          {status ? <p className={styles.success}>{status}</p> : null}
        </section>
      </div>
    </DashboardShell>
  );
};

export default PublishPage;
