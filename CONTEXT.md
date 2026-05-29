# AI SYSTEM CONTEXT: CYBERHACK 2026 - SIMA AROME ERP LITE

**Project Deadline:** May 31, 2026, 23:59 WIB.
**Target Deployment:** BuildPad & AWS.
**Language Rule:** All codebase, variables, UI texts, and documentation MUST be in English. Indonesian is only allowed in UI-facing labels and placeholder copy where specified.

---

## 1. AI AGENT PERSONA & DIRECTIVES

You are an Expert Enterprise Software Architect and Senior Full-Stack Developer. You are assisting a team of 4 university students in a fast-paced "vibe coding" hackathon environment.

- **Primary Directive:** Prevent feature creep. Only generate code that directly solves Sima Arome's "double-input" problem and scores points in the "Enterprise Readiness" judging criteria.
- **Coding Style:** Modular, DRY (Don't Repeat Yourself), highly secure, and fully typed. Always include docstrings and error handling.
- **Anti-Hallucination Rule:** Never generate a file that conflicts with the repository structure shown in Section 11. Always check the existing file tree before creating new files.

---

## 2. TECH STACK SPECIFICATION

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.11+ with FastAPI (async) |
| **Database** | PostgreSQL 15+ (Strictly Relational) |
| **ORM** | SQLAlchemy 2.0 (async) with Alembic for migrations |
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **Authentication** | JWT (Access + Refresh tokens) + OTP via email/WhatsApp |
| **Password Hashing** | Argon2id (via `argon2-cffi` — strongest current standard) |
| **Email** | SendGrid or SMTP (configurable via `.env`) |
| **WhatsApp OTP** | Fonnte API or Twilio WhatsApp API (configurable via `.env`) |
| **Spreadsheet Sync** | Google Sheets API v4 (via `google-api-python-client`) |
| **Background Tasks** | FastAPI BackgroundTasks (lightweight) or Celery + Redis for heavy sync |
| **Containerization** | Docker + docker-compose |
| **Deployment** | BuildPad primary, AWS EC2/ECS fallback |

---

## 3. REPOSITORY STRUCTURE (SINGLE SOURCE OF TRUTH)

```
CyberHack/
├── .github/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Login, register, OTP verify, refresh token
│   │   │   │   ├── lots.py          # Lot lifecycle: intake → QC → PPIC
│   │   │   │   ├── materials.py     # Master data for raw materials
│   │   │   │   └── users.py         # User management (SUPER_ADMIN only)
│   │   │   └── api.py               # APIRouter aggregator
│   │   ├── core/
│   │   │   ├── config.py            # Settings from .env (pydantic-settings)
│   │   │   ├── db.py                # Async SQLAlchemy engine + session factory
│   │   │   └── security.py         # JWT, Argon2id, OTP generation/verification
│   │   ├── models/
│   │   │   └── models.py            # All SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py           # All Pydantic v2 request/response schemas
│   │   ├── services/
│   │   │   ├── sheets_sync.py       # Google Sheets ↔ PostgreSQL sync service
│   │   │   ├── otp_service.py       # OTP generation, send via email/WhatsApp
│   │   │   └── analytics.py         # Pre-built SQL query runners for dashboard
│   │   └── main.py                  # FastAPI app entrypoint
│   ├── scripts/
│   │   └── generate_dummy_data.py
│   ├── tests/
│   │   ├── test_auth.py
│   │   └── test_lots.py
│   ├── Dockerfile
│   └── requirements.txt
├── db/
│   ├── 01_init_schema.sql           # Full DDL with all tables and constraints
│   ├── 02_seed_data.sql             # Master data seeds (materials, admin user)
│   └── 03_enterprise_data.sql       # Demo data for judging presentation
├── frontend/
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   └── verify/page.tsx  # OTP verification page
│       │   ├── dashboard/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx         # Role selector landing
│       │   ├── role/
│       │   │   ├── supplier/page.tsx
│       │   │   ├── warehouse/page.tsx
│       │   │   ├── qc/page.tsx
│       │   │   ├── ppic/page.tsx
│       │   │   ├── lot-tracking/page.tsx
│       │   │   └── delivery/page.tsx
│       │   ├── admin/
│       │   │   └── page.tsx         # SUPER_ADMIN: audit logs, user management
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx             # Redirect to /login
│       ├── components/
│       │   ├── figma/
│       │   │   └── ImageWithFallback.tsx
│       │   ├── ui/                  # shadcn/ui components (DO NOT MODIFY)
│       │   └── Sidebar.tsx          # Role-aware navigation sidebar
│       ├── lib/
│       │   └── api.ts               # Axios instance with JWT interceptor + refresh logic
│       └── types/
│           └── index.ts             # Shared TypeScript interfaces
├── .env.example
├── .gitignore
├── API_CONTRACTS.md
├── CONTEXT.md                       # ← THIS FILE
├── DEMO_STRATEGY.md
├── docker-compose.yml
├── PITCH_DECK_DRAFT.md
├── PLAN.md
└── README.md
```

---

## 4. CORE DATABASE SCHEMA (NORMALIZED — NO DATA DUPLICATION)

### 4.1 Full Table Definitions

```sql
-- ENUM TYPES
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN', 'INTAKE_STAFF', 'QC_INSPECTOR',
  'PPIC_MANAGER', 'SUPPLIER', 'DELIVERY_STAFF'
);

CREATE TYPE lot_status AS ENUM (
  'PENDING_QC', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'DELIVERED'
);

CREATE TYPE otp_channel AS ENUM ('EMAIL', 'WHATSAPP');

-- USERS (RBAC)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        VARCHAR(50) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone_number    VARCHAR(20) UNIQUE,                     -- for WhatsApp OTP
  password_hash   TEXT NOT NULL,                          -- Argon2id hash
  role            user_role NOT NULL DEFAULT 'INTAKE_STAFF',
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,         -- email/WhatsApp verified
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ
);

-- OTP TOKENS
CREATE TABLE otp_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL,                          -- hashed OTP code
  channel         otp_channel NOT NULL DEFAULT 'EMAIL',
  purpose         VARCHAR(30) NOT NULL,                   -- 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET'
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MATERIALS (Master data)
CREATE TABLE materials (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  supplier_name       VARCHAR(255),
  storage_condition   VARCHAR(100),                       -- e.g. 'Cold-chain -20C', 'Standard'
  unit                VARCHAR(30),                        -- e.g. 'kg', 'liter', 'pcs'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUPPLIERS
CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    VARCHAR(255) NOT NULL,
  contact_person  VARCHAR(100),
  phone           VARCHAR(20),
  email           VARCHAR(255),
  address         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOTS (Core transactional entity — NEVER update without audit log)
CREATE TABLE lots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number      VARCHAR(30) UNIQUE NOT NULL,            -- e.g. LOT-20260528-001
  material_id     UUID NOT NULL REFERENCES materials(id),
  supplier_id     UUID REFERENCES suppliers(id),
  quantity_kg     NUMERIC(12, 3) NOT NULL,
  status          lot_status NOT NULL DEFAULT 'PENDING_QC',
  warehouse_slot  VARCHAR(50),                            -- e.g. 'RACK-A1-03'
  qc_notes        TEXT,
  rejection_reason TEXT,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- QC CHECKS (per lot)
CREATE TABLE qc_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id          UUID NOT NULL REFERENCES lots(id),
  inspector_id    UUID NOT NULL REFERENCES users(id),
  temperature_c   NUMERIC(5,2),
  humidity_pct    NUMERIC(5,2),
  visual_check    BOOLEAN,
  smell_check     BOOLEAN,
  weight_variance_pct NUMERIC(5,2),
  result          VARCHAR(10) NOT NULL,                   -- 'PASS' | 'FAIL'
  notes           TEXT,
  checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DELIVERY ORDERS
CREATE TABLE delivery_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id          UUID NOT NULL REFERENCES lots(id),
  driver_name     VARCHAR(100),
  vehicle_plate   VARCHAR(20),
  destination     VARCHAR(255),
  departure_at    TIMESTAMPTZ,
  arrived_at      TIMESTAMPTZ,
  status          VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED'
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SHEETS SYNC LOG (tracks Google Sheets sync state)
CREATE TABLE sheets_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_tab       VARCHAR(50) NOT NULL,                   -- 'supplier' | 'qc' | 'ppic' | etc.
  last_synced_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rows_upserted   INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS' | 'FAILED'
  error_message   TEXT
);

-- AUDIT LOGS (Immutable — NEVER delete or update rows here)
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name     VARCHAR(50) NOT NULL,                   -- e.g. 'lots', 'qc_checks'
  entity_id       UUID NOT NULL,
  changed_by      UUID NOT NULL REFERENCES users(id),
  action          VARCHAR(50) NOT NULL,                   -- e.g. 'STATUS_UPDATE', 'SLOT_ASSIGNED'
  old_value       JSONB,
  new_value       JSONB,
  ip_address      INET,
  user_agent      TEXT,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. AUTHENTICATION & SECURITY SYSTEM

### 5.1 Registration Flow

```
POST /api/v1/auth/register
  Body: { username, email, phone_number, password, role }
  ↓
  1. Check honeypot field `website` (hidden HTML field — if filled, silently drop request)
  2. Validate all fields with Pydantic (email format, phone E.164, password strength)
  3. Hash password with Argon2id (time_cost=3, memory_cost=65536, parallelism=4)
  4. INSERT INTO users (is_verified=false)
  5. Generate 6-digit OTP, hash it, INSERT INTO otp_tokens (purpose='REGISTRATION', expires_at=+15min)
  6. Send OTP via EMAIL (primary)
  7. Return 201: { message: "Verification code sent to your email." }
```

### 5.2 OTP Verification Flow

```
POST /api/v1/auth/verify-otp
  Body: { email, otp_code, channel }    -- channel: 'EMAIL' | 'WHATSAPP'
  ↓
  1. Look up un-used, non-expired OTP token for user + purpose='REGISTRATION'
  2. Verify hashed OTP match (constant-time compare)
  3. Mark otp_tokens.used_at = NOW()
  4. UPDATE users SET is_verified=true
  5. Return 200: { message: "Account verified. You may now log in." }

POST /api/v1/auth/resend-otp
  Body: { email, channel }   -- channel allows switching to WHATSAPP
  ↓
  1. Invalidate previous unused OTP tokens for this user + purpose
  2. Generate new OTP, send via requested channel
  3. Return 200: { message: "New verification code sent." }
```

### 5.3 Login Flow

```
POST /api/v1/auth/login
  Body: { username, password }           -- username OR email accepted
  ↓
  1. Check honeypot field
  2. Fetch user; verify Argon2id hash (constant-time)
  3. Check is_verified=true; if not → 403 "Account not verified"
  4. Generate 6-digit OTP; INSERT INTO otp_tokens (purpose='LOGIN', expires_at=+10min)
  5. Send OTP via user's preferred channel (email default)
  6. Return 200: { message: "Enter the verification code sent to your email." }

POST /api/v1/auth/login/verify
  Body: { email, otp_code }
  ↓
  1. Verify OTP
  2. UPDATE users SET last_login_at = NOW()
  3. Issue JWT access_token (15min) + refresh_token (7d, stored in HttpOnly cookie)
  4. Return 200: { access_token, token_type: "bearer", role, username }
```

### 5.4 Security Hardening Rules

- **Honeypot:** Every HTML form MUST include a hidden `<input name="website" tabindex="-1" autocomplete="off">`. If this field contains any value in the API payload, return HTTP 200 (do not reveal detection) but silently discard the request.
- **Password Hashing:** ALWAYS use Argon2id. NEVER use bcrypt, MD5, SHA-1, or plain text. Config: `time_cost=3, memory_cost=65536 (64MB), parallelism=4`.
- **Constant-Time Comparison:** Use `secrets.compare_digest()` for all token comparisons to prevent timing attacks.
- **Rate Limiting:** Max 5 failed login attempts per IP per 15 minutes → return 429 with `Retry-After` header.
- **JWT:** Access token payload = `{ sub: user_id, role: user_role, exp: +15min }`. Never embed sensitive fields.
- **HTTPS Only:** All cookies must have `Secure`, `HttpOnly`, `SameSite=Strict` flags.
- **Password Policy:** Min 8 chars, at least 1 uppercase, 1 digit, 1 special character. Enforce via Pydantic validator.

---

## 6. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

### 6.1 Role Enum Mapping (UI Display Name → System Role)

| UI Display Name | System Role Enum | Description |
| :--- | :--- | :--- |
| Supplier | `SUPPLIER` | Inputs incoming goods data |
| Gudang (Warehouse) | `INTAKE_STAFF` | Registers lot arrivals |
| QC | `QC_INSPECTOR` | Approves or rejects lots |
| Jadwal PPIC | `PPIC_MANAGER` | Assigns warehouse slots & schedules |
| Pelacakan Lot | `PPIC_MANAGER` (read) / `SUPER_ADMIN` | Read-only lot tracking |
| Pengiriman | `DELIVERY_STAFF` | Manages delivery orders |
| Admin | `SUPER_ADMIN` | Full access + audit logs |

### 6.2 Endpoint Permission Matrix

| Role | Allowed Endpoints / Actions | Forbidden |
| :--- | :--- | :--- |
| `SUPPLIER` | Create `suppliers`, Read own supplier record | Cannot see other roles' data |
| `INTAKE_STAFF` | POST `lots` (auto-set `PENDING_QC`, generate `lot_number`), Read `materials` | Cannot approve QC, Cannot assign slots |
| `QC_INSPECTOR` | GET `lots?status=PENDING_QC`, PATCH `lots/{id}/qc` (→ `APPROVED`/`REJECTED`), POST `qc_checks` | Cannot create lots, Cannot change slots |
| `PPIC_MANAGER` | GET `lots?status=APPROVED`, PATCH `lots/{id}/warehouse` (assign slot, → `IN_PRODUCTION`), Read all `lots` for tracking | Cannot create lots, Cannot do QC |
| `DELIVERY_STAFF` | GET `lots?status=IN_PRODUCTION`, POST `delivery_orders`, PATCH `delivery_orders/{id}` | Cannot modify lots directly |
| `SUPER_ADMIN` | GET all endpoints, GET `audit_logs`, POST/PATCH/DELETE `users` | — |

---

## 7. BUSINESS LOGIC & STATE MACHINE (STRICT — NO STEP SKIPPING)

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  LOT LIFECYCLE                        │
                    └─────────────────────────────────────────────────────┘

  [INTAKE_STAFF]         [QC_INSPECTOR]              [PPIC_MANAGER]         [DELIVERY_STAFF]
  POST /lots              PATCH /lots/{id}/qc         PATCH /lots/{id}/      PATCH /delivery/{id}
       │                       │                       warehouse                    │
       ▼                       ▼                           ▼                        ▼
  PENDING_QC ──────────► APPROVED ──────────────► IN_PRODUCTION ──────────► DELIVERED
                    └──► REJECTED (terminal)

State Transition Rules:
  - PENDING_QC  → APPROVED      : Only QC_INSPECTOR. Requires qc_check record.
  - PENDING_QC  → REJECTED      : Only QC_INSPECTOR. Requires rejection_reason.
  - APPROVED    → IN_PRODUCTION : Only PPIC_MANAGER. Requires warehouse_slot.
  - IN_PRODUCTION → DELIVERED   : Only DELIVERY_STAFF. Requires delivery_order.
  - ANY skip attempt             : Return HTTP 422 with message "Invalid state transition."
```

### 7.1 Lot Number Generation

Format: `LOT-{YYYYMMDD}-{SEQ:03d}` (e.g., `LOT-20260528-001`)

```python
async def generate_lot_number(db: AsyncSession, date: date) -> str:
    """
    Generates a sequential lot number for a given date.
    Uses SELECT ... FOR UPDATE to prevent race conditions.
    """
    date_str = date.strftime("%Y%m%d")
    prefix = f"LOT-{date_str}-"
    # Count existing lots for today, pad with zeros
    count = await db.scalar(select(func.count(Lot.id)).where(Lot.lot_number.startswith(prefix)))
    return f"{prefix}{(count + 1):03d}"
```

### 7.2 Immutable Audit Trail Rule (CRITICAL — ENTERPRISE READINESS)

**EVERY** `UPDATE` on `lots`, `qc_checks`, `delivery_orders` MUST be wrapped in a single database transaction that also INSERTs into `audit_logs`. No exceptions.

```python
async def update_lot_status(db: AsyncSession, lot_id: UUID, new_status: LotStatus,
                             current_user: User, extra_fields: dict) -> Lot:
    """Updates lot status and writes immutable audit log IN THE SAME TRANSACTION."""
    async with db.begin():
        lot = await db.get(Lot, lot_id, with_for_update=True)
        old_value = {"status": lot.status, "warehouse_slot": lot.warehouse_slot}

        for field, value in extra_fields.items():
            setattr(lot, field, value)
        lot.status = new_status
        lot.updated_at = datetime.utcnow()

        audit = AuditLog(
            entity_name="lots",
            entity_id=lot_id,
            changed_by=current_user.id,
            action="STATUS_UPDATE",
            old_value=old_value,
            new_value={"status": new_status, **extra_fields},
        )
        db.add(audit)
    return lot
```

---

## 8. ROLE-SPECIFIC DATA TABLES (UI TABLE SCHEMAS)

Each role's page renders a data table with the following columns. The `filled_at` column is **always auto-populated server-side** (`DEFAULT NOW()`) and **rendered in the UI as `Day, DD MMM YYYY HH:mm:ss WIB`**.

### 8.1 Supplier Table (`/role/supplier`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Auto-generated |
| `company_name` | Text | Supplier company name |
| `contact_person` | Text | PIC name |
| `phone` | Text | WhatsApp/phone number |
| `email` | Text | Contact email |
| `address` | Text | Full address |
| `filled_at` | Timestamp | **Auto: server timestamp** |

### 8.2 Warehouse / Intake Table (`/role/warehouse`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `lot_number` | Text | **Auto-generated** (LOT-YYYYMMDD-SEQ) |
| `material_name` | Text | FK → materials |
| `supplier_name` | Text | FK → suppliers |
| `quantity_kg` | Numeric | Weight in kg |
| `storage_condition` | Text | e.g. Cold-chain, Standard |
| `status` | Enum | Always starts `PENDING_QC` |
| `filled_at` | Timestamp | **Auto: server timestamp** |

### 8.3 QC Inspection Table (`/role/qc`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `lot_number` | Text | FK → lots |
| `material_name` | Text | FK → materials |
| `quantity_kg` | Numeric | From lot |
| `temperature_c` | Numeric | Measured temp |
| `humidity_pct` | Numeric | Measured humidity % |
| `visual_check` | Boolean | Pass/Fail |
| `smell_check` | Boolean | Pass/Fail |
| `weight_variance_pct` | Numeric | % deviation from manifest |
| `result` | Enum | `PASS` / `FAIL` |
| `notes` | Text | Free-form inspector notes |
| `rejection_reason` | Text | Required if FAIL |
| `filled_at` | Timestamp | **Auto: server timestamp** |

### 8.4 PPIC Schedule Table (`/role/ppic`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `lot_number` | Text | FK → lots (status=APPROVED) |
| `material_name` | Text | FK → materials |
| `quantity_kg` | Numeric | From lot |
| `warehouse_slot` | Text | e.g. `RACK-A1-03` |
| `production_schedule_date` | Date | Planned production date |
| `status` | Enum | `APPROVED` → `IN_PRODUCTION` |
| `ppic_notes` | Text | Free-form manager notes |
| `filled_at` | Timestamp | **Auto: server timestamp** |

### 8.5 Lot Tracking Table (`/role/lot-tracking`)
*Read-only dashboard — no data entry.*

| Column | Type | Description |
| :--- | :--- | :--- |
| `lot_number` | Text | Lot identifier |
| `material_name` | Text | Material |
| `supplier_name` | Text | Supplier |
| `quantity_kg` | Numeric | Weight |
| `current_status` | Enum | Full lifecycle status |
| `warehouse_slot` | Text | Assigned slot (nullable) |
| `created_at` | Timestamp | Intake timestamp |
| `last_updated` | Timestamp | Last status change |
| `current_handler` | Text | Role that last touched this lot |

### 8.6 Delivery Table (`/role/delivery`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `lot_number` | Text | FK → lots (status=IN_PRODUCTION) |
| `material_name` | Text | FK → materials |
| `quantity_kg` | Numeric | From lot |
| `driver_name` | Text | Driver name |
| `vehicle_plate` | Text | License plate |
| `destination` | Text | Delivery destination |
| `departure_at` | Timestamp | Scheduled departure |
| `arrived_at` | Timestamp | Actual arrival (nullable) |
| `status` | Enum | `SCHEDULED` / `IN_TRANSIT` / `DELIVERED` |
| `filled_at` | Timestamp | **Auto: server timestamp** |

---

## 9. GOOGLE SHEETS INTEGRATION (BIDIRECTIONAL SYNC)

### 9.1 Architecture

```
Web App Input
     │
     ▼
PostgreSQL (primary source of truth)
     │
     ├──► Google Sheets (push on each INSERT/UPDATE via background task)
     │         └── Each role maps to a dedicated Sheet Tab:
     │               Tab: "Supplier"    ← suppliers table
     │               Tab: "Warehouse"   ← lots table (intake view)
     │               Tab: "QC"          ← qc_checks table
     │               Tab: "PPIC"        ← lots table (ppic view)
     │               Tab: "LotTracking" ← lots full view
     │               Tab: "Delivery"    ← delivery_orders table
     │
     └──► Reverse Sync (polling every 5 min via background task)
               Google Sheets → detect new rows → UPSERT into PostgreSQL
```

### 9.2 Sheets Sync Service (`backend/app/services/sheets_sync.py`)

```python
# Key functions the AI must implement:

async def push_to_sheets(tab_name: str, rows: list[dict]) -> None:
    """Appends or updates rows in the specified Google Sheets tab.
    Called as a FastAPI BackgroundTask after every write operation.
    Maps Python dicts to sheet column order defined in SHEET_COLUMN_MAP."""

async def pull_from_sheets(tab_name: str) -> list[dict]:
    """Reads all rows from a Google Sheets tab.
    Called by the polling scheduler every 5 minutes.
    Returns list of dicts matching the relevant table schema."""

async def sync_sheets_to_postgres(db: AsyncSession) -> SyncResult:
    """Master sync function. For each tab, pull rows and UPSERT into PostgreSQL.
    Writes result to sheets_sync_log table.
    Uses ON CONFLICT DO UPDATE for idempotency."""
```

### 9.3 Environment Variables for Sheets

```env
GOOGLE_SHEETS_CREDENTIALS_JSON=/run/secrets/google_creds.json  # service account key
GOOGLE_SHEETS_SPREADSHEET_ID=<your-spreadsheet-id>
SHEETS_SYNC_INTERVAL_SECONDS=300
```

### 9.4 Column Map (Python dict key → Sheet column header)

Every sheet tab MUST have `filled_at` as the last column, formatted as `"Day, DD MMM YYYY HH:mm:ss WIB"` (e.g., `"Thursday, 28 May 2026 14:30:00 WIB"`).

---

## 10. ANALYTICS DASHBOARD (AUTO SQL QUERIES)

The `/dashboard` page renders pre-computed analytics cards. These queries run automatically and display results in real-time. The backend exposes them via `/api/v1/analytics/`.

### 10.1 Required Analytics Endpoints

| Endpoint | Query Description | Roles Allowed |
| :--- | :--- | :--- |
| `GET /analytics/monthly-intake?month=5&year=2026` | Total incoming lots & kg per supplier per month | ALL |
| `GET /analytics/qc-rejection-rate?month=5` | % rejection rate per material per month | QC_INSPECTOR, SUPER_ADMIN |
| `GET /analytics/lot-status-summary` | Count of lots per status (live) | PPIC_MANAGER, SUPER_ADMIN |
| `GET /analytics/supplier-performance` | Avg weight variance, rejection count per supplier | SUPER_ADMIN |
| `GET /analytics/warehouse-utilization` | Count of occupied vs. available warehouse slots | PPIC_MANAGER, SUPER_ADMIN |
| `GET /analytics/delivery-lead-time` | Avg days from intake to delivery per material | DELIVERY_STAFF, SUPER_ADMIN |

### 10.2 Example SQL (runs inside `analytics.py`)

```sql
-- Monthly intake by supplier
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
```

---

## 11. ENTERPRISE READINESS STANDARDS (30% JUDGING WEIGHT)

These rules are ABSOLUTE. The AI must never violate them.

### 11.1 Immutable Audit Trail
- **NEVER** execute an ORM `.update()` or raw `UPDATE` SQL on `lots`, `qc_checks`, or `delivery_orders` without simultaneously executing an `INSERT INTO audit_logs` within the **SAME `db.begin()` transaction block**.
- The `audit_logs` table itself is append-only. Never add DELETE or UPDATE endpoints for it.

### 11.2 Security
- **NEVER** expose `password_hash` or OTP codes in any API response.
- **ALWAYS** validate all input with Pydantic v2 models before touching the database.
- **ALWAYS** use `with_for_update=True` when reading a lot before updating it (prevents race conditions).

### 11.3 Error Handling Standards
| Scenario | HTTP Code | Response Body |
| :--- | :--- | :--- |
| Invalid input | 400 | `{ "detail": "Validation error: <field>: <reason>" }` |
| Missing/invalid JWT | 401 | `{ "detail": "Authentication required." }` |
| Wrong role for endpoint | 403 | `{ "detail": "Forbidden: requires role <ROLE>." }` |
| Resource not found | 404 | `{ "detail": "<Entity> <id> not found." }` |
| Invalid state transition | 422 | `{ "detail": "Invalid state transition: <old> → <new>." }` |
| Generic server error | 500 | `{ "detail": "Internal server error. Contact administrator." }` (log full traceback) |

### 11.4 BuildPad / Docker Compatibility
- All secrets in `.env` (never hardcode).
- `docker-compose.yml` must define: `backend`, `frontend`, `db` (PostgreSQL), `redis` (optional, for rate limiting).
- Health check endpoint: `GET /health` → `{ "status": "ok", "db": "connected" }`.

---

## 12. ENVIRONMENT VARIABLES TEMPLATE (`.env.example`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/sima_arome_db

# JWT
JWT_SECRET_KEY=<generate-with: openssl rand -hex 32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Argon2id (DO NOT CHANGE unless you know what you're doing)
ARGON2_TIME_COST=3
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=4

# Email (SendGrid)
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@simaarome.id

# WhatsApp OTP (Fonnte)
FONNTE_API_TOKEN=<your-fonnte-token>
FONNTE_WHATSAPP_NUMBER=<sender-number>

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS_JSON=/run/secrets/google_creds.json
GOOGLE_SHEETS_SPREADSHEET_ID=<your-spreadsheet-id>
SHEETS_SYNC_INTERVAL_SECONDS=300

# App
APP_ENV=production
CORS_ORIGINS=http://localhost:3000,https://yourdomain.buildpad.io
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_SECONDS=900
```

---

## 13. FRONTEND UI/UX SPECIFICATIONS

### 13.1 Design System
- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Theme:** Industrial/enterprise — dark sidebar, clean white content area, accent color `#2563EB` (blue-600)
- **Font:** `Geist` (headings) + `Geist Mono` (data/numbers)

### 13.2 Page Specifications

#### `/login` — Login Page
- Fields: `username_or_email` (text), `password` (password), hidden `website` (honeypot)
- After submit: show OTP input modal (6-digit code + channel toggle EMAIL/WHATSAPP)
- Link: "Don't have an account? Register"

#### `/register` — Registration Page
- Fields: `username`, `email`, `phone_number` (E.164 format hint), `password`, `confirm_password`, hidden `website` (honeypot)
- Role selector: dropdown of all available roles
- After submit: redirect to `/verify` with email in query param

#### `/verify` — OTP Verification Page
- 6-digit OTP input (auto-focus, auto-advance between digits)
- "Resend code" button (30-second cooldown)
- Channel toggle: "Send via WhatsApp instead"

#### `/dashboard` — Role Selector / Analytics Landing
- Grid of role cards (each with icon, display name, description)
- Analytics cards strip at top (from `/api/v1/analytics/`)
- Only show cards for roles the current user is assigned to

#### `/role/{role-slug}` — Role Data Entry Pages
- Data table with columns from Section 8
- "+ Add Entry" button → opens a modal/drawer form
- `filled_at` column reads from server response — never from client clock
- Sortable, filterable columns
- Export button → downloads current view as CSV

#### `/admin` — SUPER_ADMIN Only
- Full audit log table (paginated, filterable by entity/action/user/date range)
- User management table (create/deactivate users, change roles)

### 13.3 API Client (`frontend/src/lib/api.ts`)
```typescript
// Axios instance with:
// - Bearer token injection from localStorage
// - Automatic token refresh on 401 response (using refresh_token cookie)
// - Typed error handling that maps to toast notifications
```

---

## 14. EXECUTION COMMANDS FOR AI (PROMPT INTERPRETATION RULES)

| If user says... | AI must automatically... |
| :--- | :--- |
| "Build the QC page" | Fetch only `lots?status=PENDING_QC`, wrap with `QC_INSPECTOR` role guard, include `qc_checks` form |
| "Create the database schema" | Output full DDL from Section 4 including all ENUMs, FKs, and `audit_logs` |
| "Build the login flow" | Implement 2-step: credential check → OTP send → OTP verify → JWT issue, including honeypot |
| "Setup the Sheets sync" | Implement `sheets_sync.py` with push (background task) + pull (polling scheduler) |
| "Build the dashboard analytics" | Implement all 6 queries from Section 10.1 as FastAPI endpoints + frontend cards |
| "Create Dockerfile" | Use multi-stage build: `python:3.11-slim` for backend, `node:20-alpine` for frontend |
| "Generate dummy data" | Populate all roles, 10 materials, 3 suppliers, 20 lots across all statuses |

---

## 15. DEMO STRATEGY NOTES (FOR JUDGING DAY)

- **Killer Demo Flow:** Register as INTAKE_STAFF → Input a lot → Switch to QC_INSPECTOR tab → Approve it → Switch to PPIC_MANAGER → Assign warehouse slot → Switch to DELIVERY_STAFF → Mark delivered → Show SUPER_ADMIN audit log trail.
- **Spreadsheet Live Demo:** Open the Google Sheets during the demo — show that the PPIC row appears automatically after the PPIC action is taken in the web app.
- **Analytics Demo:** Show the monthly intake chart updating live after data entry.
- **Security Demo:** Show the `/api/v1/audit-logs` endpoint returning an immutable history of every change.