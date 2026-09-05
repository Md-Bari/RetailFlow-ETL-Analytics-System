"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, User, Database, AlertCircle } from "lucide-react";
import { getDatasets, sendChatMessage } from "../../../lib/api";

export default function ChatPage() {
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getDatasets()
      .then(items => {
        setDatasets(items);
        if (items.length > 0) setSelected(String(items[0].id));
      })
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;

    const userMsg = { role: "user", content: input.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await sendChatMessage(selected, userMsg.content, messages);
      setMessages([...newHistory, { role: "assistant", content: res.response }]);
    } catch (err) {
      setError(err.message || "Failed to get response.");
      setMessages([...newHistory, { role: "system", content: "Error: Could not reach the AI. Ensure your Gemini API Key is configured." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">AI Data Assistant</h2>
            <p className="text-xs text-gray-500">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Dataset context:</label>
          <select 
            className="rounded-lg border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 border"
            value={selected} 
            onChange={e => setSelected(e.target.value)}
          >
            {datasets.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
          </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ask anything about your data</h3>
            <p className="text-gray-500 text-sm mb-6">
              The AI automatically has access to the structural schema, statistical distributions, and raw sample rows of the selected dataset.
            </p>
            <div className="flex flex-col gap-2 w-full">
              {["What are the main anomalies in the data?", "Summarize the sales column distributions.", "Are there any correlations I should investigate?"].map(suggestion => (
                <button 
                  key={suggestion} 
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-gray-800 text-white" : 
              msg.role === "system" ? "bg-red-100 text-red-600" : 
              "bg-blue-600 text-white"
            }`}>
              {msg.role === "user" ? <User size={16} /> : msg.role === "system" ? <AlertCircle size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-gray-800 text-white rounded-tr-none" : 
              msg.role === "system" ? "bg-red-50 text-red-700 border border-red-100 rounded-tl-none" :
              "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none prose prose-sm prose-blue"
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {error && <div className="mb-3 text-xs text-red-600 font-medium px-2 flex items-center gap-1"><AlertCircle size={12}/> {error}</div>}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !selected}
            placeholder="Ask about your data..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-4 pr-12 py-4 shadow-sm"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim() || !selected}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} className={input.trim() ? "translate-x-[1px]" : ""} />
          </button>
        </form>
      </div>

    </div>
  );
}
