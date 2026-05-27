-- 01_init_schema.sql
-- CyberHack 2026: Sima Arome ERP Enterprise Schema (Final Boss Version)
-- Optimized for: Natural Extracts, F&B, and Cosmetics Industry

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN', 
    'INTAKE_STAFF', 
    'QC_INSPECTOR', 
    'PPIC_MANAGER'
);

CREATE TYPE lot_status AS ENUM (
    'PENDING_QC', 
    'APPROVED', 
    'REJECTED', 
    'IN_PRODUCTION',
    'CONSUMED',
    'EXPIRED'
);

-- 2. USERS TABLE (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUPPLIERS TABLE (Normalized Master Data)
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MATERIALS TABLE (Master Data)
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL, -- Stock Keeping Unit
    name VARCHAR(100) NOT NULL,
    uom VARCHAR(10) NOT NULL DEFAULT 'KG', -- Unit of Measure
    storage_condition VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOTS TABLE (Transactional Core with Stock Tracking & Expiry)
CREATE TABLE lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    initial_quantity DECIMAL(12, 4) NOT NULL CHECK (initial_quantity > 0),
    remaining_quantity DECIMAL(12, 4) NOT NULL CHECK (remaining_quantity >= 0),
    status lot_status NOT NULL DEFAULT 'PENDING_QC',
    warehouse_slot VARCHAR(50), 
    expiry_date DATE NOT NULL,
    manufactured_date DATE,
    qc_notes TEXT,
    qc_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_stock_consistency CHECK (remaining_quantity <= initial_quantity)
);

-- 6. AUDIT LOGS TABLE (Enterprise Readiness - Immutable)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE'
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TRIGGER FUNCTIONS

-- Update 'updated_at' column on lots
CREATE OR REPLACE FUNCTION fn_update_lots_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Automated Audit Logging for Lots (Captures all transactional changes)
CREATE OR REPLACE FUNCTION fn_audit_lots_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        entity_name,
        entity_id,
        changed_by,
        action,
        old_value,
        new_value
    ) VALUES (
        'lots',
        NEW.id,
        COALESCE(
            NULLIF(current_setting('app.current_user_id', true), '')::UUID, 
            '00000000-0000-0000-0000-000000000000'::UUID 
        ),
        TG_OP,
        CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER ATTACHMENT
CREATE TRIGGER trg_lots_timestamp
    BEFORE UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION fn_update_lots_timestamp();

CREATE TRIGGER trg_lots_audit
    AFTER INSERT OR UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_lots_change();

-- 9. INDEXES
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_material_id ON lots(material_id);
CREATE INDEX idx_lots_expiry_date ON lots(expiry_date);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
