# RetailFlow ETL Analytics System

RetailFlow is a production-style full-stack data engineering project. Users upload raw retail sales CSV files; a FastAPI and Pandas pipeline preserves the source rows, validates and transforms each record, loads results into PostgreSQL, and serves a responsive Next.js analytics dashboard.

This project demonstrates practical data engineering skills including data ingestion, ETL pipeline design, data validation, database loading, API development, and analytics dashboard creation.

## Features

- CSV upload with safe persisted filenames and streamed file writes
- Required-column and row-level validation with clear rejection reasons
- Raw, clean, failed, and run-log PostgreSQL tables
- Normalized status and payment methods, generated keys, date parts, and revenue
- Revenue, order, customer, and order-status KPIs
- Monthly, category, city, payment, and product visualizations
- ETL history and inspectable rejected-row JSON
- Responsive and accessible loading, error, empty, success, and mobile states
- Docker Compose development/portfolio environment

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router, React, Tailwind CSS, Recharts |
| API | FastAPI, Pydantic, SQLAlchemy |
| ETL | Python, Pandas |
| Database | PostgreSQL 16 |
| Runtime | Docker, Docker Compose |

## ETL process

1. **Extract:** the API accepts a `.csv`, stores it in `backend/uploads`, reads it with Pandas, and writes each source row to `raw_sales`.
2. **Validate:** the pipeline verifies all 12 required columns and checks each row for duplicates, dates, emails, integer quantities, positive quantities/prices, and product presence.
3. **Transform:** text is trimmed, status/payment values are standardized, blank discounts become zero, revenue is calculated, and month, year, customer key, and product key are created.
4. **Load:** valid records enter `clean_sales`; rejected records and reasons enter `failed_records`; run totals and state enter `etl_logs`.
5. **Analyze:** JSON endpoints aggregate the clean table for the dashboard.

The sample treats a repeated `order_id` after its first occurrence as a failed record. All valid uploads append data so multiple source files remain auditable.

## Database schema

- `raw_sales`: source filename, CSV row number, unmodified row JSON, timestamp
- `clean_sales`: typed source fields plus revenue, date parts, stable hashed keys, and source filename
- `failed_records`: original row JSON, one or more validation reasons, source filename, timestamp
- `etl_logs`: filename, row counts, status, start/end times, and fatal error details

Tables are created automatically when the API starts. For evolving production schemas, add Alembic migrations as a future improvement.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Service health |
| `POST` | `/api/upload` | Upload and process CSV |
| `GET` | `/api/dashboard/summary` | KPI summary |
| `GET` | `/api/dashboard/monthly-sales` | Monthly revenue |
| `GET` | `/api/dashboard/category-sales` | Category revenue |
| `GET` | `/api/dashboard/city-sales` | City revenue |
| `GET` | `/api/dashboard/payment-methods` | Orders by payment method |
| `GET` | `/api/dashboard/top-products` | Top eight products |
| `GET` | `/api/logs` | Recent ETL runs |
| `GET` | `/api/failed-records` | Recent rejected rows |

Interactive API documentation is available at `http://localhost:8000/docs`.

## Run with Docker (recommended)

Prerequisites: Docker Desktop with Docker Compose.

```bash
copy .env.example .env
docker compose up --build
```

Open:

- Frontend: <http://localhost:3000>
- FastAPI docs: <http://localhost:8000/docs>
- PostgreSQL: `localhost:5432`

Upload `sample_data/retail_sales_sample.csv` from the Upload page. It contains 55 rows: 50 clean examples and 5 intentional failures.

Stop the services with `docker compose down`. To also erase the database and uploaded-file volumes, use `docker compose down -v`.

## Run locally without Docker

Start PostgreSQL and create a database named `retailflow`. From the project root, configure a local connection:

```powershell
$env:DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/retailflow"
$env:BACKEND_CORS_ORIGINS="http://localhost:3000"
```

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

In a second terminal, frontend:

```powershell
cd frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm install
npm run dev
```

## Sample CSV format

Required header:

```csv
order_id,order_date,customer_name,customer_email,product,category,quantity,unit_price,discount,payment_method,city,status
RF-1001,2025-01-04,Amina Rahman,amina@example.com,Wireless Mouse,Electronics,2,24.99,0,card,Dhaka,completed
```

The bundled sample intentionally includes a missing email, negative quantity, missing price, duplicate order ID, invalid date, inconsistent casing, and blank discounts.

## Screenshots

Add final deployment captures here:

- Home and pipeline overview
- Upload result summary
- Sales analytics dashboard
- ETL history
- Failed-record inspection

## Future improvements

- Alembic database migrations
- Background job queue for large uploads
- Authentication and tenant-level data isolation
- Idempotency checks for repeated source files
- Configurable validation contracts and currencies
- CSV export, pagination, and dashboard date filters
- Automated unit, integration, and browser test suites in CI
