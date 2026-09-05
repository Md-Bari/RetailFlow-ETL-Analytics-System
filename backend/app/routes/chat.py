from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from pydantic import BaseModel
import pandas as pd

from ..database import get_db
from ..models import Dataset
from ..services.chat_service import generate_chat_response
from .eda import load_dataset_df

router = APIRouter(tags=["AI Chat Assistant"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@router.post("/datasets/{dataset_id}/chat")
async def chat_with_dataset(
    dataset_id: int, 
    request: ChatRequest,
    db: Session = Depends(get_db),
    x_gemini_api_key: Optional[str] = Header(None)
):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        # Load sample data
        df = load_dataset_df(dataset, db)
        
        dataset_meta = {
            "filename": dataset.filename,
            "row_count": dataset.row_count,
            "column_count": dataset.column_count
        }
        
        # Profile is stored as JSON in DB from ETL process
        profile_data = dataset.profile if dataset.profile else {}
        
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        ai_response = await generate_chat_response(
            dataset_meta,
            profile_data,
            df,
            request.message,
            history_dicts,
            x_gemini_api_key
        )
        
        return {"response": ai_response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
