# Sima Arome ERP Lite: API Contracts (v1)

This document defines the interface between the Frontend and Backend. All responses use standard HTTP status codes.

---

## 1. INTAKE MODULE: Create New Lot
**Endpoint:** `POST /api/v1/lots`  
**Permission:** `INTAKE_STAFF`  
**Business Logic:** Automatically generates `lot_number` and sets status to `PENDING_QC`. Creates initial `audit_log`.

### Request Body
```json
{
  "material_id": 1,
  "supplier_id": 1,
  "initial_quantity": 50.5,
  "manufactured_date": "2026-05-20",
  "expiry_date": "2028-05-20"
}
```

### Success Response (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "lot_number": "LOT-20260527-001",
  "material_id": 1,
  "supplier_id": 1,
  "initial_quantity": 50.5,
  "remaining_quantity": 50.5,
  "status": "PENDING_QC",
  "expiry_date": "2028-05-20",
  "created_at": "2026-05-27T10:00:00Z"
}
```

### Error Response (400 Bad Request)
```json
{
  "detail": "Expiry date must be in the future."
}
```

---

## 2. QC MODULE: Inspection & Approval
**Endpoint:** `PATCH /api/v1/lots/{lot_id}/qc`  
**Permission:** `QC_INSPECTOR`  
**Business Logic:** Updates lot status. Captures lab metrics. Triggers immutable audit log.

### Request Body
```json
{
  "status": "APPROVED",
  "qc_notes": "Sample passed purity test. Color is within range.",
  "qc_metrics": {
    "purity": 98.5,
    "color_index": "A1",
    "moisture_content": 0.02
  }
}
```

### Success Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "lot_number": "LOT-20260527-001",
  "status": "APPROVED",
  "qc_notes": "Sample passed purity test. Color is within range.",
  "updated_at": "2026-05-27T11:30:00Z"
}
```

### Error Response (403 Forbidden)
```json
{
  "detail": "Only QC_INSPECTOR can perform this action."
}
```

---

## 3. PPIC MODULE: Warehouse & Production Routing
**Endpoint:** `PATCH /api/v1/lots/{lot_id}/ppic`  
**Permission:** `PPIC_MANAGER`  
**Business Logic:** Assigns physical storage and moves item to production queue. Only allowed for `APPROVED` lots.

### Request Body
```json
{
  "warehouse_slot": "ZONE-A-05",
  "status": "IN_PRODUCTION"
}
```

### Success Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "lot_number": "LOT-20260527-001",
  "warehouse_slot": "ZONE-A-05",
  "status": "IN_PRODUCTION",
  "updated_at": "2026-05-27T14:00:00Z"
}
```

### Error Response (422 Unprocessable Entity)
```json
{
  "detail": "Cannot route a lot that has not been APPROVED by QC."
}
```

---

## Standard Error Codes
- **401 Unauthorized:** Invalid or missing JWT token.
- **403 Forbidden:** Authenticated user lacks the required role.
- **404 Not Found:** `lot_id` does not exist in the database.
- **422 Unprocessable Entity:** Validation error (e.g., negative quantity).
