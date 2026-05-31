import json
from uuid import UUID
from decimal import Decimal
from sqlalchemy import event
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import get_history
from app.models.models import Lot, AuditLog

from datetime import datetime
def sanitize_for_json(val):
    if isinstance(val, UUID):
        return str(val)
    if isinstance(val, Decimal):
        return str(val)
    if isinstance(val, datetime):
        return val.isoformat()
    if hasattr(val, 'value'):
        return val.value
    return val

@event.listens_for(Session, "before_flush")
def receive_before_flush(session, flush_context, instances):
    """
    Listen for inserts and updates to Lot and automatically create an AuditLog entry.
    """
    audit_logs = []

    for target in session.new:
        if isinstance(target, Lot):
            if not target.id:
                import uuid
                target.id = uuid.uuid4()
                
            new_value = {}
            for attr in target.__mapper__.column_attrs:
                val = getattr(target, attr.key)
                if val is not None:
                    new_value[attr.key] = sanitize_for_json(val)

            changed_by = getattr(target, '_current_user_id', target.created_by)
            # Ensure entity_id is available if generated client-side. If DB-generated, it might be None here.
            # Our IDs are UUIDs generated client-side or defaults.
            audit_logs.append(AuditLog(
                entity_name="lots",
                entity_id=target.id,
                changed_by=changed_by,
                action="CREATE",
                old_value=None,
                new_value=new_value,
            ))

    for target in session.dirty:
        if isinstance(target, Lot) and session.is_modified(target):
            old_value = {}
            new_value = {}
            
            for attr in target.__mapper__.column_attrs:
                history = get_history(target, attr.key)
                if history.has_changes():
                    old = history.deleted[0] if history.deleted else None
                    new = history.added[0] if history.added else None
                    old_value[attr.key] = sanitize_for_json(old)
                    new_value[attr.key] = sanitize_for_json(new)

            if not new_value:
                continue

            changed_by = getattr(target, '_current_user_id', target.created_by)

            action = "UPDATE"
            if "status" in new_value:
                action = f"STATUS_UPDATE_{new_value['status']}"
            elif "warehouse_slot" in new_value:
                action = "SLOT_ASSIGNED"

            audit_logs.append(AuditLog(
                entity_name="lots",
                entity_id=target.id,
                changed_by=changed_by,
                action=action,
                old_value=old_value,
                new_value=new_value,
            ))

    if audit_logs:
        session.add_all(audit_logs)
