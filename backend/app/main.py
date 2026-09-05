import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import datasets, etl_logs, upload, ai, eda, reports, chat
from .utils.logger import configure_logging

configure_logging()
app = FastAPI(title="RetailFlow ETL Analytics API", version="2.0.0", description="Profile and analyze arbitrary CSV datasets without a predefined schema.")

origins = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "service": "retailflow-api"}


app.include_router(upload.router, prefix="/api")
app.include_router(etl_logs.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(eda.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
