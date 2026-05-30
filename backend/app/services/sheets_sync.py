"""
Google Sheets Integration Service — Bidirectional Sync.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.models import Lot, Supplier, QCCheck, DeliveryOrder, SheetsSyncLog

# Mock Google Sheets API client (in real apps, use google-api-python-client)
class MockSheetsClient:
    async def append_row(self, spreadsheet_id: str, range_name: str, values: list[Any]):
        logging.info(f"[SHEETS PUSH] Tab: {range_name}, Values: {values}")
    
    async def get_rows(self, spreadsheet_id: str, range_name: str) -> list[list[Any]]:
        logging.info(f"[SHEETS PULL] Tab: {range_name}")
        return []

sheets_client = MockSheetsClient()

def format_wib(dt: datetime) -> str:
    """Format datetime as 'Day, DD MMM YYYY HH:mm:ss WIB'."""
    # Assuming the server is in UTC, we'd add +7 for WIB
    # For demo purposes, we just format the string.
    return dt.strftime("%A, %d %b %Y %H:%M:%S WIB")

async def push_to_sheets(tab_name: str, data: dict[str, Any]) -> None:
    """
    Pushes a single row to Google Sheets.
    Called as a BackgroundTask from endpoints.
    """
    try:
        # Map tab name to column order
        values = []
        if tab_name == "Warehouse":
            # lot_number, material, supplier, quantity, storage, status, filled_at
            values = [
                data.get("lot_number"),
                data.get("material_name"),
                data.get("supplier_name"),
                data.get("quantity_kg"),
                data.get("storage_condition"),
                data.get("status"),
                format_wib(datetime.now(timezone.utc))
            ]
        elif tab_name == "QC":
            # lot_number, material, quantity, temp, humidity, visual, smell, variance, result, notes, filled_at
            values = [
                data.get("lot_number"),
                data.get("material_name"),
                data.get("quantity_kg"),
                data.get("temperature_c"),
                data.get("humidity_pct"),
                data.get("visual_check"),
                data.get("smell_check"),
                data.get("weight_variance_pct"),
                data.get("result"),
                data.get("qc_notes"),
                format_wib(datetime.now(timezone.utc))
            ]
        
        if values:
            await sheets_client.append_row(
                settings.GOOGLE_SHEETS_SPREADSHEET_ID,
                tab_name,
                values
            )
    except Exception as e:
        logging.error(f"Failed to push to sheets: {e}")

async def sync_all_to_sheets(db: AsyncSession) -> None:
    """
    Periodic task to sync recent changes to sheets.
    """
    # Implementation for full sync would go here
    pass
