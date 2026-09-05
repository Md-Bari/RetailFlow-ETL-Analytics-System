import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

def generate_trend_data(df: pd.DataFrame, date_col: Optional[str] = None, metric_col: Optional[str] = None) -> Dict[str, Any]:
    if not date_col or date_col not in df.columns:
        return {}
    
    # Try to ensure date column is datetime
    try:
        df_trend = df.copy()
        df_trend[date_col] = pd.to_datetime(df_trend[date_col], errors='coerce')
        df_trend = df_trend.dropna(subset=[date_col])
    except Exception:
        return {}
        
    if df_trend.empty:
        return {}
        
    df_trend['period'] = df_trend[date_col].dt.to_period('M')
    
    if metric_col and metric_col in df_trend.columns and pd.api.types.is_numeric_dtype(df_trend[metric_col]):
        grouped = df_trend.groupby('period')[metric_col].sum()
        metric_name = f"Sum of {metric_col}"
    else:
        grouped = df_trend.groupby('period').size()
        metric_name = "Record Count"
        
    # Get last 24 periods for history
    grouped = grouped.tail(24)
    
    points = [{"period": str(p), "value": float(v)} for p, v in grouped.items()]
    return {
        "date_column": date_col,
        "metric": metric_name,
        "points": points
    }

def generate_forecast_data(trend_points: list, horizon: int = 3) -> list:
    if len(trend_points) < 4:
        return []
        
    values = [p["value"] for p in trend_points]
    periods = [p["period"] for p in trend_points]
    
    # Simple linear extrapolation
    x = np.arange(len(values))
    y = np.array(values)
    
    try:
        coef = np.polyfit(x, y, 1)
        poly1d_fn = np.poly1d(coef) 
        
        # calculate error to make confidence intervals
        y_pred = poly1d_fn(x)
        rmse = np.sqrt(np.mean((y - y_pred)**2))
        
        forecast = []
        last_period = pd.Period(periods[-1])
        for i in range(1, horizon + 1):
            next_p = last_period + i
            pred_x = len(values) - 1 + i
            pred_y = float(poly1d_fn(pred_x))
            
            # Prevent negative predictions if origin data is all positive
            if min(values) >= 0 and pred_y < 0:
                pred_y = 0.0
                
            forecast.append({
                "period": str(next_p),
                "predicted_value": round(pred_y, 2),
                "lower_bound": round(max(0.0 if min(values)>=0 else -float('inf'), pred_y - 1.96 * rmse), 2),
                "upper_bound": round(pred_y + 1.96 * rmse, 2)
            })
        return forecast
    except Exception:
        return []
