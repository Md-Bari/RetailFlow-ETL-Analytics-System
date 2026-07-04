from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ETLLog
from ..schemas import ETLLogOut

router = APIRouter(tags=["ETL logs"])


@router.get("/logs", response_model=list[ETLLogOut])
def get_logs(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    return db.query(ETLLog).order_by(ETLLog.start_time.desc()).limit(limit).all()
