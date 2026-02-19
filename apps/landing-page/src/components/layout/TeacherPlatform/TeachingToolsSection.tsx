import styles from "./TeachingToolsSection.module.css";
import type { PageSection } from "@/pages/api/page-content";

export interface TeachingToolLite {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TeachingToolsSectionProps {
  section: PageSection | null;
  tools: TeachingToolLite[];
}

export const TeachingToolsSection = ({
  section,
  tools,
}: TeachingToolsSectionProps) => {
  if (!section) return null;
  if (!tools?.length) return null;

  const kicker = (section.content as any)?.kicker ?? "Tools for teachers";
  const title = (section.content as any)?.title ?? "Everything you need, in one hub";
  const intro = (section.content as any)?.intro ?? "";
  const outro = (section.content as any)?.outro ?? "";
  const badge = (section.content as any)?.badge ?? "⚡️";

  return (
    <section className={styles.section} data-cy="teaching-tools-section">
      <div className={styles.card} data-cy="teaching-tools-card">
        <header className={styles.cardHeader}>
          <div>
            <p className={styles.kicker}>{kicker}</p>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardSubtitle} data-cy="teaching-tools-intro">
              {intro}
            </p>
          </div>
          <div className={styles.badge} aria-hidden="true">
            {badge}
          </div>
        </header>

        <div className={styles.toolGrid} data-cy="teaching-tools-grid">
          {tools.map((tool) => (
            <article
              key={tool.id}
              className={styles.toolCard}
              data-cy="teaching-tool-card"
              data-tool-name={tool.title}
            >
              <div className={styles.toolIcon} aria-hidden="true">
                {tool.icon || ""}
              </div>
              <div className={styles.toolContent}>
                <h4>{tool.title}</h4>
                <p>{tool.description}</p>
              </div>
            </article>
          ))}
        </div>

        {outro ? (
          <div className={styles.footerNote} data-cy="teaching-tools-outro">
            {outro}
          </div>
        ) : null}
      </div>
    </section>
  );
};
