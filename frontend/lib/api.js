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


// AI, EDA, and Reports
const getHeaders = () => {
  const key = typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null;
  return key ? { "X-Gemini-Api-Key": key } : {};
};

export const checkAiStatus = () => request("/api/status");
export const getAiInsights = (id, prompt) => request(`/api/datasets/${id}/insights`, { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ prompt }) });
export const getEda = id => request(`/api/datasets/${id}/eda`, { headers: getHeaders() });
export const previewPreprocess = (id, config) => request(`/api/datasets/${id}/preprocess/preview`, { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ config }) });
export const generateReport = (id, config) => request(`/api/datasets/${id}/reports/generate`, { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify(config) });
export const sendChatMessage = (id, message, history) => request(`/api/datasets/${id}/chat`, { method: "POST", headers: { "Content-Type": "application/json", ...getHeaders() }, body: JSON.stringify({ message, history }) });
