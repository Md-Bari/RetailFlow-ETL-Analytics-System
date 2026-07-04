import re
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.etl_service import run_etl

router = APIRouter(tags=["ETL upload"])
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", Path(file.filename).name)
    stored_path = UPLOAD_DIR / f"{uuid4().hex}_{safe_name}"
    try:
        size = 0
        async with aiofiles.open(stored_path, "wb") as destination:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise ValueError("The CSV exceeds the 25 MB upload limit.")
                await destination.write(chunk)
        result = run_etl(stored_path, safe_name, db)
        return {"message": "CSV processed successfully.", "result": result}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"ETL processing failed: {exc}") from exc
    finally:
        await file.close()
