import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { authOptions } from "@/lib/authOptions";
import styles from "@/pages/dashboard/workspace.module.css";

type Program = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  _count?: { levels: number };
};

type Level = {
  id: number;
  title: string;
  slug: string;
  orderIndex: number;
  programId: number;
};

type Unit = {
  id: number;
  title: string;
  slug: string;
  orderIndex: number;
  levelId: number;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [programTitle, setProgramTitle] = useState("");
  const [levelTitle, setLevelTitle] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [creatingProgram, setCreatingProgram] = useState(false);
  const [creatingLevel, setCreatingLevel] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);

  const currentProgram = useMemo(
    () => programs.find((item) => item.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  );

  const loadPrograms = useCallback(async () => {
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
    if (!selectedProgramId && nextPrograms.length > 0) {
      const firstProgram = nextPrograms[0];
      if (firstProgram) {
        setSelectedProgramId(firstProgram.id);
      }
    }
    setLoadingPrograms(false);
  }, [selectedProgramId]);

  const loadLevels = useCallback(async (programId: number) => {
    setLoadingLevels(true);
    const response = await fetch(`/api/levels?programId=${programId}`);
    const data = (await response.json()) as { levels?: Level[]; error?: string };
    if (!response.ok) {
      setError(data.error ?? "Failed to load levels");
      setLoadingLevels(false);
      return;
    }
    const nextLevels = data.levels ?? [];
    setLevels(nextLevels);
    if (!selectedLevelId && nextLevels.length > 0) {
      const firstLevel = nextLevels[0];
      if (firstLevel) {
        setSelectedLevelId(firstLevel.id);
      }
    }
    setLoadingLevels(false);
  }, [selectedLevelId]);

  const loadUnits = useCallback(async (levelId: number) => {
    setLoadingUnits(true);
    const response = await fetch(`/api/units?levelId=${levelId}`);
    const data = (await response.json()) as { units?: Unit[]; error?: string };
    if (!response.ok) {
      setError(data.error ?? "Failed to load units");
      setLoadingUnits(false);
      return;
    }
    setUnits(data.units ?? []);
    setLoadingUnits(false);
  }, []);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (selectedProgramId) {
      void loadLevels(selectedProgramId);
    }
  }, [loadLevels, selectedProgramId]);

  useEffect(() => {
    if (selectedLevelId) {
      void loadUnits(selectedLevelId);
    }
  }, [loadUnits, selectedLevelId]);

  const createProgram = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatingProgram(true);
    const response = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: programTitle }),
    });
    const data = (await response.json()) as { program?: Program; error?: string };
    if (!response.ok || !data.program) {
      setError(data.error ?? "Failed to create program");
      setCreatingProgram(false);
      return;
    }
    setProgramTitle("");
    await loadPrograms();
    setSelectedProgramId(data.program.id);
    setSuccess(`Program "${data.program.title}" created.`);
    setCreatingProgram(false);
  };

  const createLevel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProgramId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setCreatingLevel(true);
    const response = await fetch("/api/levels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId: selectedProgramId, title: levelTitle }),
    });
    const data = (await response.json()) as { level?: Level; error?: string };
    if (!response.ok || !data.level) {
      setError(data.error ?? "Failed to create level");
      setCreatingLevel(false);
      return;
    }
    setLevelTitle("");
    await loadLevels(selectedProgramId);
    setSelectedLevelId(data.level.id);
    setSuccess(`Level "${data.level.title}" created.`);
    setCreatingLevel(false);
  };

  const createUnit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLevelId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setCreatingUnit(true);
    const response = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelId: selectedLevelId, title: unitTitle }),
    });
    const data = (await response.json()) as { unit?: Unit; error?: string };
    if (!response.ok || !data.unit) {
      setError(data.error ?? "Failed to create unit");
      setCreatingUnit(false);
      return;
    }
    setUnitTitle("");
    await loadUnits(selectedLevelId);
    setSuccess(`Unit "${data.unit.title}" created.`);
    setCreatingUnit(false);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Programs Workspace</h1>
        <Link href="/dashboard">Back to dashboard</Link>
      </header>

      <section className={styles.card}>
        <h2>Create program</h2>
        <form onSubmit={createProgram}>
          <label className={styles.field}>
            Program title
            <input
              className={styles.input}
              value={programTitle}
              onChange={(event) => setProgramTitle(event.target.value)}
              required
            />
          </label>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="submit"
            disabled={creatingProgram}
          >
            {creatingProgram ? "Creating..." : "Create program"}
          </button>
        </form>
        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Programs</h2>
          <select
            className={styles.select}
            value={selectedProgramId ?? ""}
            onChange={(event) => setSelectedProgramId(Number(event.target.value))}
            disabled={loadingPrograms || programs.length === 0}
            aria-label="Select program"
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
            <p className={styles.empty}>No programs yet. Create your first one above.</p>
          ) : null}
          <p className={styles.meta}>
            {currentProgram
              ? `${currentProgram.slug} (${currentProgram._count?.levels ?? 0} levels)`
              : "No program selected"}
          </p>
        </article>

        <article className={styles.card}>
          <h2>Create level</h2>
          <form onSubmit={createLevel}>
            <label className={styles.field}>
              Level title
              <input
                className={styles.input}
                value={levelTitle}
                onChange={(event) => setLevelTitle(event.target.value)}
                required
              />
            </label>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              type="submit"
              disabled={!selectedProgramId || creatingLevel}
            >
              {creatingLevel ? "Adding..." : "Add level"}
            </button>
          </form>
          {!selectedProgramId ? (
            <p className={styles.empty}>Select a program before creating levels.</p>
          ) : null}
        </article>

        <article className={styles.card}>
          <h2>Levels</h2>
          <select
            className={styles.select}
            value={selectedLevelId ?? ""}
            onChange={(event) => setSelectedLevelId(Number(event.target.value))}
            disabled={!selectedProgramId || loadingLevels || levels.length === 0}
            aria-label="Select level"
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
            <p className={styles.empty}>No levels yet for this program.</p>
          ) : null}
        </article>
      </section>

      <section className={styles.card}>
        <h2>Create unit</h2>
        <form onSubmit={createUnit}>
          <label className={styles.field}>
            Unit title
            <input
              className={styles.input}
              value={unitTitle}
              onChange={(event) => setUnitTitle(event.target.value)}
              required
            />
          </label>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            type="submit"
            disabled={!selectedLevelId || creatingUnit}
          >
            {creatingUnit ? "Adding..." : "Add unit"}
          </button>
        </form>
        {!selectedLevelId ? (
          <p className={styles.empty}>Select a level before creating units.</p>
        ) : null}
      </section>

      <section className={styles.card}>
        <h2>Units in selected level</h2>
        {loadingUnits ? <p className={styles.meta}>Loading units...</p> : null}
        {!loadingUnits && selectedLevelId && units.length === 0 ? (
          <p className={styles.empty}>No units yet for this level.</p>
        ) : null}
        <ul className={styles.list}>
          {units.map((unit) => (
            <li key={unit.id}>
              {unit.orderIndex + 1}. {unit.title} ({unit.slug})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default ProgramsPage;
