import styles from "./LandingLogicPanel.module.css";

import type { LandingLogicData } from "@/types/db-visualizer";

type LandingLogicPanelProps = {
  data: LandingLogicData;
};

export const LandingLogicPanel = ({ data }: LandingLogicPanelProps) => {
  const contentNodesById = new Map(data.contentNodes.map((node) => [node.id, node]));

  return (
    <section className={styles.panel}>
      <div className={styles.overviewRow}>
        <article className={styles.statCard}>
          <h3>Pages</h3>
          <p>{data.pages.length}</p>
        </article>
        <article className={styles.statCard}>
          <h3>Page Sections</h3>
          <p>{data.pages.reduce((total, page) => total + page.sections.length, 0)}</p>
        </article>
        <article className={styles.statCard}>
          <h3>Content Relationships</h3>
          <p>{data.contentEdges.length}</p>
        </article>
        <article className={styles.statCard}>
          <h3>Alien Assets</h3>
          <p>{data.alienAssets.length}</p>
        </article>
      </div>

      <article className={styles.treeCard}>
        <h3>Content Tree</h3>
        {data.contentEdges.length === 0 ? (
          <p className={styles.emptyState}>No content relationships found.</p>
        ) : (
          <ul className={styles.treeList}>
            {data.contentEdges.map((edge) => {
              const parent = contentNodesById.get(edge.parentId);
              const child = contentNodesById.get(edge.childId);
              return (
                <li key={edge.id} className={styles.treeRow}>
                  <span className={styles.relationshipType}>{edge.relationshipType}</span>
                  <span className={styles.nodeLabel}>
                    {parent?.title ?? parent?.slug ?? parent?.id ?? edge.parentId}
                  </span>
                  <span className={styles.arrow}>{"->"}</span>
                  <span className={styles.nodeLabel}>
                    {child?.title ?? child?.slug ?? child?.id ?? edge.childId}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </article>

      <article className={styles.assetCard}>
        <h3>Shared Assets (metadata contains alien)</h3>
        {data.alienAssets.length === 0 ? (
          <p className={styles.emptyState}>No shared assets matched this filter.</p>
        ) : (
          <div className={styles.assetGrid}>
            {data.alienAssets.map((asset) => (
              <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className={styles.assetItem}>
                <div className={styles.assetHeader}>
                  <strong>{asset.filename}</strong>
                  <span>{asset.mimeType}</span>
                </div>
                <p>{asset.altText ?? asset.caption ?? "No caption"}</p>
              </a>
            ))}
          </div>
        )}
      </article>
    </section>
  );
};
