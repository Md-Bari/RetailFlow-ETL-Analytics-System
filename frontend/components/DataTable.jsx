import { Inbox } from "lucide-react";

export default function DataTable({ columns, rows, emptyTitle = "No records yet", emptyMessage = "Data will appear here after the first ETL run." }) {
  if (!rows?.length) return <div className="panel grid min-h-64 place-items-center p-8 text-center"><div><Inbox className="mx-auto mb-3" style={{ color: "var(--primary)" }} /><h2 className="font-semibold">{emptyTitle}</h2><p className="mt-2 text-sm muted">{emptyMessage}</p></div></div>;
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead style={{ background: "var(--surface)" }}><tr>{columns.map(column => <th key={column.id || column.key} className="border-b px-4 py-3 font-semibold" style={{ borderColor: "var(--line)" }}>{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.id ?? index} className="border-b last:border-0" style={{ borderColor: "var(--line)" }}>{columns.map(column => <td key={column.id || column.key} className="max-w-md px-4 py-3 align-top">{column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "—")}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
