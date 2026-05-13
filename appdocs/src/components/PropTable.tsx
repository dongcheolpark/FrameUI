import type { ReactNode } from "react";

export interface PropRow {
  prop: string;
  type: string;
  defaultValue?: string;
  description: ReactNode;
}

interface PropTableProps {
  rows: PropRow[];
}

export function PropTable({ rows }: PropTableProps) {
  return (
    <div className="prop-table-wrap">
      <table className="prop-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.prop}>
              <td>
                <code className="prop-name">{row.prop}</code>
                <div className="prop-type">
                  <code>{row.type}</code>
                </div>
              </td>
              <td>
                {row.defaultValue ? <code>{row.defaultValue}</code> : <span className="muted">—</span>}
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
