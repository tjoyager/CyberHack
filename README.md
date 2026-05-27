# CyberHack 2026: Sima Arome ERP Lite

Expert Enterprise ERP Lite system for Sima Arome (Natural Extracts, F&B, and Cosmetics Industry).

## Database Schema (ERD)

```mermaid
erDiagram
    %% Relationships
    materials ||--o{ lots : "defines"
    suppliers ||--o{ lots : "supplies"
    users ||--o{ audit_logs : "creates log (changed_by)"
    lots ||--o{ audit_logs : "tracked via entity_id"

    users {
        UUID id PK
        VARCHAR username "UNIQUE"
        TEXT password_hash
        ENUM role "SUPER_ADMIN, INTAKE_STAFF, QC_INSPECTOR, PPIC_MANAGER"
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    suppliers {
        SERIAL id PK
        VARCHAR name
        VARCHAR contact_email
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    materials {
        SERIAL id PK
        VARCHAR sku "UNIQUE"
        VARCHAR name
        VARCHAR uom "DEFAULT 'KG'"
        VARCHAR storage_condition
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    lots {
        UUID id PK
        VARCHAR lot_number "UNIQUE"
        INTEGER material_id FK
        INTEGER supplier_id FK
        DECIMAL initial_quantity
        DECIMAL remaining_quantity
        ENUM status "PENDING_QC, APPROVED, REJECTED, IN_PRODUCTION, CONSUMED, EXPIRED"
        VARCHAR warehouse_slot
        DATE expiry_date
        DATE manufactured_date
        TEXT qc_notes
        JSONB qc_metrics
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    audit_logs {
        SERIAL id PK
        VARCHAR entity_name
        UUID entity_id
        UUID changed_by FK
        VARCHAR action "INSERT, UPDATE"
        JSONB old_value
        JSONB new_value
        TIMESTAMP timestamp
    }
```

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** Next.js (React) + Tailwind CSS
- **Database:** PostgreSQL
- **Deployment:** BuildPad / AWS / Vercel
