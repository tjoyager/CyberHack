-- 02_seed_data.sql
-- Seed data for Sima Arome ERP Lite
-- Password for all users: CyberHack2026!

-- 1. Initial Suppliers
INSERT INTO suppliers (id, company_name, contact_person, phone, email, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Global Aromatics Ltd.', 'John Fragrance', '+628123456789', 'sales@global-aromatics.com', 'Jakarta Industrial Estate'),
('550e8400-e29b-41d4-a716-446655440002', 'Essence Prime Co.', 'Alice Scent', '+628987654321', 'orders@essenceprime.io', 'Bandung Science Park');

-- 2. Initial Materials
INSERT INTO materials (id, name, supplier_name, storage_condition, unit, min_stock_kg) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Vanilla Extract', 'Global Aromatics Ltd.', 'Cool Dry Place', 'kg', 50.00),
('550e8400-e29b-41d4-a716-446655440012', 'Lavender Oil', 'Essence Prime Co.', 'Chilled 5C', 'kg', 25.00),
('550e8400-e29b-41d4-a716-446655440013', 'Rose Essential Oil', 'Global Aromatics Ltd.', 'Dark Room', 'kg', 10.00);

-- 3. Initial Users
-- Hash for 'CyberHack2026!'
INSERT INTO users (id, username, email, password_hash, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'intake_user', 'intake@simaarome.com', '$argon2id$v=19$m=65536,t=3,p=4$TaksQ2aEendDMjT2k3M1CA$4Acjc2hTQ9aauyeQWUN/vpGpOjQNDg7yXlemrkU398o', 'INTAKE_STAFF', TRUE),
('550e8400-e29b-41d4-a716-446655440102', 'qc_user', 'qc@simaarome.com', '$argon2id$v=19$m=65536,t=3,p=4$TaksQ2aEendDMjT2k3M1CA$4Acjc2hTQ9aauyeQWUN/vpGpOjQNDg7yXlemrkU398o', 'QC_INSPECTOR', TRUE),
('550e8400-e29b-41d4-a716-446655440103', 'ppic_user', 'ppic@simaarome.com', '$argon2id$v=19$m=65536,t=3,p=4$TaksQ2aEendDMjT2k3M1CA$4Acjc2hTQ9aauyeQWUN/vpGpOjQNDg7yXlemrkU398o', 'PPIC_MANAGER', TRUE),
('550e8400-e29b-41d4-a716-446655440104', 'admin', 'admin@simaarome.com', '$argon2id$v=19$m=65536,t=3,p=4$TaksQ2aEendDMjT2k3M1CA$4Acjc2hTQ9aauyeQWUN/vpGpOjQNDg7yXlemrkU398o', 'SUPER_ADMIN', TRUE);
