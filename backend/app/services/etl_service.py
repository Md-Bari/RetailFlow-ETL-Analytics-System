import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from ..models import CleanSale, ETLLog, FailedRecord, RawSale
from .validation_service import REQUIRED_COLUMNS, TEXT_COLUMNS, clean_text, missing_columns, validate_row


def _json_safe(row: dict) -> dict:
    """Convert Pandas/numpy values into values PostgreSQL JSON accepts."""
    cleaned = {}
    for key, value in row.items():
        if pd.isna(value):
            cleaned[key] = None
        elif hasattr(value, "item"):
            cleaned[key] = value.item()
        else:
            cleaned[key] = value
    return json.loads(json.dumps(cleaned, default=str, allow_nan=False))


def run_etl(file_path: Path, original_filename: str, db: Session) -> dict:
    started = datetime.now(timezone.utc)
    log = ETLLog(filename=original_filename, status="Processing", start_time=started)
    db.add(log)
    db.commit()
    db.refresh(log)

    try:
        frame = pd.read_csv(file_path)
        frame.columns = [str(column).strip().lower() for column in frame.columns]
        log.total_rows = len(frame)
        absent = missing_columns(frame.columns)
        if absent:
            raise ValueError(f"CSV is missing required columns: {', '.join(absent)}")

        raw_rows = frame.where(pd.notna(frame), None).to_dict(orient="records")
        for index, raw in enumerate(raw_rows, start=2):
            db.add(RawSale(filename=original_filename, row_number=index, raw_data=_json_safe(raw)))

        working = frame.copy()
        for column in TEXT_COLUMNS:
            working[column] = working[column].map(clean_text)
        working["parsed_order_date"] = pd.to_datetime(working["order_date"], errors="coerce")
        working["quantity"] = pd.to_numeric(working["quantity"], errors="coerce")
        working["unit_price"] = pd.to_numeric(working["unit_price"], errors="coerce")
        working["discount"] = pd.to_numeric(working["discount"], errors="coerce").fillna(0).clip(lower=0)
        working["status"] = working["status"].str.title()
        working["payment_method"] = working["payment_method"].str.replace(r"[_-]+", " ", regex=True).str.title()
        duplicates = working["order_id"].duplicated(keep="first")

        valid_count = 0
        failed_count = 0
        for position, (_, row) in enumerate(working.iterrows()):
            reasons = validate_row(row, bool(duplicates.iloc[position]))
            original = _json_safe(raw_rows[position])
            if reasons:
                failed_count += 1
                db.add(FailedRecord(original_data=original, reason="; ".join(reasons), uploaded_filename=original_filename))
                continue

            order_date = row["parsed_order_date"].date()
            revenue = max(float(row["quantity"]) * float(row["unit_price"]) - float(row["discount"]), 0)
            db.add(CleanSale(
                order_id=row["order_id"], order_date=order_date,
                customer_name=row["customer_name"] or "Unknown", customer_email=row["customer_email"].lower(),
                product=row["product"], category=row["category"] or "Uncategorized",
                quantity=int(row["quantity"]), unit_price=float(row["unit_price"]), discount=float(row["discount"]),
                payment_method=row["payment_method"] or "Unknown", city=row["city"] or "Unknown",
                status=row["status"] or "Unknown", revenue=round(revenue, 2), month=order_date.month, year=order_date.year,
                customer_key=hashlib.sha256(row["customer_email"].lower().encode()).hexdigest()[:24],
                product_key=hashlib.sha256(row["product"].lower().encode()).hexdigest()[:24], source_filename=original_filename,
            ))
            valid_count += 1

        log.valid_rows = valid_count
        log.failed_rows = failed_count
        log.status = "Completed"
        log.end_time = datetime.now(timezone.utc)
        db.commit()
        return {"log_id": log.id, "filename": original_filename, "total_rows": len(frame), "valid_rows": valid_count, "failed_rows": failed_count, "status": "Completed"}
    except Exception as exc:
        db.rollback()
        saved_log = db.get(ETLLog, log.id)
        if saved_log:
            saved_log.status = "Failed"
            saved_log.error_message = str(exc)
            saved_log.end_time = datetime.now(timezone.utc)
            db.commit()
        raise
