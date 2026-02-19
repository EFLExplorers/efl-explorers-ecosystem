import { ReactNode } from "react";
import styles from "./SectionWrapper.module.css";
import { classNames } from "../../utils/classNames";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

export const SectionWrapper = ({
  children,
  className = "",
}: SectionWrapperProps) => {
  return (
    <section className={classNames(styles.section, className)}>
      <div className={styles.container}>
        {children}
      </div>
    </section>
  );
};
