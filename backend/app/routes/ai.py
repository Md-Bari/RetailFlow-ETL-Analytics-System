from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import Dataset
from ..services.gemini_service import generate_insights, _get_api_key

router = APIRouter(tags=["AI Insights"])

class InsightsRequest(BaseModel):
    prompt: Optional[str] = None

@router.get("/status")
def ai_status():
    has_key = bool(_get_api_key(None))
    return {"configured": has_key}

@router.post("/datasets/{dataset_id}/insights")
async def get_dataset_insights(
    dataset_id: int, 
    request_data: InsightsRequest,
    db: Session = Depends(get_db),
    x_gemini_api_key: Optional[str] = Header(None)
):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    dataset_summary = {
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "missing_cells": dataset.missing_cells,
        "duplicate_rows": dataset.duplicate_rows
    }
    
    columns_meta = dataset.profile.get("columns", [])
    insights_meta = dataset.profile.get("insights", [])
    
    try:
        ai_response = await generate_insights(
            dataset_summary, 
            columns_meta, 
            insights_meta, 
            request_data.prompt, 
            x_gemini_api_key
        )
        return {"insights": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
