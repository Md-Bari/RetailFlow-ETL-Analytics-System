from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FailedRecord
from ..schemas import FailedRecordOut

router = APIRouter(tags=["Failed records"])


@router.get("/failed-records", response_model=list[FailedRecordOut])
def get_failed_records(limit: int = Query(250, ge=1, le=1000), db: Session = Depends(get_db)):
    return db.query(FailedRecord).order_by(FailedRecord.created_at.desc()).limit(limit).all()
