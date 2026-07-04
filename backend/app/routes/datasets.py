from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])


def _summary(dataset: Dataset) -> dict:
    return {
        "id": dataset.id, "filename": dataset.filename, "row_count": dataset.row_count,
        "column_count": dataset.column_count, "duplicate_rows": dataset.duplicate_rows,
        "missing_cells": dataset.missing_cells, "created_at": dataset.created_at,
    }


@router.get("")
def list_datasets(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).limit(limit).all()
    return [_summary(dataset) for dataset in datasets]


@router.get("/{dataset_id}/profile")
def dataset_profile(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {"dataset": _summary(dataset), "profile": dataset.profile, "preview": dataset.preview}
