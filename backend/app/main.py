import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import dashboard, etl_logs, records, upload
from .utils.logger import configure_logging

configure_logging()
app = FastAPI(title="RetailFlow ETL Analytics API", version="1.0.0", description="Ingest, validate, transform, and analyze retail sales CSV files.")

origins = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "service": "retailflow-api"}


app.include_router(upload.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(etl_logs.router, prefix="/api")
app.include_router(records.router, prefix="/api")
