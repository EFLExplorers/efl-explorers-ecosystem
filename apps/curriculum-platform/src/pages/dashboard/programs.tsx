import type { GetServerSideProps } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireActiveCurriculumManager } from "@/lib/curriculumDashboardGuard";
import styles from "@/pages/dashboard/workspace.module.css";

type Program = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  isArchived?: boolean;
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
  estimatedMinutes?: number | null;
  assignmentConfig?: AssignmentConfig;
};

type AssignmentConfig = {
  mode?: "self_paced" | "teacher_led";
  dueDays?: number;
  maxAttempts?: number;
  estimatedMinutes?: number;
  scoring?: {
    passingScore?: number;
    masteryThreshold?: number;
  };
  reporting?: {
    emitUnitCompletion?: boolean;
  };
};

type AssignmentDraft = {
  mode: "self_paced" | "teacher_led";
  dueDays: string;
  maxAttempts: string;
  estimatedMinutes: string;
  passingScore: string;
  masteryThreshold: string;
  emitUnitCompletion: boolean;
};

const emptyAssignmentDraft: AssignmentDraft = {
  mode: "self_paced",
  dueDays: "",
  maxAttempts: "",
  estimatedMinutes: "",
  passingScore: "",
  masteryThreshold: "",
  emitUnitCompletion: true,
};

const toPositiveInt = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
};

const toBoundedPercent = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return undefined;
  }
  return parsed;
};

const assignmentConfigFromDraft = (draft: AssignmentDraft): AssignmentConfig => {
  const dueDays = toPositiveInt(draft.dueDays);
  const maxAttempts = toPositiveInt(draft.maxAttempts);
  const estimatedMinutes = toPositiveInt(draft.estimatedMinutes);
  const passingScore = toBoundedPercent(draft.passingScore);
  const masteryThreshold = toBoundedPercent(draft.masteryThreshold);

  return {
    mode: draft.mode,
    ...(dueDays ? { dueDays } : {}),
    ...(maxAttempts ? { maxAttempts } : {}),
    ...(estimatedMinutes ? { estimatedMinutes } : {}),
    ...(passingScore !== undefined || masteryThreshold !== undefined
      ? {
          scoring: {
            ...(passingScore !== undefined ? { passingScore } : {}),
            ...(masteryThreshold !== undefined ? { masteryThreshold } : {}),
          },
        }
      : {}),
    reporting: {
      emitUnitCompletion: draft.emitUnitCompletion,
    },
  };
};

const assignmentDraftFromUnit = (unit: Unit): AssignmentDraft => {
  const config = unit.assignmentConfig;
  return {
    mode: config?.mode ?? "self_paced",
    dueDays: config?.dueDays ? String(config.dueDays) : "",
    maxAttempts: config?.maxAttempts ? String(config.maxAttempts) : "",
    estimatedMinutes: config?.estimatedMinutes
      ? String(config.estimatedMinutes)
      : unit.estimatedMinutes
        ? String(unit.estimatedMinutes)
        : "",
    passingScore:
      config?.scoring?.passingScore !== undefined
        ? String(config.scoring.passingScore)
        : "",
    masteryThreshold:
      config?.scoring?.masteryThreshold !== undefined
        ? String(config.scoring.masteryThreshold)
        : "",
    emitUnitCompletion: config?.reporting?.emitUnitCompletion ?? true,
  };
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const access = await requireActiveCurriculumManager(context);
  if ("redirect" in access) {
    return access;
  }
  return { props: {} };
};

export const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [programTitle, setProgramTitle] = useState("");
  const [newProgramSlug, setNewProgramSlug] = useState("");
  const [newProgramDescription, setNewProgramDescription] = useState("");
  const [editProgramTitle, setEditProgramTitle] = useState("");
  const [editProgramSlug, setEditProgramSlug] = useState("");
  const [editProgramDescription, setEditProgramDescription] = useState("");
  const [levelTitle, setLevelTitle] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [createAssignmentDraft, setCreateAssignmentDraft] = useState<AssignmentDraft>(
    emptyAssignmentDraft
  );
  const [editAssignmentDraft, setEditAssignmentDraft] = useState<AssignmentDraft>(
    emptyAssignmentDraft
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [creatingProgram, setCreatingProgram] = useState(false);
  const [creatingLevel, setCreatingLevel] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);
  const [savingUnitConfig, setSavingUnitConfig] = useState(false);
  const [savingProgram, setSavingProgram] = useState(false);
  const [archivingProgram, setArchivingProgram] = useState(false);

  const currentProgram = useMemo(
    () => programs.find((item) => item.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  );
  const selectedUnit = useMemo(
    () => units.find((item) => item.id === selectedUnitId) ?? null,
    [selectedUnitId, units]
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
    setUnits([]);
    setSelectedUnitId(null);
    setEditAssignmentDraft(emptyAssignmentDraft);
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
    const nextUnits = data.units ?? [];
    setUnits(nextUnits);
    const firstUnit = nextUnits[0];
    if (firstUnit) {
      setSelectedUnitId(firstUnit.id);
      setEditAssignmentDraft(assignmentDraftFromUnit(firstUnit));
    } else {
      setSelectedUnitId(null);
      setEditAssignmentDraft(emptyAssignmentDraft);
    }
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

  useEffect(() => {
    if (selectedUnit) {
      setEditAssignmentDraft(assignmentDraftFromUnit(selectedUnit));
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (currentProgram) {
      setEditProgramTitle(currentProgram.title);
      setEditProgramSlug(currentProgram.slug);
      setEditProgramDescription(currentProgram.description ?? "");
    }
  }, [currentProgram]);

  const createProgram = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setCreatingProgram(true);
    const slugTrim = newProgramSlug.trim();
    const descTrim = newProgramDescription.trim();
    const response = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: programTitle.trim(),
        ...(slugTrim ? { slug: slugTrim } : {}),
        ...(descTrim ? { description: descTrim } : {}),
      }),
    });
    const data = (await response.json()) as { program?: Program; error?: string };
    if (!response.ok || !data.program) {
      setError(data.error ?? "Failed to create program");
      setCreatingProgram(false);
      return;
    }
    setProgramTitle("");
    setNewProgramSlug("");
    setNewProgramDescription("");
    await loadPrograms();
    setSelectedProgramId(data.program.id);
    setSuccess(`Program "${data.program.title}" created.`);
    setCreatingProgram(false);
  };

  const saveProgramDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProgramId || !currentProgram) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSavingProgram(true);
    const response = await fetch(`/api/programs/${selectedProgramId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editProgramTitle.trim(),
        slug: editProgramSlug.trim(),
        description:
          editProgramDescription.trim() === "" ? null : editProgramDescription.trim(),
      }),
    });
    const data = (await response.json()) as { program?: Program; error?: string };
    if (!response.ok || !data.program) {
      setError(data.error ?? "Failed to update program");
      setSavingProgram(false);
      return;
    }
    await loadPrograms();
    setSuccess(`Program "${data.program.title}" updated.`);
    setSavingProgram(false);
  };

  const archiveSelectedProgram = async () => {
    if (!selectedProgramId || !currentProgram) {
      return;
    }
    if (
      !window.confirm(
        `Archive program "${currentProgram.title}"? It will be hidden from default lists.`
      )
    ) {
      return;
    }

    setError(null);
    setSuccess(null);
    setArchivingProgram(true);
    const response = await fetch(`/api/programs/${selectedProgramId}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      setError(data.error ?? "Failed to archive program");
      setArchivingProgram(false);
      return;
    }
    setSelectedProgramId(null);
    setSelectedLevelId(null);
    setLevels([]);
    setUnits([]);
    setSelectedUnitId(null);
    await loadPrograms();
    setSuccess(`Program "${currentProgram.title}" archived.`);
    setArchivingProgram(false);
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
      body: JSON.stringify({
        levelId: selectedLevelId,
        title: unitTitle,
        estimatedMinutes: toPositiveInt(createAssignmentDraft.estimatedMinutes),
        assignmentConfig: assignmentConfigFromDraft(createAssignmentDraft),
      }),
    });
    const data = (await response.json()) as { unit?: Unit; error?: string };
    if (!response.ok || !data.unit) {
      setError(data.error ?? "Failed to create unit");
      setCreatingUnit(false);
      return;
    }
    setUnitTitle("");
    setCreateAssignmentDraft(emptyAssignmentDraft);
    await loadUnits(selectedLevelId);
    setSuccess(`Unit "${data.unit.title}" created.`);
    setCreatingUnit(false);
  };

  const saveSelectedUnitConfig = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUnitId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSavingUnitConfig(true);
    const response = await fetch(`/api/units/${selectedUnitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estimatedMinutes: toPositiveInt(editAssignmentDraft.estimatedMinutes) ?? null,
        assignmentConfig: assignmentConfigFromDraft(editAssignmentDraft),
      }),
    });
    const data = (await response.json()) as { unit?: Unit; error?: string };
    if (!response.ok || !data.unit) {
      setError(data.error ?? "Failed to update unit assignment config");
      setSavingUnitConfig(false);
      return;
    }

    if (selectedLevelId) {
      await loadUnits(selectedLevelId);
    }
    setSuccess(`Assignment config updated for "${data.unit.title}".`);
    setSavingUnitConfig(false);
  };

  return (
    <DashboardShell
      pageTitle="Programs workspace"
      pageSubtitle="[wireframe] Programs · levels · units"
    >
      <div className={styles.workspaceRoot}>
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
          <label className={styles.field}>
            URL slug <span className={styles.meta}>(optional)</span>
            <input
              className={styles.input}
              value={newProgramSlug}
              onChange={(event) => setNewProgramSlug(event.target.value)}
              placeholder="Leave blank to derive from title"
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            Description <span className={styles.meta}>(optional)</span>
            <textarea
              className={styles.textarea}
              value={newProgramDescription}
              onChange={(event) => setNewProgramDescription(event.target.value)}
              rows={3}
              placeholder="Short summary for authors"
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

      <section className={styles.card}>
        <h2>Edit selected program</h2>
        {!currentProgram ? (
          <p className={styles.meta}>Select a program in the workspace below.</p>
        ) : (
          <form onSubmit={saveProgramDetails}>
            <label className={styles.field}>
              Title
              <input
                className={styles.input}
                value={editProgramTitle}
                onChange={(event) => setEditProgramTitle(event.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              URL slug
              <input
                className={styles.input}
                value={editProgramSlug}
                onChange={(event) => setEditProgramSlug(event.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <label className={styles.field}>
              Description
              <textarea
                className={styles.textarea}
                value={editProgramDescription}
                onChange={(event) => setEditProgramDescription(event.target.value)}
                rows={3}
                placeholder="Optional"
              />
            </label>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.buttonPrimary}`}
                type="submit"
                disabled={savingProgram}
              >
                {savingProgram ? "Saving…" : "Save program"}
              </button>
              <button
                className={`${styles.button} ${styles.buttonDanger}`}
                type="button"
                disabled={archivingProgram || savingProgram}
                onClick={() => void archiveSelectedProgram()}
              >
                {archivingProgram ? "Archiving…" : "Archive program"}
              </button>
            </div>
          </form>
        )}
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
          <div className={styles.grid}>
            <label className={styles.field}>
              Assignment mode
              <select
                className={styles.select}
                value={createAssignmentDraft.mode}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    mode: event.target.value as "self_paced" | "teacher_led",
                  }))
                }
                aria-label="Create unit assignment mode"
              >
                <option value="self_paced">Self paced</option>
                <option value="teacher_led">Teacher led</option>
              </select>
            </label>
            <label className={styles.field}>
              Due in days (optional)
              <input
                className={styles.input}
                type="number"
                min={1}
                value={createAssignmentDraft.dueDays}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    dueDays: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              Max attempts (optional)
              <input
                className={styles.input}
                type="number"
                min={1}
                value={createAssignmentDraft.maxAttempts}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    maxAttempts: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              Estimated minutes (optional)
              <input
                className={styles.input}
                type="number"
                min={1}
                value={createAssignmentDraft.estimatedMinutes}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    estimatedMinutes: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              Passing score (0-100, optional)
              <input
                className={styles.input}
                type="number"
                min={0}
                max={100}
                value={createAssignmentDraft.passingScore}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    passingScore: event.target.value,
                  }))
                }
              />
            </label>
            <label className={styles.field}>
              Mastery threshold (0-100, optional)
              <input
                className={styles.input}
                type="number"
                min={0}
                max={100}
                value={createAssignmentDraft.masteryThreshold}
                onChange={(event) =>
                  setCreateAssignmentDraft((previous) => ({
                    ...previous,
                    masteryThreshold: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className={styles.field}>
            <span>Emit unit completion event</span>
            <input
              type="checkbox"
              checked={createAssignmentDraft.emitUnitCompletion}
              onChange={(event) =>
                setCreateAssignmentDraft((previous) => ({
                  ...previous,
                  emitUnitCompletion: event.target.checked,
                }))
              }
              aria-label="Create unit emit unit completion event"
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
              <button
                className={styles.button}
                type="button"
                onClick={() => setSelectedUnitId(unit.id)}
                aria-label={`Select unit ${unit.title}`}
              >
                {unit.orderIndex + 1}. {unit.title} ({unit.slug})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Assignment Config Editor</h2>
        {!selectedUnit ? (
          <p className={styles.empty}>Select a unit to edit assignment/reporting hooks.</p>
        ) : (
          <form onSubmit={saveSelectedUnitConfig}>
            <p className={styles.meta}>
              Editing: {selectedUnit.title} ({selectedUnit.slug})
            </p>
            <div className={styles.grid}>
              <label className={styles.field}>
                Assignment mode
                <select
                  className={styles.select}
                  value={editAssignmentDraft.mode}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      mode: event.target.value as "self_paced" | "teacher_led",
                    }))
                  }
                  aria-label="Edit unit assignment mode"
                >
                  <option value="self_paced">Self paced</option>
                  <option value="teacher_led">Teacher led</option>
                </select>
              </label>
              <label className={styles.field}>
                Due in days (optional)
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={editAssignmentDraft.dueDays}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      dueDays: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                Max attempts (optional)
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={editAssignmentDraft.maxAttempts}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      maxAttempts: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                Estimated minutes (optional)
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  value={editAssignmentDraft.estimatedMinutes}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      estimatedMinutes: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                Passing score (0-100, optional)
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={100}
                  value={editAssignmentDraft.passingScore}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      passingScore: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                Mastery threshold (0-100, optional)
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={100}
                  value={editAssignmentDraft.masteryThreshold}
                  onChange={(event) =>
                    setEditAssignmentDraft((previous) => ({
                      ...previous,
                      masteryThreshold: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className={styles.field}>
              <span>Emit unit completion event</span>
              <input
                type="checkbox"
                checked={editAssignmentDraft.emitUnitCompletion}
                onChange={(event) =>
                  setEditAssignmentDraft((previous) => ({
                    ...previous,
                    emitUnitCompletion: event.target.checked,
                  }))
                }
                aria-label="Edit unit emit unit completion event"
              />
            </label>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              type="submit"
              disabled={savingUnitConfig}
            >
              {savingUnitConfig ? "Saving..." : "Save assignment config"}
            </button>
          </form>
        )}
      </section>
      </div>
    </DashboardShell>
  );
};

export default ProgramsPage;
