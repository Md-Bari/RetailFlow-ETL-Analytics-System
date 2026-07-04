export default function KPICard({ label, value, detail, icon: Icon }) {
  return (
    <article className="panel flex min-h-32 flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3"><span className="text-sm font-medium muted">{label}</span>{Icon && <Icon size={18} aria-hidden="true" style={{ color: "var(--primary)" }} />}</div>
      <div><p className="mt-5 text-2xl font-bold tabular-nums">{value}</p>{detail && <p className="mt-1 text-xs muted">{detail}</p>}</div>
    </article>
  );
}
