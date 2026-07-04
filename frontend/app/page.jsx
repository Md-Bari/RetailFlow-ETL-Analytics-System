import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Database, FileSearch, ShieldCheck } from "lucide-react";

const steps = [
  ["Extract", "Receive CSV exports and preserve every source row for traceability.", FileSearch],
  ["Profile", "Infer numeric, date, categorical, boolean, text, and empty fields.", ShieldCheck],
  ["Load", "Preserve the source rows and reusable profile in PostgreSQL.", Database],
  ["Analyze", "Explore quality, distributions, trends, and relationships supported by the data.", BarChart3],
];

export default function Home() {
  return (
    <div className="page-shell">
      <section className="grid items-center gap-12 py-10 lg:grid-cols-[1.2fr_.8fr] lg:py-20">
        <div><div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}><CheckCircle2 size={15} /> Any CSV, one explainable workflow</div><h1 className="max-w-3xl text-4xl font-bold leading-[1.08] sm:text-5xl">Understand a new dataset in minutes.</h1><p className="mt-6 max-w-2xl text-lg leading-8 muted">Upload CSV data from any domain. RetailFlow infers its structure, measures quality, and reveals the distributions and relationships the columns actually support.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="btn-primary" href="/upload">Upload a dataset <ArrowRight size={17} /></Link><Link href="/dashboard" className="inline-flex items-center rounded-[10px] border px-4 py-2.5 font-semibold" style={{ borderColor: "var(--line)" }}>Explore insights</Link></div></div>
        <div className="panel overflow-hidden"><div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--line)", background: "var(--surface)" }}><span className="text-sm font-semibold">Adaptive analysis</span><span className="status status-success">Ready</span></div><div className="divide-y" style={{ borderColor: "var(--line)" }}>{["Automatic type inference", "Missing and duplicate checks", "Dynamic charts and trends", "Raw row preservation"].map((item, i) => <div key={item} className="flex items-center justify-between p-4 text-sm"><span>{item}</span><span className="font-mono text-xs muted">0{i + 1}</span></div>)}</div></div>
      </section>
      <section className="border-t py-14" style={{ borderColor: "var(--line)" }}><div className="mb-8 max-w-2xl"><h2 className="section-heading">One pipeline, four visible stages</h2><p className="mt-2 muted">The interface keeps ingestion, quality, storage, and business outcomes connected.</p></div><div className="grid gap-px overflow-hidden rounded-[14px] border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line)", background: "var(--line)" }}>{steps.map(([title, text, Icon], index) => <article key={title} className="bg-white p-5"><div className="mb-8 flex items-center justify-between"><Icon size={20} style={{ color: "var(--primary)" }} /><span className="text-xs font-mono muted">0{index + 1}</span></div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 muted">{text}</p></article>)}</div></section>
    </div>
  );
}
