import json
from typing import Optional, List, Dict, Any
from .gemini_service import _call_gemini
import pandas as pd

async def generate_chat_response(
    dataset_meta: dict,
    profile_data: dict,
    sample_rows: pd.DataFrame,
    message: str,
    history: List[Dict[str, str]],
    api_key: Optional[str] = None
) -> str:
    """
    Implements a Hybrid Profile RAG. Instead of doing expensive row-by-row vector searches,
    we inject the schema, rich statistical profile, and a sample of rows to provide context
    for answering analytical questions.
    """
    system_prompt = """You are RetailFlow AI, an expert data analyst and business intelligence consultant.
Your purpose is to answer the user's questions based on the dataset they have uploaded.
You have been provided with the dataset's structural metadata, statistical profile (EDA), and a sample of rows.
Always refer to this context when answering. If the user asks for specific values that are not present in the profile or sample rows, explain that you are answering based on summary statistics and samples, and that a deep SQL query might be required for exact row-level details.

IMPORTANT: Format your response using clean HTML tags for rich display. Use <h4> for section headings, <ul>/<li> for bullet points, <strong> for emphasis, <table>/<tr>/<td>/<th> for tabular data, <p> for paragraphs, and <span style='color:#ef4444'> for warnings or <span style='color:#22c55e'> for positive highlights. Do NOT wrap in ```html code blocks. Output raw HTML directly."""

    # Format the history into a string
    history_text = ""
    for msg in history[-5:]:  # Keep last 5 messages for context length
        role = "User" if msg.get("role") == "user" else "AI"
        history_text += f"{role}: {msg.get('content')}\n"

    # Assemble RAG Context
    rag_context = f"""
Dataset Name: {dataset_meta.get('filename')}
Total Rows: {dataset_meta.get('row_count')}
Total Columns: {dataset_meta.get('column_count')}

--- Dataset Profile (Distributions, Anomalies, Types) ---
{json.dumps(profile_data, indent=2)[:4000]}  # Truncate slightly if very large to save tokens

--- Sample Data (Top 5 rows) ---
{sample_rows.head(5).to_csv(index=False)}
"""

    prompt = f"""
{rag_context}

--- Conversation History ---
{history_text}

User Question: {message}

Please provide a precise, helpful, and insightful response based on the dataset context above. Format using HTML tags.
"""
    
    return await _call_gemini(prompt, system_prompt, api_key)
