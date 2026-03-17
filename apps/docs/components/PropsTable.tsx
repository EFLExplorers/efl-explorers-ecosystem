import type { ReactNode } from "react";

export type PropRow = {
  name: string;
  type: string;
  required: boolean;
  description: ReactNode;
  defaultValue?: string;
};

type PropsTableProps = {
  rows: PropRow[];
};

export const PropsTable = ({ rows }: PropsTableProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Required</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>
              <code>{row.name}</code>
            </td>
            <td>
              <code>{row.type}</code>
            </td>
            <td>{row.required ? "Yes" : "No"}</td>
            <td>
              <code>{row.defaultValue ?? "-"}</code>
            </td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
