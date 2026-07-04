import re

import pandas as pd

REQUIRED_COLUMNS = [
    "order_id", "order_date", "customer_name", "customer_email", "product",
    "category", "quantity", "unit_price", "discount", "payment_method", "city", "status",
]
TEXT_COLUMNS = [
    "order_id", "customer_name", "customer_email", "product", "category",
    "payment_method", "city", "status",
]
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def missing_columns(columns) -> list[str]:
    return [column for column in REQUIRED_COLUMNS if column not in columns]


def clean_text(value) -> str:
    return "" if pd.isna(value) else str(value).strip()


def validate_row(row: pd.Series, duplicate: bool) -> list[str]:
    reasons: list[str] = []
    if duplicate:
        reasons.append("Duplicate order_id")
    if not row["order_id"]:
        reasons.append("Missing order_id")
    if pd.isna(row["parsed_order_date"]):
        reasons.append("Invalid order_date")
    if not row["customer_email"]:
        reasons.append("Missing customer_email")
    elif not EMAIL_PATTERN.match(row["customer_email"]):
        reasons.append("Invalid customer_email")
    if pd.isna(row["quantity"]):
        reasons.append("Missing or invalid quantity")
    elif row["quantity"] <= 0:
        reasons.append("Quantity must be greater than zero")
    elif float(row["quantity"]) % 1:
        reasons.append("Quantity must be a whole number")
    if pd.isna(row["unit_price"]):
        reasons.append("Missing or invalid unit_price")
    elif row["unit_price"] <= 0:
        reasons.append("Unit price must be greater than zero")
    if not row["product"]:
        reasons.append("Missing product")
    return reasons
