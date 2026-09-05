import numpy as np
import pandas as pd
from typing import Dict, Any

def generate_advanced_eda(df: pd.DataFrame) -> Dict[str, Any]:
    stats = []
    
    for col in df.columns:
        series = df[col]
        non_null = series.dropna()
        n_missing = int(series.isna().sum())
        n_total = len(series)
        missing_pct = (n_missing / n_total * 100) if n_total > 0 else 0
        n_unique = int(series.nunique())
        
        dtype = str(series.dtype)
        col_stat = {
            "name": col,
            "type": dtype,
            "total": n_total,
            "missing": n_missing,
            "missing_pct": round(missing_pct, 2),
            "unique": n_unique,
            "memory_usage": int(series.memory_usage(deep=True))
        }
        
        if pd.api.types.is_numeric_dtype(series):
            if not non_null.empty:
                q1 = float(non_null.quantile(0.25))
                q3 = float(non_null.quantile(0.75))
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = int(((non_null < lower_bound) | (non_null > upper_bound)).sum())
                
                col_stat.update({
                    "min": float(non_null.min()),
                    "max": float(non_null.max()),
                    "mean": float(non_null.mean()),
                    "median": float(non_null.median()),
                    "std": float(non_null.std()) if len(non_null) > 1 else 0.0,
                    "skewness": float(non_null.skew()) if len(non_null) > 2 else 0.0,
                    "kurtosis": float(non_null.kurt()) if len(non_null) > 3 else 0.0,
                    "outliers": outliers,
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound
                })
        else:
            if not non_null.empty:
                top_vals = non_null.value_counts().head(5).to_dict()
                col_stat.update({
                    "top_values": {str(k): int(v) for k, v in top_vals.items()}
                })
                
        stats.append(col_stat)
        
    return {"columns": stats, "total_rows": len(df), "total_cols": len(df.columns)}

def apply_preprocessing(df: pd.DataFrame, config: Dict[str, Any]) -> pd.DataFrame:
    df_clean = df.copy()
    
    # Missing Value Handling
    missing_strategy = config.get("missing_strategy", "keep")
    if missing_strategy == "drop":
        df_clean = df_clean.dropna()
    elif missing_strategy == "mean":
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            df_clean[col] = df_clean[col].fillna(df_clean[col].mean())
    elif missing_strategy == "median":
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
            
    # Outlier Handling (only on numeric)
    outlier_strategy = config.get("outlier_strategy", "keep")
    if outlier_strategy in ["clip", "drop"]:
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            series = df_clean[col].dropna()
            if len(series) > 0:
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                lb = q1 - 1.5 * iqr
                ub = q3 + 1.5 * iqr
                
                if outlier_strategy == "clip":
                    df_clean[col] = df_clean[col].clip(lower=lb, upper=ub)
                elif outlier_strategy == "drop":
                    df_clean = df_clean[(df_clean[col] >= lb) & (df_clean[col] <= ub) | df_clean[col].isna()]
                    
    # Deduplication
    if config.get("deduplicate", False):
        df_clean = df_clean.drop_duplicates()
        
    # Drop columns
    cols_to_drop = config.get("drop_columns", [])
    if cols_to_drop:
        df_clean = df_clean.drop(columns=[c for c in cols_to_drop if c in df_clean.columns])
        
    return df_clean
