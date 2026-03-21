import { JsonCodeBlock } from "@/components/common/JsonCodeBlock";
import ui from "@/components/layout/dashboardUi.module.css";
import type { CurriculumExplorerData } from "@/types/db-visualizer";

import styles from "./CurriculumExplorerPanel.module.css";

type CurriculumExplorerPanelProps = {
  data: CurriculumExplorerData;
};

export const CurriculumExplorerPanel = ({ data }: CurriculumExplorerPanelProps) => {
  return (
    <section className={ui.pageStack}>
      {data.programs.map((program) => (
        <article key={program.id} className={`${ui.card} ${styles.programCard}`}>
          <header className={styles.programHeader}>
            <h2 className={styles.programTitle}>{program.title}</h2>
            <span className={styles.slug}>/{program.slug}</span>
          </header>

          <div className={styles.levelList}>
            {program.levels.map((level) => {
              const liveSnapshot = data.liveSnapshotsByLevel[level.id];
              return (
                <section key={level.id} className={`${ui.cardQuiet} ${styles.levelCard}`}>
                  <header className={styles.levelHeader}>
                    <div>
                      <h3 className={styles.levelTitle}>{level.title}</h3>
                      <span className={styles.slug}>/{level.slug}</span>
                    </div>
                    <span className={styles.statusBadge}>{level.status}</span>
                  </header>

                  {liveSnapshot ? (
                    <p className={styles.liveSnapshot}>
                      Live snapshot: v{liveSnapshot.version} ({liveSnapshot.isCurrent ? "isCurrent" : "latestPublished"}
                      )
                    </p>
                  ) : (
                    <p className={styles.liveSnapshot}>No publish snapshot found for this level.</p>
                  )}

                  <div className={styles.unitList}>
                    {level.units.map((unit) => (
                      <article key={unit.id} className={`${ui.cardQuiet} ${styles.unitCard}`}>
                        <header className={styles.unitHeader}>
                          <strong className={styles.unitTitle}>{unit.title}</strong>
                          <span className={styles.slug}>/{unit.slug}</span>
                        </header>
                        <p className={styles.summary}>{unit.summary ?? "No summary provided."}</p>
                        <div className={styles.jsonGrid}>
                          <div>
                            <p className={styles.label}>mediaManifest</p>
                            <JsonCodeBlock value={unit.mediaManifest} />
                          </div>
                          <div>
                            <p className={styles.label}>assignmentConfig</p>
                            <JsonCodeBlock value={unit.assignmentConfig} />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      ))}
      {data.programs.length === 0 ? (
        <p className={ui.empty}>
          No curriculum programs in this database. When you add programs via the Curriculum Platform,
          they will show here (same <code>DATABASE_URL</code>).
        </p>
      ) : null}
    </section>
  );
};
