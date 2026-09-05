from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from pathlib import Path
from pydantic import BaseModel
import pandas as pd
from uuid import uuid4
import os

from ..database import get_db
from ..models import Dataset, DatasetRow
from ..services.eda_service import generate_advanced_eda, apply_preprocessing
from ..services.gemini_service import generate_eda_advice
from ..services.etl_service import _build_profile, _json_safe

router = APIRouter(tags=["EDA & Preprocessing"])
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"

class PreprocessRequest(BaseModel):
    config: Dict[str, Any]

def load_dataset_df(dataset: Dataset, db: Session) -> pd.DataFrame:
    file_path = UPLOAD_DIR / dataset.stored_filename
    if file_path.exists():
        for encoding in ("utf-8-sig", "utf-8", "latin-1"):
            try:
                return pd.read_csv(file_path, sep=None, engine="python", encoding=encoding)
            except Exception:
                continue
    
    # Fallback to DB
    rows = db.query(DatasetRow).filter(DatasetRow.dataset_id == dataset.id).order_by(DatasetRow.row_number).all()
    if not rows:
        raise HTTPException(status_code=404, detail="Dataset data not found")
    data = [row.raw_data for row in rows]
    return pd.DataFrame(data)

@router.get("/datasets/{dataset_id}/eda")
async def get_eda(dataset_id: int, db: Session = Depends(get_db), x_gemini_api_key: Optional[str] = Header(None)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = load_dataset_df(dataset, db)
    eda_stats = generate_advanced_eda(df)
    
    advice = await generate_eda_advice(eda_stats, x_gemini_api_key)
    return {"eda": eda_stats, "ai_advice": advice}

@router.post("/datasets/{dataset_id}/preprocess/preview")
def preview_preprocess(dataset_id: int, request: PreprocessRequest, db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = load_dataset_df(dataset, db)
    df_clean = apply_preprocessing(df, request.config)
    
    before_rows = len(df)
    after_rows = len(df_clean)
    before_nulls = int(df.isna().sum().sum())
    after_nulls = int(df_clean.isna().sum().sum())
    
    preview_data = df_clean.head(50).replace({pd.NA: None, float('nan'): None}).to_dict(orient="records")
    
    return {
        "stats": {
            "rows_before": before_rows,
            "rows_after": after_rows,
            "nulls_before": before_nulls,
            "nulls_after": after_nulls
        },
        "preview": preview_data
    }
