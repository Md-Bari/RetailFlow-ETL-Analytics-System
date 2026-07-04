import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ..models import Dataset, DatasetRow, ETLLog


def _json_value(value):
    if value is None or (not isinstance(value, (list, dict)) and pd.isna(value)):
        return None
    if hasattr(value, "item"):
        value = value.item()
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.isoformat()
    return value


def _json_safe(row: dict) -> dict:
    cleaned = {str(key): _json_value(value) for key, value in row.items()}
    return json.loads(json.dumps(cleaned, default=str, allow_nan=False))


def _read_csv(file_path: Path) -> pd.DataFrame:
    """Read common CSV encodings and let Pandas infer the delimiter."""
    last_error = None
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return pd.read_csv(file_path, sep=None, engine="python", encoding=encoding)
        except UnicodeDecodeError as exc:
            last_error = exc
        except pd.errors.ParserError as exc:
            raise ValueError(f"The CSV structure could not be parsed: {exc}") from exc
    raise ValueError(f"The CSV encoding could not be read: {last_error}")


def _infer_series(series: pd.Series, name: str) -> tuple[str, pd.Series]:
    non_empty = series.dropna()
    if non_empty.empty:
        return "empty", series

    text = non_empty.astype(str).str.strip()
    lowered = text.str.lower()
    boolean_values = {"true", "false", "yes", "no", "y", "n", "0", "1"}
    if set(lowered.unique()).issubset(boolean_values) and len(lowered.unique()) <= 2:
        return "boolean", series

    numeric = pd.to_numeric(text.str.replace(",", "", regex=False), errors="coerce")
    if numeric.notna().mean() >= 0.9:
        converted = pd.to_numeric(series.astype(str).str.replace(",", "", regex=False), errors="coerce")
        return "numeric", converted

    date_hint = any(token in name.lower() for token in ("date", "time", "year", "month", "created", "updated"))
    parsed_dates = pd.to_datetime(text, errors="coerce")
    if parsed_dates.notna().mean() >= (0.65 if date_hint else 0.9):
        return "datetime", pd.to_datetime(series, errors="coerce")

    unique = non_empty.nunique(dropna=True)
    if unique <= min(50, max(10, len(series) * 0.2)):
        return "categorical", series
    return "text", series


def _numeric_profile(name: str, series: pd.Series) -> dict:
    clean = series.dropna().astype(float)
    result = {
        "name": name, "type": "numeric", "count": int(clean.count()),
        "missing": int(series.isna().sum()), "unique": int(clean.nunique()),
    }
    if clean.empty:
        return result
    result["summary"] = {
        "min": round(float(clean.min()), 4), "max": round(float(clean.max()), 4),
        "mean": round(float(clean.mean()), 4), "median": round(float(clean.median()), 4),
        "sum": round(float(clean.sum()), 4), "std": round(float(clean.std(ddof=0)), 4),
    }
    counts, edges = np.histogram(clean, bins=min(10, max(1, int(np.sqrt(len(clean))))))
    result["distribution"] = [
        {"range": f"{edges[i]:.2f}–{edges[i + 1]:.2f}", "count": int(counts[i])}
        for i in range(len(counts))
    ]
    return result


def _category_profile(name: str, series: pd.Series, inferred_type: str) -> dict:
    clean = series.dropna().astype(str).str.strip()
    top = clean.value_counts().head(10)
    return {
        "name": name, "type": inferred_type, "count": int(clean.count()),
        "missing": int(series.isna().sum()), "unique": int(clean.nunique()),
        "top_values": [{"value": str(value), "count": int(count)} for value, count in top.items()],
    }


def _build_profile(frame: pd.DataFrame) -> dict:
    typed: dict[str, tuple[str, pd.Series]] = {}
    columns = []
    for name in frame.columns:
        inferred_type, converted = _infer_series(frame[name], name)
        typed[name] = (inferred_type, converted)
        if inferred_type == "numeric":
            columns.append(_numeric_profile(name, converted))
        elif inferred_type == "datetime":
            valid = converted.dropna()
            columns.append({
                "name": name, "type": "datetime", "count": int(valid.count()),
                "missing": int(converted.isna().sum()), "unique": int(valid.nunique()),
                "min": valid.min().isoformat() if not valid.empty else None,
                "max": valid.max().isoformat() if not valid.empty else None,
            })
        else:
            columns.append(_category_profile(name, frame[name], inferred_type))

    numeric_names = [name for name, (kind, _) in typed.items() if kind == "numeric"]
    date_names = [name for name, (kind, _) in typed.items() if kind == "datetime"]
    category_names = [name for name, (kind, _) in typed.items() if kind in ("categorical", "boolean")]

    correlations = []
    if len(numeric_names) >= 2:
        numeric_frame = pd.DataFrame({name: typed[name][1] for name in numeric_names})
        matrix = numeric_frame.corr(numeric_only=True)
        for left_index, left in enumerate(numeric_names):
            for right in numeric_names[left_index + 1:]:
                value = matrix.loc[left, right]
                if pd.notna(value):
                    correlations.append({"left": left, "right": right, "value": round(float(value), 3)})
        correlations.sort(key=lambda item: abs(item["value"]), reverse=True)
        correlations = correlations[:10]

    trend = None
    if date_names:
        date_name = date_names[0]
        value_name = numeric_names[0] if numeric_names else None
        trend_frame = pd.DataFrame({"date": typed[date_name][1]})
        trend_frame["period"] = trend_frame["date"].dt.to_period("M").astype(str)
        if value_name:
            trend_frame["value"] = typed[value_name][1]
            grouped = trend_frame.dropna().groupby("period")["value"].sum().tail(24)
            metric = f"Sum of {value_name}"
        else:
            grouped = trend_frame.dropna().groupby("period").size().tail(24)
            metric = "Row count"
        trend = {"date_column": date_name, "metric": metric, "points": [{"period": str(period), "value": round(float(value), 4)} for period, value in grouped.items()]}

    insights = []
    total_cells = max(1, frame.shape[0] * frame.shape[1])
    missing_cells = int(frame.isna().sum().sum())
    insights.append(f"{(1 - missing_cells / total_cells) * 100:.1f}% of all cells contain values.")
    duplicate_rows = int(frame.duplicated().sum())
    insights.append(f"{duplicate_rows} duplicate row{'s' if duplicate_rows != 1 else ''} detected.")
    if numeric_names:
        widest = max((item for item in columns if item["type"] == "numeric" and item.get("summary")), key=lambda item: item["summary"]["max"] - item["summary"]["min"], default=None)
        if widest:
            insights.append(f"{widest['name']} has the widest numeric range ({widest['summary']['min']:g} to {widest['summary']['max']:g}).")
    if correlations and abs(correlations[0]["value"]) >= 0.5:
        item = correlations[0]
        direction = "positive" if item["value"] > 0 else "negative"
        insights.append(f"{item['left']} and {item['right']} show the strongest {direction} correlation ({item['value']:.2f}).")
    if category_names:
        category = next(item for item in columns if item["name"] == category_names[0])
        if category.get("top_values"):
            top = category["top_values"][0]
            insights.append(f"{top['value']} is the most frequent {category['name']} value ({top['count']} rows).")

    return {
        "columns": columns, "numeric_columns": numeric_names, "datetime_columns": date_names,
        "categorical_columns": category_names, "correlations": correlations, "trend": trend,
        "insights": insights,
    }


def run_etl(file_path: Path, original_filename: str, db: Session) -> dict:
    started = datetime.now(timezone.utc)
    log = ETLLog(filename=original_filename, status="Processing", start_time=started)
    db.add(log)
    db.commit()
    db.refresh(log)

    try:
        frame = _read_csv(file_path)
        if frame.empty:
            raise ValueError("The CSV has headers but no data rows.")
        if frame.shape[1] < 1:
            raise ValueError("The CSV does not contain any columns.")
        frame.columns = [str(name).strip() or f"column_{index + 1}" for index, name in enumerate(frame.columns)]
        frame = frame.replace(r"^\s*$", np.nan, regex=True)
        profile = _build_profile(frame)
        raw_rows = frame.to_dict(orient="records")

        dataset = Dataset(
            filename=original_filename, stored_filename=file_path.name,
            row_count=len(frame), column_count=len(frame.columns),
            duplicate_rows=int(frame.duplicated().sum()), missing_cells=int(frame.isna().sum().sum()),
            profile=profile, preview=[_json_safe(row) for row in raw_rows[:50]],
        )
        db.add(dataset)
        db.flush()
        for index, raw in enumerate(raw_rows, start=2):
            db.add(DatasetRow(dataset_id=dataset.id, row_number=index, raw_data=_json_safe(raw)))

        log.total_rows = len(frame)
        log.valid_rows = len(frame)
        log.failed_rows = 0
        log.status = "Completed"
        log.end_time = datetime.now(timezone.utc)
        db.commit()
        return {
            "dataset_id": dataset.id, "log_id": log.id, "filename": original_filename,
            "total_rows": len(frame), "column_count": len(frame.columns),
            "missing_cells": dataset.missing_cells, "duplicate_rows": dataset.duplicate_rows,
            "status": "Completed",
        }
    except Exception as exc:
        db.rollback()
        saved_log = db.get(ETLLog, log.id)
        if saved_log:
            saved_log.status = "Failed"
            saved_log.error_message = str(exc)
            saved_log.end_time = datetime.now(timezone.utc)
            db.commit()
        raise
