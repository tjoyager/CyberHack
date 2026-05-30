-- 01_init_schema.sql
-- CyberHack 2026: Sima Arome ERP Enterprise Schema
-- Aligned with SQLAlchemy models and CONTEXT.md Section 4

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN', 
    'INTAKE_STAFF', 
    'QC_INSPECTOR', 
    'PPIC_MANAGER',
    'SUPPLIER',
    'DELIVERY_STAFF'
);

CREATE TYPE lot_status AS ENUM (
    'PENDING_QC', 
    'APPROVED', 
    'REJECTED', 
    'IN_PRODUCTION',
    'DELIVERED'
);

CREATE TYPE otp_channel AS ENUM (
    'EMAIL',
    'WHATSAPP'
);

-- 2. USERS TABLE (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'INTAKE_STAFF',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- 3. OTP TOKENS
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    channel otp_channel NOT NULL DEFAULT 'EMAIL',
    purpose VARCHAR(30) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MATERIALS (Master data)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    supplier_name VARCHAR(255),
    storage_condition VARCHAR(100),
    unit VARCHAR(30),
    min_stock_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SUPPLIERS
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LOTS (Core transactional entity)
CREATE TABLE lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number VARCHAR(30) UNIQUE NOT NULL,
    material_id UUID NOT NULL REFERENCES materials(id),
    supplier_id UUID REFERENCES suppliers(id),
    quantity_kg DECIMAL(12, 3) NOT NULL,
    status lot_status NOT NULL DEFAULT 'PENDING_QC',
    warehouse_slot VARCHAR(50),
    qc_notes TEXT,
    rejection_reason TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QC CHECKS (per lot)
CREATE TABLE qc_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES lots(id),
    inspector_id UUID NOT NULL REFERENCES users(id),
    temperature_c DECIMAL(5, 2),
    humidity_pct DECIMAL(5, 2),
    visual_check BOOLEAN,
    smell_check BOOLEAN,
    weight_variance_pct DECIMAL(5, 2),
    result VARCHAR(10) NOT NULL,
    notes TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DELIVERY ORDERS
CREATE TABLE delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES lots(id),
    driver_name VARCHAR(100),
    vehicle_plate VARCHAR(20),
    destination VARCHAR(255),
    departure_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SHEETS SYNC LOG
CREATE TABLE sheets_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_tab VARCHAR(50) NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rows_upserted INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT
);

-- 10. AUDIT LOGS (Immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. INDEXES
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_material_id ON lots(material_id);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
