"""
Analytics Service for pre-built SQL query runners.
"""

from typing import Any
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def get_monthly_intake(db: AsyncSession, month: int, year: int) -> list[dict[str, Any]]:
    query = text("""
        SELECT
            s.company_name AS supplier,
            COUNT(l.id) AS total_lots,
            SUM(l.quantity_kg) AS total_kg,
            TO_CHAR(l.created_at, 'Month YYYY') AS month
        FROM lots l
        JOIN suppliers s ON l.supplier_id = s.id
        WHERE EXTRACT(MONTH FROM l.created_at) = :month
          AND EXTRACT(YEAR  FROM l.created_at) = :year
        GROUP BY s.company_name, TO_CHAR(l.created_at, 'Month YYYY')
        ORDER BY total_kg DESC;
    """)
    result = await db.execute(query, {"month": month, "year": year})
    return [dict(row._mapping) for row in result]


async def get_qc_rejection_rate(db: AsyncSession, month: int) -> list[dict[str, Any]]:
    query = text("""
        SELECT 
            m.name AS material, 
            COUNT(l.id) AS total_lots, 
            ROUND(COALESCE(SUM(CASE WHEN l.status = 'REJECTED' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(l.id), 0), 0), 2) AS rejection_rate_pct 
        FROM lots l 
        JOIN materials m ON l.material_id = m.id 
        WHERE EXTRACT(MONTH FROM l.created_at) = :month 
        GROUP BY m.name
        ORDER BY rejection_rate_pct DESC;
    """)
    result = await db.execute(query, {"month": month})
    return [dict(row._mapping) for row in result]


async def get_lot_status_summary(db: AsyncSession) -> list[dict[str, Any]]:
    query = text("""
        SELECT status, COUNT(id) AS total_lots 
        FROM lots 
        GROUP BY status;
    """)
    result = await db.execute(query)
    return [dict(row._mapping) for row in result]


async def get_supplier_performance(db: AsyncSession) -> list[dict[str, Any]]:
    query = text("""
        SELECT 
            s.company_name AS supplier, 
            ROUND(COALESCE(AVG(qc.weight_variance_pct), 0), 2) AS avg_weight_variance, 
            SUM(CASE WHEN l.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejection_count 
        FROM lots l 
        JOIN suppliers s ON l.supplier_id = s.id 
        LEFT JOIN qc_checks qc ON qc.lot_id = l.id 
        GROUP BY s.company_name;
    """)
    result = await db.execute(query)
    return [dict(row._mapping) for row in result]


async def get_warehouse_utilization(db: AsyncSession) -> dict[str, Any]:
    query = text("""
        SELECT COUNT(DISTINCT warehouse_slot) AS occupied_slots 
        FROM lots 
        WHERE status = 'IN_PRODUCTION' AND warehouse_slot IS NOT NULL;
    """)
    result = await db.execute(query)
    row = result.fetchone()
    return {"occupied_slots": row[0] if row else 0}


async def get_delivery_lead_time(db: AsyncSession) -> list[dict[str, Any]]:
    query = text("""
        SELECT 
            m.name AS material, 
            ROUND(CAST(AVG(EXTRACT(EPOCH FROM (d.created_at - l.created_at))/86400) AS NUMERIC), 2) AS avg_lead_time_days 
        FROM delivery_orders d 
        JOIN lots l ON d.lot_id = l.id 
        JOIN materials m ON l.material_id = m.id 
        GROUP BY m.name;
    """)
    result = await db.execute(query)
    return [dict(row._mapping) for row in result]
