import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Database, FileSearch, ShieldCheck } from "lucide-react";

const steps = [
  ["Extract", "Receive CSV exports and preserve every source row for traceability.", FileSearch],
  ["Transform", "Normalize fields, validate quality, and calculate analytics-ready revenue.", ShieldCheck],
  ["Load", "Write clean and rejected records into purpose-built PostgreSQL tables.", Database],
  ["Analyze", "Explore reliable KPIs, trends, categories, cities, and products.", BarChart3],
];

export default function Home() {
  return (
    <div className="page-shell">
      <section className="grid items-center gap-12 py-10 lg:grid-cols-[1.2fr_.8fr] lg:py-20">
        <div><div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}><CheckCircle2 size={15} /> Traceable data from file to dashboard</div><h1 className="max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl">Retail analytics built on data you can trust.</h1><p className="mt-6 max-w-2xl text-lg leading-8 muted">Upload raw sales exports, run a transparent validation pipeline, and see business performance without hiding the records that need attention.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="btn-primary" href="/upload">Upload sales data <ArrowRight size={17} /></Link><Link href="/dashboard" className="inline-flex items-center rounded-[10px] border px-4 py-2.5 font-semibold" style={{ borderColor: "var(--line)" }}>View dashboard</Link></div></div>
        <div className="panel overflow-hidden"><div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}><span className="text-sm font-semibold">Pipeline contract</span><span className="status status-success">Ready</span></div><div className="divide-y" style={{ borderColor: "var(--line)" }}>{["12 required source fields", "Row-level failure reasons", "Deterministic customer keys", "Auditable run history"].map((item, i) => <div key={item} className="flex items-center justify-between p-4 text-sm"><span>{item}</span><span className="font-mono text-xs muted">0{i + 1}</span></div>)}</div></div>
      </section>
      <section className="border-t py-14" style={{ borderColor: "var(--line)" }}><div className="mb-8 max-w-2xl"><h2 className="section-heading">One pipeline, four visible stages</h2><p className="mt-2 muted">The interface keeps ingestion, quality, storage, and business outcomes connected.</p></div><div className="grid gap-px overflow-hidden rounded-[14px] border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line)", background: "var(--line)" }}>{steps.map(([title, text, Icon], index) => <article key={title} className="bg-white p-5"><div className="mb-8 flex items-center justify-between"><Icon size={20} style={{ color: "var(--primary)" }} /><span className="text-xs font-mono muted">0{index + 1}</span></div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 muted">{text}</p></article>)}</div></section>
    </div>
  );
}
