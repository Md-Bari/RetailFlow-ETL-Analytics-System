from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CleanSale
from ..services.analytics_service import grouped_sales, summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    return summary(db)


@router.get("/monthly-sales")
def monthly_sales(db: Session = Depends(get_db)):
    rows = db.query(CleanSale.year, CleanSale.month, func.sum(CleanSale.revenue)).group_by(CleanSale.year, CleanSale.month).order_by(CleanSale.year, CleanSale.month).all()
    return [{"month": f"{year}-{month:02d}", "revenue": round(float(revenue), 2)} for year, month, revenue in rows]


@router.get("/category-sales")
def category_sales(db: Session = Depends(get_db)):
    return grouped_sales(db, CleanSale.category, "category")


@router.get("/city-sales")
def city_sales(db: Session = Depends(get_db)):
    return grouped_sales(db, CleanSale.city, "city")


@router.get("/payment-methods")
def payment_methods(db: Session = Depends(get_db)):
    rows = db.query(CleanSale.payment_method, func.count(distinct(CleanSale.order_id))).group_by(CleanSale.payment_method).all()
    return [{"payment_method": method, "orders": orders} for method, orders in rows]


@router.get("/top-products")
def top_products(db: Session = Depends(get_db)):
    return grouped_sales(db, CleanSale.product, "product", 8)
