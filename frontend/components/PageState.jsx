import { AlertTriangle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading data…" }) { return <div className="panel flex min-h-64 items-center justify-center gap-3 muted"><LoaderCircle className="animate-spin" aria-hidden="true" /><span>{label}</span></div>; }
export function ErrorState({ message }) { return <div className="panel flex min-h-48 items-center justify-center gap-3 p-6 text-center" role="alert" style={{ color: "var(--danger)" }}><AlertTriangle aria-hidden="true" /><span>{message}</span></div>; }
