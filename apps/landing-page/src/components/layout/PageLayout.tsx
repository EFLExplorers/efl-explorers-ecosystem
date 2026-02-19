import { ReactNode } from "react";
import styles from "./PageLayout.module.css";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return <div className={styles.pageLayout}>{children}</div>;
};
