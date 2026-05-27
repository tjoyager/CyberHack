-- 02_seed_data.sql
-- CyberHack 2026: Sima Arome ERP Starter Data (Final Boss Version)

-- 1. SYSTEM & RBAC USERS
-- Internal System User for Audit Fallback
INSERT INTO users (id, username, password_hash, role, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'system', 'DISABLED', 'SUPER_ADMIN', TRUE);

INSERT INTO users (username, password_hash, role) VALUES
('hadryan_admin', 'hash_admin_2026', 'SUPER_ADMIN'),
('staff_intake_01', 'hash_intake_2026', 'INTAKE_STAFF'),
('inspector_qc_01', 'hash_qc_2026', 'QC_INSPECTOR'),
('ppic_manager_01', 'hash_ppic_2026', 'PPIC_MANAGER');

-- 2. SUPPLIERS (Normalized)
INSERT INTO suppliers (name, contact_email) VALUES
('Madagascar Pure Co.', 'sales@madagascar-pure.com'),
('IndoFragranced Ltd.', 'support@indofragranced.id'),
('SunCoast Botanicals', 'info@suncoast.com');

-- 3. MASTER MATERIALS (With SKU & UOM)
INSERT INTO materials (sku, name, uom, storage_condition) VALUES
('MAT-VAN-001', 'Vanilla Bean Extract', 'LITER', 'Cool & Dry (15-20C)'),
('MAT-CLV-002', 'Raw Clove Bud', 'KG', 'Standard Warehouse'),
('MAT-CIT-003', 'Citrus Terpenes', 'LITER', 'Flammable Storage (Ventilated)');
