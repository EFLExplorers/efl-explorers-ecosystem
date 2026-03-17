import type { ReactNode } from "react";

type DoDontProps = {
  doItems: ReactNode[];
  dontItems: ReactNode[];
  doTitle?: string;
  dontTitle?: string;
};

export const DoDont = ({
  doItems,
  dontItems,
  doTitle = "Do",
  dontTitle = "Don't",
}: DoDontProps) => {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        marginTop: "1rem",
      }}
    >
      <section
        style={{
          border: "1px solid rgba(34, 197, 94, 0.35)",
          borderRadius: "0.5rem",
          padding: "0.75rem",
        }}
      >
        <strong>{doTitle}</strong>
        <ul>
          {doItems.map((item, idx) => (
            <li key={`do-${idx}`}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        style={{
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: "0.5rem",
          padding: "0.75rem",
        }}
      >
        <strong>{dontTitle}</strong>
        <ul>
          {dontItems.map((item, idx) => (
            <li key={`dont-${idx}`}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
