from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ETLLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    total_rows: int
    valid_rows: int
    failed_rows: int
    status: str
    start_time: datetime
    end_time: datetime | None
    error_message: str | None


class FailedRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    original_data: dict[str, Any]
    reason: str
    uploaded_filename: str
    created_at: datetime
