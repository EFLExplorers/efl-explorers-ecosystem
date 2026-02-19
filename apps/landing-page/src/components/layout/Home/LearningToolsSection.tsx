import { PageSection } from "../../../pages/api/page-content";
import styles from "./LearningToolsSection.module.css";

export interface LearningToolLite {
  id: string;
  title?: string;
  description?: string;
  content: Record<string, any>;
}

export interface LearningToolsSectionProps {
  tools: LearningToolLite[];
  section?: PageSection | null;
}

const getSectionText = (
  section?: PageSection | null,
  key?: string
): string => {
  if (!section) return "";
  const contentText = (section.content as Record<string, any> | undefined)?.[
    key || "text"
  ];
  return (
    contentText ??
    section.body ??
    section.subtitle ??
    section.title ??
    section.heading ??
    ""
  );
};

export const LearningToolsSection = ({
  tools,
  section,
}: LearningToolsSectionProps) => {
  if (!tools?.length) return null;

  const title =
    getSectionText(section, "title") ||
    getSectionText(section, "heading") ||
    "";
  const subtitle = getSectionText(section, "subtitle") || getSectionText(section);

  return (
    <section className={styles.tools} data-cy="learning-tools-section">
      <div className={styles.content}>
        {title ? (
          <h2 className={styles.title} data-cy="learning-tools-title">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className={styles.subtitle} data-cy="learning-tools-subtitle">
            {subtitle}
          </p>
        ) : null}

        <div className={styles.toolsGrid} data-cy="learning-tools-grid">
          {tools.map((tool) => {
            const name = tool.title || (tool.content as any)?.title || "";
            const description =
              tool.description || (tool.content as any)?.description || "";
            const icon = (tool.content as any)?.icon || "";

            return (
              <div
                key={tool.id}
                className={styles.toolCard}
                data-cy="learning-tool-card"
              >
                <div className={styles.toolIcon}>{icon}</div>
                <h3 className={styles.toolTitle}>{name}</h3>
                <p className={styles.toolDescription}>{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningToolsSection;
