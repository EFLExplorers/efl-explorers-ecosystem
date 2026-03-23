'use client';

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  FileText,
  Clock,
  UserPlus,
  Check
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import type { Curriculum } from "@shared/schema";
import { classNames } from "@/utils/classNames";
import styles from './curriculum.module.css';

type JsonLesson = {
  id?: number;
  title?: string;
  focus?: string;
  duration?: string;
  materials?: number;
  status?: string;
};

type JsonUnit = {
  title?: string;
  description?: string;
  lessons?: JsonLesson[];
};

type DisplayLesson = {
  key: string;
  title: string;
  focus: string;
  duration: string;
  materials: number;
  status: string;
};

type DisplayUnit = {
  key: string;
  title: string;
  description: string;
  lessons: DisplayLesson[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function parseUnitsJson(raw: unknown): JsonUnit[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(isRecord).map((u) => ({
    title: typeof u.title === "string" ? u.title : undefined,
    description: typeof u.description === "string" ? u.description : undefined,
    lessons: Array.isArray(u.lessons)
      ? u.lessons.filter(isRecord).map((l) => ({
          id: typeof l.id === "number" ? l.id : undefined,
          title: typeof l.title === "string" ? l.title : undefined,
          focus: typeof l.focus === "string" ? l.focus : undefined,
          duration: typeof l.duration === "string" ? l.duration : undefined,
          materials: typeof l.materials === "number" ? l.materials : undefined,
          status: typeof l.status === "string" ? l.status : undefined,
        }))
      : [],
  }));
}

function uniqueSortedLevels(items: Curriculum[]): string[] {
  const set = new Set(items.map((c) => c.level).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}

function buildDisplayUnits(items: Curriculum[], level: string): DisplayUnit[] {
  const rows = items.filter((c) => c.level === level);
  const out: DisplayUnit[] = [];

  for (const row of rows) {
    const parsed = parseUnitsJson(row.units);

    if (parsed.length === 0) {
      out.push({
        key: `curriculum-${row.id}`,
        title: row.title,
        description:
          [row.description, row.objectives].filter(Boolean).join(" ") ||
          "No unit breakdown is stored for this curriculum yet.",
        lessons: [],
      });
      continue;
    }

    parsed.forEach((unit, unitIndex) => {
      const unitTitle =
        unit.title?.trim() ||
        `Unit ${unitIndex + 1} (${row.title})`;
      const lessonsRaw = unit.lessons ?? [];
      const lessons: DisplayLesson[] = lessonsRaw.map((lesson, lessonIndex) => {
        const lid = lesson.id ?? lessonIndex + 1;
        return {
          key: `${row.id}-${unitIndex}-${lid}`,
          title:
            lesson.title?.trim() ||
            `Lesson ${lessonIndex + 1}`,
          focus:
            lesson.focus?.trim() ||
            "Details can be added to curriculum JSON in the database.",
          duration: lesson.duration?.trim() || "—",
          materials:
            typeof lesson.materials === "number" ? lesson.materials : 0,
          status: lesson.status === "published" ? "published" : "draft",
        };
      });

      out.push({
        key: `${row.id}-u-${unitIndex}`,
        title: unitTitle,
        description:
          unit.description?.trim() ||
          row.description ||
          "",
        lessons,
      });
    });
  }

  return out;
}

function matchesSearch(search: string, unit: DisplayUnit): boolean {
  const q = search.trim().toLowerCase();
  if (!q) {
    return true;
  }
  if (unit.title.toLowerCase().includes(q)) {
    return true;
  }
  if (unit.description.toLowerCase().includes(q)) {
    return true;
  }
  return unit.lessons.some(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.focus.toLowerCase().includes(q)
  );
}

export default function CurriculumPage() {
  const [search, setSearch] = useState("");
  const [activeLevel, setActiveLevel] = useState("");
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());

  const { data: curriculum, isLoading, isError } = useQuery<Curriculum[]>({
    queryKey: ["/api/curriculum"]
  });

  const levels = useMemo(
    () => uniqueSortedLevels(curriculum ?? []),
    [curriculum]
  );

  useEffect(() => {
    if (levels.length === 0) {
      return;
    }
    if (!activeLevel || !levels.includes(activeLevel)) {
      setActiveLevel(levels[0]);
    }
  }, [levels, activeLevel]);

  const displayUnits = useMemo(() => {
    if (!curriculum?.length || !activeLevel) {
      return [];
    }
    return buildDisplayUnits(curriculum, activeLevel).filter((u) =>
      matchesSearch(search, u)
    );
  }, [curriculum, activeLevel, search]);

  const getLessonStatusBadge = (status: string) => {
    if (status === "published") {
      return <Badge className={styles.badgeGreen}>Published</Badge>;
    }
    return <Badge className={styles.badgeBlue}>Draft</Badge>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Curriculum</h1>
          <p className={styles.subtitle}>Browse and assign lessons to your students</p>
        </div>
        <div className={styles.headerActions}>
          {selectedLessons.size > 0 && (
            <Button className={styles.assignButton}>
              <UserPlus className={styles.actionIcon} />
              Assign Selected ({selectedLessons.size})
            </Button>
          )}
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search curriculum..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.levelHeader}>
          <p className={styles.levelDescription}>Loading curriculum…</p>
        </div>
      ) : isError ? (
        <div className={styles.levelHeader}>
          <p className={styles.levelDescription}>Could not load curriculum. Check that you are signed in and the API is available.</p>
        </div>
      ) : levels.length === 0 ? (
        <div className={styles.levelHeader}>
          <p className={styles.levelDescription}>
            No curriculum rows yet. Add items via{' '}
            <code className={styles.inlineCode}>POST /api/curriculum</code> or seed the{' '}
            <code className={styles.inlineCode}>teachers.curriculum</code> table.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.levelsSection}>
            <div className={styles.levelsBorder}>
              <ul className={styles.levelsList}>
                {levels.map((level) => (
                  <li key={level}>
                    <Button
                      variant="ghost"
                      className={classNames(
                        styles.levelButton,
                        activeLevel === level && styles.levelButtonActive
                      )}
                      onClick={() => setActiveLevel(level)}
                    >
                      {level}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.levelHeader}>
            <div className={styles.levelHeaderTop}>
              <h2 className={styles.levelTitle}>{activeLevel}</h2>
            </div>
            <p className={styles.levelDescription}>Browse available lessons and assign them to your students</p>
          </div>

          <div className={styles.unitsContainer}>
            {displayUnits.length === 0 ? (
              <div className={styles.levelHeader}>
                <p className={styles.levelDescription}>
                  No units match your search for this level.
                </p>
              </div>
            ) : (
              displayUnits.map((unit) => (
                <Accordion type="single" collapsible key={unit.key} className={styles.accordion}>
                  <AccordionItem value={unit.key} className={styles.accordionItem}>
                    <div className={styles.unitHeader}>
                      <AccordionTrigger className={styles.accordionTrigger}>
                        <div className={styles.unitTitle}>{unit.title}</div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className={styles.accordionContent}>
                      {unit.description ? (
                        <p className={styles.unitDescription}>{unit.description}</p>
                      ) : null}

                      {unit.lessons.length === 0 ? (
                        <p className={styles.unitDescription}>
                          No lessons listed under this entry yet.
                        </p>
                      ) : (
                        <div className={styles.lessonsList}>
                          {unit.lessons.map((lesson) => {
                            const lessonKey = lesson.key;
                            const isSelected = selectedLessons.has(lessonKey);
                            return (
                              <div
                                key={lessonKey}
                                className={classNames(
                                  styles.lessonCard,
                                  isSelected && styles.lessonCardSelected
                                )}
                                onClick={() => {
                                  const next = new Set(selectedLessons);
                                  if (isSelected) {
                                    next.delete(lessonKey);
                                  } else {
                                    next.add(lessonKey);
                                  }
                                  setSelectedLessons(next);
                                }}
                              >
                                <div className={styles.lessonCardContent}>
                                  <div className={styles.lessonInfo}>
                                    <button
                                      type="button"
                                      className={styles.selectButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const next = new Set(selectedLessons);
                                        if (isSelected) {
                                          next.delete(lessonKey);
                                        } else {
                                          next.add(lessonKey);
                                        }
                                        setSelectedLessons(next);
                                      }}
                                    >
                                      {isSelected ? (
                                        <div className={styles.checkboxSelected}>
                                          <Check className={styles.checkIcon} />
                                        </div>
                                      ) : (
                                        <div className={styles.checkbox} />
                                      )}
                                    </button>
                                    <FileText className={styles.lessonIcon} />
                                    <div>
                                      <p className={styles.lessonTitle}>{lesson.title}</p>
                                      <p className={styles.lessonFocus}>{lesson.focus}</p>
                                      <div className={styles.lessonMeta}>
                                        <div className={styles.lessonMetaItem}>
                                          <Clock className={styles.metaIcon} />
                                          <span>{lesson.duration}</span>
                                        </div>
                                        <div className={styles.lessonMetaItem}>
                                          <FileText className={styles.metaIcon} />
                                          <span>{lesson.materials} materials</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={styles.lessonActions}>
                                    {getLessonStatusBadge(lesson.status)}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={styles.lessonAssignButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <UserPlus className={styles.assignIcon} />
                                      Assign
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
