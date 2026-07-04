export default function ChartCard({ title, description, children, className = "" }) {
  return (
    <section className={`panel min-w-0 p-5 ${className}`}>
      <div className="mb-5"><h2 className="font-semibold">{title}</h2>{description && <p className="mt-1 text-sm muted">{description}</p>}</div>
      <div className="h-72" role="img" aria-label={`${title}. ${description || "Analytics chart"}`}>{children}</div>
    </section>
  );
}
