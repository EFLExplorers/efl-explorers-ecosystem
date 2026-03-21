import styles from "./RouteWarning.module.css";

type RouteWarningProps = {
  message: string;
};

export const RouteWarning = ({ message }: RouteWarningProps) => {
  return <p className={styles.warning}>{message}</p>;
};
