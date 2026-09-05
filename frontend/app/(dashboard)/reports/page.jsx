"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Sparkles, Download, Copy, Printer } from "lucide-react";
import { ErrorState, LoadingState } from "../../../components/PageState";
import { getDatasets, generateReport } from "../../../lib/api";

export default function ReportsPage() {
  return <Suspense fallback={<div className="page-shell"><LoadingState label="Preparing Report Generator…" /></div>}><ReportGenerator /></Suspense>;
}

function ReportGenerator() {
  const params = useSearchParams();
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(params.get("dataset") || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const [form, setForm] = useState({
    title: "Executive Dataset Analysis",
    objective: "Identify key drivers and data quality issues.",
    audience: "C-Suite Executives",
    target_metric: "",
    date_column: "",
    forecast_horizon: 3,
    sections: ["Executive Summary", "Data Quality Audit", "Exploratory Analysis"],
    custom_instructions: ""
  });

  useEffect(() => { getDatasets().then(items => { setDatasets(items); setSelected(current => current || (items[0]?.id ? String(items[0].id) : "")); }).catch(err => setError(err.message)); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true); setError(""); setGeneratedReport(null);
    try {
      const res = await generateReport(selected, form);
      setGeneratedReport(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (section) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.includes(section) 
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section]
    }));
  };

  if (error) return <div className="page-shell"><ErrorState message={error} /></div>;

  return (
    <div className="page-shell">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="text-purple-600" /> AI Report Generator</h1>
        <p className="mt-2 muted">Generate comprehensive, structured business reports with predictive forecasting.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Form Configuration Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleGenerate} className="panel p-5 space-y-4">
            <label className="block text-sm font-medium">Dataset
              <select className="mt-1 block w-full rounded-lg border p-2 bg-white" value={selected} onChange={e => setSelected(e.target.value)} required>
                {datasets.map(item => <option key={item.id} value={item.id}>{item.filename}</option>)}
              </select>
            </label>
            
            <label className="block text-sm font-medium">Report Title
              <input type="text" className="mt-1 block w-full rounded-lg border p-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </label>
            
            <label className="block text-sm font-medium">Business Objective
              <input type="text" className="mt-1 block w-full rounded-lg border p-2" value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} required placeholder="e.g. Sales Optimization" />
            </label>
            
            <label className="block text-sm font-medium">Target Audience
              <select className="mt-1 block w-full rounded-lg border p-2 bg-white" value={form.audience} onChange={e => setForm({...form, audience: e.target.value})}>
                <option value="C-Suite Executives">C-Suite Executives</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="Operations & Management">Operations & Management</option>
                <option value="General Stakeholders">General Stakeholders</option>
              </select>
            </label>

            <div className="pt-4 border-t">
              <span className="block text-sm font-semibold mb-2">Sections to Include</span>
              {["Executive Summary", "Data Quality Audit", "Exploratory Analysis", "Trend Analysis & Forecast", "Risk & Recommendations"].map(section => (
                <label key={section} className="flex items-center gap-2 text-sm mb-1">
                  <input type="checkbox" checked={form.sections.includes(section)} onChange={() => handleSectionToggle(section)} /> {section}
                </label>
              ))}
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-1">Optional: Target Focus Metric</label>
              <input type="text" className="block w-full rounded-lg border p-2 text-sm mb-3" placeholder="e.g. Sales, Revenue" value={form.target_metric} onChange={e => setForm({...form, target_metric: e.target.value})} />
              
              <label className="block text-sm font-medium mb-1">Optional: Date Column (for Trends)</label>
              <input type="text" className="block w-full rounded-lg border p-2 text-sm mb-3" placeholder="e.g. Date, CreatedAt" value={form.date_column} onChange={e => setForm({...form, date_column: e.target.value})} />
            </div>

            <label className="block text-sm font-medium pt-2">Custom AI Prompt (Optional)
              <textarea className="mt-1 block w-full rounded-lg border p-2 text-sm" rows={2} value={form.custom_instructions} onChange={e => setForm({...form, custom_instructions: e.target.value})} placeholder="Specific questions you want answered..." />
            </label>

            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-2">
              {loading ? "Generating Report..." : <><Sparkles size={16}/> Generate Report</>}
            </button>
          </form>
        </div>

        {/* Report Preview Area */}
        <div className="lg:col-span-8">
          {loading && <div className="h-full min-h-[400px] flex items-center justify-center panel"><LoadingState label="Gemini AI is synthesizing your comprehensive report..." /></div>}
          
          {!loading && !generatedReport && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center panel text-gray-400 bg-gray-50/50">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Configure the form and click generate to view your AI report.</p>
            </div>
          )}

          {!loading && generatedReport && (
            <div className="panel p-0 overflow-hidden bg-white shadow-sm print:shadow-none print:border-none">
              <div className="bg-gray-50 border-b p-4 flex items-center justify-between print:hidden">
                <div className="flex gap-2">
                  <span className="status status-success text-xs">Generated by Gemini AI</span>
                  <span className="status bg-gray-200 text-gray-700 text-xs">{form.audience}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"><Printer size={18} /></button>
                  <button onClick={() => navigator.clipboard.writeText(generatedReport.report)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"><Copy size={18} /></button>
                </div>
              </div>
              
              <div className="p-8 md:p-12 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2 prose-a:text-purple-600 prose-p:leading-relaxed prose-li:my-1">
                <div 
                  className="font-sans text-sm md:text-base leading-[1.7]"
                  dangerouslySetInnerHTML={{ __html: generatedReport.report }}
                />
                
                {generatedReport.forecast_data && generatedReport.forecast_data.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-bold border-b pb-2 mb-4">Statistical Projections</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border-y">
                            <th className="p-3 font-semibold">Period</th>
                            <th className="p-3 font-semibold">Projected Value</th>
                            <th className="p-3 font-semibold text-gray-500">Lower Bound (95%)</th>
                            <th className="p-3 font-semibold text-gray-500">Upper Bound (95%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {generatedReport.forecast_data.map(row => (
                            <tr key={row.period} className="hover:bg-gray-50">
                              <td className="p-3 font-medium">{row.period}</td>
                              <td className="p-3 font-bold text-purple-700">{row.predicted_value}</td>
                              <td className="p-3 text-gray-500">{row.lower_bound}</td>
                              <td className="p-3 text-gray-500">{row.upper_bound}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
