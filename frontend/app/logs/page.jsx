"use client";

import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { ErrorState, LoadingState } from "../../components/PageState";
import { getLogs } from "../../lib/api";

const date = value => value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const columns = [{ key: "filename", label: "Filename" }, { key: "total_rows", label: "Total" }, { key: "valid_rows", label: "Valid" }, { key: "failed_rows", label: "Failed" }, { key: "status", label: "Status", render: value => <span className={`status ${value === "Completed" ? "status-success" : "status-error"}`}>{value}</span> }, { key: "start_time", label: "Started", render: date }, { key: "end_time", label: "Finished", render: date }];

export default function LogsPage() { const [rows, setRows] = useState(null); const [error, setError] = useState(""); useEffect(() => { getLogs().then(setRows).catch(err => setError(err.message)); }, []); return <div className="page-shell"><div className="mb-8"><h1 className="text-3xl font-bold">ETL run history</h1><p className="mt-2 muted">An operational record of every attempted upload and its outcome.</p></div>{error ? <ErrorState message={error} /> : rows === null ? <LoadingState /> : <DataTable columns={columns} rows={rows} />}</div>; }
