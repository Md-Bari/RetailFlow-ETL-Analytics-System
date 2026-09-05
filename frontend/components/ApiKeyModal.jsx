"use client";

import { useState, useEffect } from "react";
import { KeyRound, X } from "lucide-react";
import { checkAiStatus } from "../lib/api";

export default function ApiKeyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState("");
  const [isConfiguredEnv, setIsConfiguredEnv] = useState(false);

  useEffect(() => {
    checkAiStatus().then(res => setIsConfiguredEnv(res.configured)).catch(() => {});
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setKey(saved);
  }, []);

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem("gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
        style={{ color: (key || isConfiguredEnv) ? "var(--success)" : "var(--warning)" }}
      >
        <KeyRound size={16} />
        <span>{(key || isConfiguredEnv) ? "AI Ready" : "Set AI Key"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="panel w-full max-w-md p-6 shadow-xl relative">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><KeyRound className="text-purple-600" /> Gemini API Configuration</h2>
            <p className="text-sm muted mb-4">
              {isConfiguredEnv 
                ? "The API key is already configured in the server's .env file. You can optionally override it here." 
                : "Enter a Gemini API Key to enable AI Insights, EDA recommendations, and Report Generation."}
            </p>
            <input 
              type="password"
              placeholder="AIza..."
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full rounded-[10px] border px-3 py-2 mb-4"
              style={{ borderColor: "var(--line)" }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="btn-primary">Save Key</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
