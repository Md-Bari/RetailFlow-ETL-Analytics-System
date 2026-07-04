from sqlalchemy import JSON, Column, Date, DateTime, Float, Integer, String, Text, func

from .database import Base


class RawSale(Base):
    __tablename__ = "raw_sales"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False, index=True)
    row_number = Column(Integer, nullable=False)
    raw_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CleanSale(Base):
    __tablename__ = "clean_sales"
    id = Column(Integer, primary_key=True)
    order_id = Column(String(100), nullable=False, index=True)
    order_date = Column(Date, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    product = Column(String(255), nullable=False)
    category = Column(String(120), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, nullable=False, default=0)
    payment_method = Column(String(80), nullable=False)
    city = Column(String(120), nullable=False)
    status = Column(String(50), nullable=False, index=True)
    revenue = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    customer_key = Column(String(64), nullable=False)
    product_key = Column(String(64), nullable=False)
    source_filename = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FailedRecord(Base):
    __tablename__ = "failed_records"
    id = Column(Integer, primary_key=True)
    original_data = Column(JSON, nullable=False)
    reason = Column(Text, nullable=False)
    uploaded_filename = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


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
