"use client";

import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { ErrorState, LoadingState } from "../../components/PageState";
import { getDatasetProfile, getDatasets } from "../../lib/api";

export default function DataQualityPage() {
  const [datasets, setDatasets] = useState([]); const [selected, setSelected] = useState("");
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { getDatasets().then(items => { setDatasets(items); if (items[0]) setSelected(String(items[0].id)); }).catch(err => setError(err.message)); }, []);
  useEffect(() => { if (selected) getDatasetProfile(selected).then(setData).catch(err => setError(err.message)); }, [selected]);
  if (error) return <div className="page-shell"><ErrorState message={error} /></div>;
  if (!data) return <div className="page-shell"><LoadingState label="Inspecting completeness…" /></div>;
  const columns = [{ key: "name", label: "Column" }, { key: "type", label: "Type" }, { key: "count", label: "Populated" }, { key: "missing", label: "Missing" }, { key: "missing_rate", label: "Missing rate", render: value => `${value.toFixed(1)}%` }, { key: "unique", label: "Unique" }];
  const rows = data.profile.columns.map((column, index) => ({ id: index, ...column, missing_rate: data.dataset.row_count ? column.missing / data.dataset.row_count * 100 : 0 })).sort((a, b) => b.missing - a.missing);
  return <div className="page-shell"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl font-bold">Data quality</h1><p className="mt-2 muted">Completeness and uniqueness checks adapt to every uploaded schema.</p></div><label className="text-sm font-medium">Dataset<select className="ml-3 min-w-56 rounded-[10px] border bg-white px-3 py-2" style={{ borderColor: "var(--line)" }} value={selected} onChange={event => { setSelected(event.target.value); setData(null); }}>{datasets.map(item => <option key={item.id} value={item.id}>{item.filename}</option>)}</select></label></div><div className="mb-6 grid gap-px overflow-hidden rounded-[14px] border sm:grid-cols-3" style={{ borderColor: "var(--line)", background: "var(--line)" }}>{[["Missing cells", data.dataset.missing_cells], ["Duplicate rows", data.dataset.duplicate_rows], ["Columns checked", data.dataset.column_count]].map(([label, value]) => <div className="bg-white p-5" key={label}><p className="text-sm muted">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p></div>)}</div><DataTable columns={columns} rows={rows} /></div>;
}
