from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pydantic import BaseModel
import pandas as pd

from ..database import get_db
from ..models import Dataset
from ..services.report_service import generate_trend_data, generate_forecast_data
from ..services.gemini_service import generate_full_report
from ..services.eda_service import generate_advanced_eda
from .eda import load_dataset_df

router = APIRouter(tags=["Reports"])

class ReportRequest(BaseModel):
    title: str
    objective: str
    audience: str
    target_metric: Optional[str] = None
    date_column: Optional[str] = None
    forecast_horizon: int = 3
    sections: list[str] = []
    custom_instructions: Optional[str] = None

@router.post("/datasets/{dataset_id}/reports/generate")
async def generate_report(
    dataset_id: int, 
    request: ReportRequest, 
    db: Session = Depends(get_db),
    x_gemini_api_key: Optional[str] = Header(None)
):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = load_dataset_df(dataset, db)
    
    trend_data = {}
    forecast_data = []
    
    if request.date_column and request.date_column in df.columns:
        trend_data = generate_trend_data(df, request.date_column, request.target_metric)
        if trend_data.get("points"):
            forecast_data = generate_forecast_data(trend_data["points"], request.forecast_horizon)
            
    eda_stats = generate_advanced_eda(df)
    
    config = request.model_dump()
    dataset_meta = {
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count
    }
    
    report_md = await generate_full_report(
        config,
        dataset_meta,
        trend_data,
        {"forecast": forecast_data} if forecast_data else {},
        eda_stats,
        x_gemini_api_key
    )
    
    return {
        "report": report_md,
        "trend_data": trend_data,
        "forecast_data": forecast_data
    }
