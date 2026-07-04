# RetailFlow ETL Analytics System

RetailFlow is a domain-agnostic CSV profiling and analytics application. Upload a well-formed CSV from any subject area; the FastAPI/Pandas pipeline preserves its rows, infers column types, measures data quality, and generates only the statistical insights supported by that dataset. Results are stored in PostgreSQL and presented through a responsive Next.js dashboard.

This project demonstrates practical data engineering skills including data ingestion, schema inference, ETL pipeline design, data quality measurement, database loading, API development, and adaptive analytics.

## Features

- Accepts arbitrary CSV schemas—no required business columns
- Detects numeric, datetime, categorical, boolean, text, and empty columns
- Measures missing cells, exact duplicate rows, uniqueness, and completeness
- Produces numeric summaries and histograms
- Produces categorical frequency charts
- Builds monthly trends when a date column is present
- Calculates strongest Pearson correlations when multiple numeric fields exist
- Preserves every source row as JSON in PostgreSQL
- Stores reusable profiles, 50-row previews, and ETL run history
- Supports UTF-8, UTF-8 with BOM, and Latin-1 CSV input up to 25 MB

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, React, Tailwind CSS, Recharts |
| API | FastAPI, Pydantic, SQLAlchemy |
| ETL/profile engine | Python, Pandas, NumPy |
| Database | PostgreSQL 16 |
| Runtime | Docker, Docker Compose |

## Adaptive workflow

1. **Extract:** save the original upload and parse its delimiter and common encoding.
2. **Profile:** infer each column’s semantic data type from its populated values.
3. **Measure:** calculate completeness, duplicates, uniqueness, ranges, distributions, frequencies, trends, and correlations where applicable.
4. **Load:** store dataset metadata, the computed profile, a preview, every raw row, and an ETL audit log in PostgreSQL.
5. **Visualize:** select any uploaded dataset and render only compatible charts and observations.

RetailFlow does not assign domain meaning that is absent from the file. For example, it will summarize a numeric `temperature_c` field but will not label it as revenue; it will chart a `station` category but will not assume it represents a customer.

## Database schema

- `datasets`: source filename, shape, quality counts, complete JSON profile, preview, and timestamp
- `dataset_rows`: dataset reference, source row number, and complete row JSON
- `etl_logs`: filename, processed counts, status, start/end times, and fatal errors

Legacy tables from an earlier retail-specific version may remain in an existing Docker volume, but the current API and interface do not use them. A new installation creates only the active models.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | API health |
| `POST` | `/api/upload` | Upload and profile any CSV |
| `GET` | `/api/datasets` | List uploaded datasets |
| `GET` | `/api/datasets/{id}/profile` | Dataset metadata, profile, and preview |
| `GET` | `/api/logs` | ETL run history |

Interactive documentation: <http://localhost:8000/docs>

## Run with Docker

Start Docker Desktop, then run from the project root:

```powershell
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
Copy-Item .env.example .env -ErrorAction SilentlyContinue
docker compose up --build -d
```

Open:

- Frontend: <http://localhost:3000>
- FastAPI documentation: <http://localhost:8000/docs>
- PostgreSQL: `localhost:5432`

Check the services:

```powershell
docker compose ps
```

Stop them with `docker compose down`. Add `-v` only when you intentionally want to erase PostgreSQL and uploaded-file volumes.

## Run locally without Docker

Use Python 3.12 and a running PostgreSQL database named `retailflow`.

```powershell
$env:DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/retailflow"
$env:BACKEND_CORS_ORIGINS="http://localhost:3000"
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In another terminal:

```powershell
cd frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm install
npm run dev
```

## Sample data

- `sample_data/retail_sales_sample.csv`: retail-shaped data with mixed casing and missing values
- `sample_data/weather_observations.csv`: unrelated sensor/weather data with dates, numbers, categories, booleans, and one missing value

Both files are processed by the same generic pipeline without configuration or column mapping.

## Screenshots

Recommended portfolio captures:

- Arbitrary CSV upload result
- Adaptive dataset dashboard
- Column inventory and correlations
- Data-quality workspace
- ETL run history

## Future improvements

- Alembic migrations and legacy-table cleanup migration
- Background jobs and chunked profiling for larger datasets
- User-selected aggregation and chart builders
- Configurable parsing options for unusual delimiters and header rows
- XLSX and Parquet ingestion
- Authentication, tenant isolation, exports, and API pagination
