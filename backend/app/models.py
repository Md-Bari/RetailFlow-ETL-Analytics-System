from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text, func

from .database import Base


class ETLLog(Base):
    __tablename__ = "etl_logs"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    status = Column(String(30), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    error_message = Column(Text)


class Dataset(Base):
    """One uploaded CSV and its reusable, domain-agnostic profile."""
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False, index=True)
    stored_filename = Column(String(255), nullable=False)
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    duplicate_rows = Column(Integer, nullable=False, default=0)
    missing_cells = Column(Integer, nullable=False, default=0)
    profile = Column(JSON, nullable=False)
    preview = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class DatasetRow(Base):
    """Raw source rows retained without imposing a domain-specific schema."""
    __tablename__ = "dataset_rows"
    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    row_number = Column(Integer, nullable=False)
    raw_data = Column(JSON, nullable=False)
