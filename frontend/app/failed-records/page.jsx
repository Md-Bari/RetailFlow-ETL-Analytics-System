"use client";

import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { ErrorState, LoadingState } from "../../components/PageState";
import { getFailedRecords } from "../../lib/api";

const columns = [{ key: "uploaded_filename", label: "Source file" }, { id: "order_id", key: "original_data", label: "Order ID", render: value => value?.order_id || "—" }, { key: "reason", label: "Failure reason", render: value => <span style={{ color: "var(--danger)" }}>{value}</span> }, { id: "json", key: "original_data", label: "Original row", render: value => <details><summary className="cursor-pointer font-medium" style={{ color: "var(--primary)" }}>Inspect JSON</summary><pre className="mt-2 max-w-lg whitespace-pre-wrap rounded-lg p-3 text-xs" style={{ background: "var(--surface)" }}>{JSON.stringify(value, null, 2)}</pre></details> }, { key: "created_at", label: "Recorded", render: value => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) }];

export default function FailedRecordsPage() { const [rows, setRows] = useState(null); const [error, setError] = useState(""); useEffect(() => { getFailedRecords().then(setRows).catch(err => setError(err.message)); }, []); return <div className="page-shell"><div className="mb-8 max-w-2xl"><h1 className="text-3xl font-bold">Failed records</h1><p className="mt-2 muted">Rows that did not meet the data contract, retained with their original values and exact rejection reasons.</p></div>{error ? <ErrorState message={error} /> : rows === null ? <LoadingState /> : <DataTable columns={columns} rows={rows} emptyTitle="No failed records" emptyMessage="Every processed row currently meets the validation contract." />}</div>; }
