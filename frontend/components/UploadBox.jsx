"use client";

import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { uploadCsv } from "../lib/api";

export default function UploadBox() {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!file) return setError("Choose a CSV file before starting the ETL run.");
    setLoading(true); setError(""); setResult(null);
    try { const response = await uploadCsv(file); setResult(response.result); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="panel p-5 sm:p-8">
        <button type="button" onClick={() => input.current?.click()} className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed p-7 text-center transition-colors hover:bg-slate-50" style={{ borderColor: "oklch(0.74 0.08 250)" }}>
          <span className="mb-4 grid size-12 place-items-center rounded-xl" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}><UploadCloud /></span>
          <span className="font-semibold">{file ? file.name : "Choose a retail sales CSV"}</span>
          <span className="mt-2 text-sm muted">Required columns are validated before any clean rows are loaded.</span>
        </button>
        <input ref={input} className="sr-only" type="file" accept=".csv,text/csv" onChange={event => { setFile(event.target.files?.[0] || null); setError(""); }} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm muted">Maximum recommended size: 25 MB</p><button className="btn-primary" disabled={loading || !file}>{loading ? "Processing…" : "Run ETL pipeline"}</button></div>
      </form>
      {error && <div className="panel p-4 text-sm" role="alert" style={{ color: "var(--danger)", borderColor: "oklch(0.82 0.08 28)" }}>{error}</div>}
      {result && <div className="panel p-5" role="status"><div className="flex items-center gap-2 font-semibold" style={{ color: "var(--success)" }}><FileSpreadsheet size={20} /> ETL run completed</div><div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["File", result.filename], ["Total rows", result.total_rows], ["Valid rows", result.valid_rows], ["Failed rows", result.failed_rows]].map(([label, value]) => <div key={label}><p className="text-xs muted">{label}</p><p className="mt-1 truncate font-semibold tabular-nums">{value}</p></div>)}</div></div>}
    </div>
  );
}
