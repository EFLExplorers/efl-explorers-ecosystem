import styles from "./JsonCodeBlock.module.css";

type JsonCodeBlockProps = {
  value: unknown;
};

export const JsonCodeBlock = ({ value }: JsonCodeBlockProps) => {
  const formatted = JSON.stringify(value ?? {}, null, 2);

  return (
    <pre className={styles.codeBlock}>
      <code>{formatted}</code>
    </pre>
  );
};
