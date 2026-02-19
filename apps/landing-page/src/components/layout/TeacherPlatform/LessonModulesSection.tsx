import { useState } from "react";
import styles from "./LessonModulesSection.module.css";
import type { PageSection } from "@/pages/api/page-content";

export type LessonModuleColorKey =
  | "muted"
  | "accent"
  | "textSecondary"
  | "foreground"
  | "mutedForeground"
  | "primaryThree"
  | "secondaryHover"
  | "primaryTwo"
  | "secondary"
  | "textMuted";

export interface LessonModuleLite {
  id: string;
  name: string;
  colorKey: LessonModuleColorKey;
  students: string;
  description: string;
  lessons: string;
  duration: string;
}

export interface LessonModulesSectionProps {
  section: PageSection | null;
  modules: LessonModuleLite[];
}

const colorClassByKey: Record<LessonModuleColorKey, string> = {
  muted: styles.colorMuted,
  accent: styles.colorAccent,
  textSecondary: styles.colorTextSecondary,
  foreground: styles.colorForeground,
  mutedForeground: styles.colorMutedForeground,
  primaryThree: styles.colorPrimaryThree,
  secondaryHover: styles.colorSecondaryHover,
  primaryTwo: styles.colorPrimaryTwo,
  secondary: styles.colorSecondary,
  textMuted: styles.colorTextMuted,
};

export const LessonModulesSection = ({
  section,
  modules,
}: LessonModulesSectionProps) => {
  if (!section) return null;
  if (!modules?.length) return null;
  const [selectedModule, setSelectedModule] = useState(0);

  const title = (section.content as any)?.title ?? "Explore our lesson modules";
  const subtitle =
    (section.content as any)?.subtitle ??
    "Choose from our comprehensive range of EFL modules designed for every proficiency level";

  const active = modules[selectedModule] ?? modules[0];
  const activeColorClass = colorClassByKey[active.colorKey] ?? "";

  return (
    <section className={styles.planets} data-cy="lesson-modules-section">
      <h2 data-cy="lesson-modules-title">{title}</h2>
      <p className={styles.modulesSubtitle} data-cy="lesson-modules-subtitle">
        {subtitle}
      </p>

      <div className={styles.modulesGrid} data-cy="lesson-modules-grid">
        {modules.map((module, index) => {
          const colorClass = colorClassByKey[module.colorKey] ?? "";
          return (
          <div
            key={module.id}
            className={`${styles.moduleCard} ${
              selectedModule === index ? styles.selectedModule : ""
            } ${colorClass}`}
            onClick={() => setSelectedModule(index)}
            data-cy="lesson-module-card"
            data-module-name={module.name}
          >
            <div className={styles.moduleHeader}>
              <h3 className={styles.moduleName}>{module.name}</h3>
              <div className={styles.moduleBadge}>{module.students}</div>
            </div>
            <p className={styles.moduleDescription}>{module.description}</p>
            <div className={styles.moduleDetails}>
              <div className={styles.moduleDetail}>
                <span className={styles.detailLabel}>Lessons:</span>
                <span className={styles.detailValue}>{module.lessons}</span>
              </div>
              <div className={styles.moduleDetail}>
                <span className={styles.detailLabel}>Duration:</span>
                <span className={styles.detailValue}>{module.duration}</span>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      <div
        className={`${styles.selectedModuleInfo} ${activeColorClass}`}
        data-cy="selected-module-info"
      >
        <h3 data-cy="selected-module-title">
          Selected Module: {active.name}
        </h3>
        <p data-cy="selected-module-description">
          {active.description}
        </p>
        <div className={styles.moduleStats}>
          <div className={styles.stat} data-cy="selected-module-size">
            <span className={styles.statLabel}>Recommended Class Size</span>
            <span className={styles.statValue}>
              {active.students} students
            </span>
          </div>
          <div className={styles.stat} data-cy="selected-module-lessons">
            <span className={styles.statLabel}>Total Lessons</span>
            <span className={styles.statValue}>
              {active.lessons}
            </span>
          </div>
          <div className={styles.stat} data-cy="selected-module-duration">
            <span className={styles.statLabel}>Typical Duration</span>
            <span className={styles.statValue}>
              {active.duration}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
