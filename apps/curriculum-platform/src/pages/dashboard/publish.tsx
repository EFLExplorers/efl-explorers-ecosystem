import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

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

  const publishLevel = async () => {
    if (!selectedLevelId) {
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

  return (
    <DashboardShell
      pageTitle="Publish"
      pageSubtitle="[wireframe] Level snapshots → teacher/student"
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

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="button"
            onClick={() => void publishLevel()}
            disabled={!selectedLevelId || publishing}
          >
            {publishing ? "Publishing..." : "Publish current level"}
          </button>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}
        {status ? <p className={styles.success}>{status}</p> : null}
      </section>
      </div>
    </DashboardShell>
  );
};

export default PublishPage;
