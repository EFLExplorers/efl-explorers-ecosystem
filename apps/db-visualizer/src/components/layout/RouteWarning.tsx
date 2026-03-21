import { AlertTriangle } from "lucide-react";

import styles from "./RouteWarning.module.css";

type RouteWarningProps = {
  message: string;
};

export const RouteWarning = ({ message }: RouteWarningProps) => {
  return (
    <div className={styles.wrap} role="alert">
      <AlertTriangle className={styles.icon} size={18} strokeWidth={2} aria-hidden />
      <p className={styles.text}>{message}</p>
    </div>
  );
};
