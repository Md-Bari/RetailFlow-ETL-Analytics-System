"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Braces, Columns3, Copy, Database, Sparkles } from "lucide-react";
import ChartCard from "../../../components/ChartCard";
import DataTable from "../../../components/DataTable";
import KPICard from "../../../components/KPICard";
import { ErrorState, LoadingState } from "../../../components/PageState";
import { getDatasetProfile, getDatasets, getAiInsights } from "../../../lib/api";

const formatNumber = value => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value ?? 0);

export default function DashboardPage() {
  return <Suspense fallback={<div className="page-shell"><LoadingState label="Preparing dataset workspace…" /></div>}><DatasetDashboard /></Suspense>;
}

function DatasetDashboard() {
  const params = useSearchParams();
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(params.get("dataset") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [previewRows, setPreviewRows] = useState(50);

  useEffect(() => { getDatasets().then(items => { setDatasets(items); setSelected(current => current || (items[0]?.id ? String(items[0].id) : "")); }).catch(err => setError(err.message)); }, []);
  useEffect(() => { if (!selected) return; setData(null); setError(""); getDatasetProfile(selected).then(setData).catch(err => setError(err.message)); }, [selected]);

  if (error) return <div className="page-shell"><ErrorState message={`Dataset insights could not be loaded: ${error}`} /></div>;
  if (!selected && datasets.length === 0) return <div className="page-shell"><DataTable columns={[]} rows={[]} emptyTitle="Upload your first dataset" emptyMessage="Any CSV works—RetailFlow will infer its columns and build a compatible profile." /></div>;
  if (!data) return <div className="page-shell"><LoadingState label="Analyzing dataset profile…" /></div>;

  const { dataset, profile, preview } = data;
  const missingRate = dataset.row_count * dataset.column_count ? dataset.missing_cells / (dataset.row_count * dataset.column_count) * 100 : 0;
  const numeric = profile.columns.filter(column => column.type === "numeric");
  const categorical = profile.columns.filter(column => ["categorical", "boolean"].includes(column.type) && column.top_values?.length);
  const previewColumns = Object.keys(preview[0] || {}).slice(0, 12).map(key => ({ key, label: key }));

  return <div className="page-shell">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl font-bold">Dataset insights</h1><p className="mt-2 muted">Evidence generated from inferred types—not a predefined business schema.</p></div><label className="text-sm font-medium">Dataset<select className="ml-3 min-w-56 rounded-[10px] border bg-white px-3 py-2" style={{ borderColor: "var(--line)" }} value={selected} onChange={event => setSelected(event.target.value)}>{datasets.map(item => <option key={item.id} value={item.id}>{item.filename} · {item.row_count} rows</option>)}</select></label></div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><KPICard label="Rows" value={formatNumber(dataset.row_count)} detail="Source records preserved" icon={Database} /><KPICard label="Columns" value={dataset.column_count} detail={`${profile.numeric_columns.length} numeric · ${profile.datetime_columns.length} date`} icon={Columns3} /><KPICard label="Missing cells" value={formatNumber(dataset.missing_cells)} detail={`${missingRate.toFixed(1)}% of all cells`} icon={Braces} /><KPICard label="Duplicate rows" value={formatNumber(dataset.duplicate_rows)} detail="Exact row matches" icon={Copy} /></div>

    <AiInsightsPanel datasetId={selected} />

    <section className="mt-6 panel p-5"><div className="mb-4 flex items-center gap-2"><Sparkles size={18} style={{ color: "var(--primary)" }} /><h2 className="font-semibold">What stands out</h2></div><ul className="grid gap-3 md:grid-cols-2">{profile.insights.map(insight => <li key={insight} className="rounded-[10px] p-3 text-sm leading-6" style={{ background: "var(--surface)" }}>{insight}</li>)}</ul></section>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {profile.trend?.points?.length > 1 && <ChartCard className="lg:col-span-2" title={`Trend over ${profile.trend.date_column}`} description={profile.trend.metric}><ResponsiveContainer width="100%" height="100%"><AreaChart data={profile.trend.points}><CartesianGrid stroke="oklch(0.91 0.01 250)" vertical={false}/><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tickFormatter={formatNumber}/><Tooltip formatter={formatNumber}/><Area dataKey="value" type="monotone" stroke="oklch(0.52 0.19 255)" fill="oklch(0.94 0.035 255)" strokeWidth={2}/></AreaChart></ResponsiveContainer></ChartCard>}
      {categorical.slice(0, 4).map(column => <ChartCard key={column.name} title={column.name} description={`${column.unique} distinct values · top 10 shown`}><ResponsiveContainer width="100%" height="100%"><BarChart data={column.top_values} layout="vertical" margin={{ left: 24 }}><CartesianGrid stroke="oklch(0.91 0.01 250)" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="value" width={100} tick={{ fontSize: 11 }}/><Tooltip/><Bar dataKey="count" fill="oklch(0.52 0.19 255)" radius={[0, 4, 4, 0]}/></BarChart></ResponsiveContainer></ChartCard>)}
      {numeric.slice(0, 4).map(column => <ChartCard key={column.name} title={`${column.name} distribution`} description={`Mean ${formatNumber(column.summary?.mean)} · median ${formatNumber(column.summary?.median)}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={column.distribution}><CartesianGrid stroke="oklch(0.91 0.01 250)" vertical={false}/><XAxis dataKey="range" tick={{ fontSize: 10 }} interval="preserveStartEnd"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="oklch(0.62 0.14 190)" radius={[4, 4, 0, 0]}/></BarChart></ResponsiveContainer></ChartCard>)}
    </div>

    <ColumnInventory columns={profile.columns} />
    {profile.correlations.length > 0 && <CorrelationTable rows={profile.correlations} />}

    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="section-heading">Source preview</h2>
          <p className="mt-1 text-sm muted">
            Showing {Math.min(previewRows === "all" ? preview.length : previewRows, preview.length)} of {preview.length} rows · first {previewColumns.length} columns
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          Rows to show:
          <select
            value={previewRows}
            onChange={e => setPreviewRows(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value="all">All rows</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={previewColumns}
        rows={previewRows === "all" ? preview : preview.slice(0, previewRows)}
      />
    </section>
  </div>;
}

function AiInsightsPanel({ datasetId }) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true); setError(""); setInsights("");
    try {
      const res = await getAiInsights(datasetId, "Analyze dataset quality and overall distribution summary.");
      setInsights(res.insights);
    } catch (err) {
      setError(err.message || "Failed to generate AI insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 panel p-5 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          <h2 className="font-semibold text-lg">Gemini AI Deep Insights</h2>
          <span className="status status-success text-xs ml-2">Gemini 2.0 Flash</span>
        </div>
        {!insights && !loading && <button onClick={handleGenerate} className="btn-primary py-1.5 px-4 text-sm">Generate AI Analysis</button>}
      </div>
      
      {loading && <div className="flex flex-col items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div><p className="text-sm muted">Gemini is analyzing your dataset...</p></div>}
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      
      {insights && (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:mb-2 prose-ul:my-2 prose-li:my-1 mt-4 p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-sm leading-6">
          {insights}
        </div>
      )}
    </section>
  );
}

function ColumnInventory({ columns }) {
  const rows = useMemo(() => columns.map((column, index) => ({ id: index, ...column })), [columns]);
  const tableColumns = [{ key: "name", label: "Column" }, { key: "type", label: "Inferred type", render: value => <span className="status" style={{ background: "var(--primary-soft)", color: "var(--primary-dark)" }}>{value}</span> }, { key: "count", label: "Populated" }, { key: "missing", label: "Missing" }, { key: "unique", label: "Unique" }, { key: "summary", label: "Range / coverage", render: (value, row) => value ? `${formatNumber(value.min)} → ${formatNumber(value.max)}` : row.type === "datetime" ? `${String(row.min || "—").slice(0, 10)} → ${String(row.max || "—").slice(0, 10)}` : "—" }];
  return <section className="mt-8"><div className="mb-4"><h2 className="section-heading">Column inventory</h2><p className="mt-1 text-sm muted">Automatic type inference and completeness by field.</p></div><DataTable columns={tableColumns} rows={rows} /></section>;
}

function CorrelationTable({ rows }) {
  const columns = [{ key: "left", label: "Column A" }, { key: "right", label: "Column B" }, { key: "value", label: "Correlation", render: value => <span className="font-semibold tabular-nums">{Number(value).toFixed(3)}</span> }];
  return <section className="mt-8"><div className="mb-4"><h2 className="section-heading">Strongest numeric relationships</h2><p className="mt-1 text-sm muted">Pearson correlation describes association, not causation.</p></div><DataTable columns={columns} rows={rows} /></section>;
}
