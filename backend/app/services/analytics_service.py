from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from ..models import CleanSale


def summary(db: Session) -> dict:
    total_revenue, total_orders, total_customers = db.query(
        func.coalesce(func.sum(CleanSale.revenue), 0),
        func.count(distinct(CleanSale.order_id)),
        func.count(distinct(CleanSale.customer_key)),
    ).one()
    completed = db.query(func.count(distinct(CleanSale.order_id))).filter(func.lower(CleanSale.status) == "completed").scalar() or 0
    pending = db.query(func.count(distinct(CleanSale.order_id))).filter(func.lower(CleanSale.status) == "pending").scalar() or 0
    return {
        "total_revenue": round(float(total_revenue), 2), "total_orders": total_orders,
        "total_customers": total_customers,
        "average_order_value": round(float(total_revenue) / total_orders, 2) if total_orders else 0,
        "completed_orders": completed, "pending_orders": pending,
    }


def grouped_sales(db: Session, field, label: str, limit: int | None = None):
    query = db.query(field.label(label), func.sum(CleanSale.revenue).label("revenue")).group_by(field).order_by(func.sum(CleanSale.revenue).desc())
    if limit:
        query = query.limit(limit)
    return [{label: row[0], "revenue": round(float(row[1]), 2)} for row in query.all()]
