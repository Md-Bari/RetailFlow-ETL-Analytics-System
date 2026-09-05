"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Database, Settings2, Download, AlertTriangle } from "lucide-react";
import DataTable from "../../../components/DataTable";
import { ErrorState, LoadingState } from "../../../components/PageState";
import { getDatasets, getEda, previewPreprocess } from "../../../lib/api";

export default function EDAPage() {
  return <Suspense fallback={<div className="page-shell"><LoadingState label="Preparing EDA workspace…" /></div>}><EDAStudio /></Suspense>;
}

function EDAStudio() {
  const params = useSearchParams();
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(params.get("dataset") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { getDatasets().then(items => { setDatasets(items); setSelected(current => current || (items[0]?.id ? String(items[0].id) : "")); }).catch(err => setError(err.message)); }, []);
  
  useEffect(() => { 
    if (!selected) return; 
    setLoading(true); setData(null); setError(""); 
    getEda(selected).then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    }); 
  }, [selected]);

  if (error) return <div className="page-shell"><ErrorState message={`EDA could not be loaded: ${error}`} /></div>;
  if (!selected && datasets.length === 0) return <div className="page-shell"><ErrorState message="No datasets available for EDA." /></div>;

  return (
    <div className="page-shell">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Settings2 className="text-purple-600" /> EDA & Preprocessing Studio</h1>
          <p className="mt-2 muted">Explore distributions, outliers, and apply automated cleaning pipelines.</p>
        </div>
        <label className="text-sm font-medium">Dataset
          <select className="ml-3 min-w-56 rounded-[10px] border bg-white px-3 py-2" style={{ borderColor: "var(--line)" }} value={selected} onChange={e => setSelected(e.target.value)}>
            {datasets.map(item => <option key={item.id} value={item.id}>{item.filename}</option>)}
          </select>
        </label>
      </div>

      {loading && <LoadingState label="Computing deep EDA statistics..." />}
      
      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="panel p-5">
              <h2 className="section-heading mb-4">Detailed Column Profiling</h2>
              <DataTable 
                columns={[
                  { key: "name", label: "Column" },
                  { key: "type", label: "Type", render: v => <span className="status status-success">{v}</span> },
                  { key: "missing_pct", label: "Missing %", render: v => <span className={v > 20 ? "text-red-500 font-semibold" : ""}>{v}%</span> },
                  { key: "unique", label: "Unique" },
                  { key: "skewness", label: "Skewness", render: v => v ? v.toFixed(2) : "—" },
                  { key: "outliers", label: "Outliers", render: v => v ? <span className="flex items-center gap-1 text-orange-500 font-semibold"><AlertTriangle size={14} />{v}</span> : "—" }
                ]}
                rows={data.eda.columns.map((c, i) => ({ id: i, ...c }))}
              />
            </section>
          </div>
          
          <div className="space-y-6">
            <section className="panel p-5 bg-purple-50 border-purple-100 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-purple-600" />
                <h2 className="font-semibold text-lg text-purple-900">Gemini Cleaning Advisor</h2>
              </div>
              <div className="prose prose-sm text-purple-800 whitespace-pre-wrap leading-relaxed">
                {data.ai_advice}
              </div>
            </section>
            
            <PreprocessingControls datasetId={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

function PreprocessingControls({ datasetId }) {
  const [config, setConfig] = useState({
    missing_strategy: "keep",
    outlier_strategy: "keep",
    deduplicate: false
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await previewPreprocess(datasetId, config);
      setPreview(res);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel p-5">
      <h2 className="section-heading mb-4">Preprocessing Pipeline</h2>
      <div className="space-y-4 text-sm">
        <label className="block">
          <span className="font-medium">Missing Values</span>
          <select className="mt-1 block w-full rounded-lg border p-2 bg-white" value={config.missing_strategy} onChange={e => setConfig({ ...config, missing_strategy: e.target.value })}>
            <option value="keep">Keep as is</option>
            <option value="drop">Drop rows with missing</option>
            <option value="mean">Impute with Mean (Numeric)</option>
            <option value="median">Impute with Median (Numeric)</option>
          </select>
        </label>
        
        <label className="block">
          <span className="font-medium">Outliers (IQR Method)</span>
          <select className="mt-1 block w-full rounded-lg border p-2 bg-white" value={config.outlier_strategy} onChange={e => setConfig({ ...config, outlier_strategy: e.target.value })}>
            <option value="keep">Keep outliers</option>
            <option value="clip">Clip to IQR bounds</option>
            <option value="drop">Drop outlier rows</option>
          </select>
        </label>
        
        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={config.deduplicate} onChange={e => setConfig({ ...config, deduplicate: e.target.checked })} />
          <span className="font-medium">Remove exact duplicates</span>
        </label>
        
        <button onClick={handlePreview} disabled={loading} className="w-full btn-primary mt-4">
          {loading ? "Processing..." : "Preview Pipeline"}
        </button>
      </div>
      
      {preview && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Impact Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="muted">Rows</p>
              <p className="font-bold">{preview.stats.rows_before} &rarr; {preview.stats.rows_after}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="muted">Missing Cells</p>
              <p className="font-bold">{preview.stats.nulls_before} &rarr; {preview.stats.nulls_after}</p>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-2 px-4 rounded-lg mt-4 hover:bg-gray-800 transition-colors">
            <Download size={16} /> Export Cleaned CSV
          </button>
        </div>
      )}
    </section>
  );
}
