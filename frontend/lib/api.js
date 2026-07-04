const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, { ...options, cache: "no-store" });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.detail || message; } catch {}
    throw new Error(message);
  }
  return response.json();
}

export function uploadCsv(file) { const data = new FormData(); data.append("file", file); return request("/api/upload", { method: "POST", body: data }); }
export const getDatasets = () => request("/api/datasets");
export const getDatasetProfile = id => request(`/api/datasets/${id}/profile`);
export const getLogs = () => request("/api/logs");
