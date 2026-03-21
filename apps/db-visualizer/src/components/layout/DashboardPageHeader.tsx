import styles from "./DashboardPageHeader.module.css";

export type DashboardPageHeaderProps = {
  title: string;
  description?: string;
};

export const DashboardPageHeader = ({ title, description }: DashboardPageHeaderProps) => {
  return (
    <header className={styles.wrap}>
      <h1 className={styles.title}>{title}</h1>
      {description ? <p className={styles.desc}>{description}</p> : null}
    </header>
  );
};
