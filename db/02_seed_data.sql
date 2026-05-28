-- 02_seed_data.sql
-- Seed data for Sima Arome ERP Lite (Flavor & Fragrance Industry)

-- 1. Initial Suppliers
INSERT INTO suppliers (name, contact_email) VALUES
('Global Aromatics Ltd.', 'sales@global-aromatics.com'),
('Essence Prime Co.', 'orders@essenceprime.io'),
('Nature Extracts S.A.', 'contact@nature-extracts.fr'),
('Synthetic Scents Inc.', 'support@syntheticscents.com'),
('Pure Oils Distillation', 'logistics@pureoils.com');

-- 2. Initial Materials (Flavor & Fragrance Ingredients)
INSERT INTO materials (sku, name, uom, storage_condition) VALUES
('MAT-001', 'Vanillin Crystal (99% Pure)', 'KG', 'Standard Dry (25°C)'),
('MAT-002', 'Limonene D-Limonene Food Grade', 'KG', 'Cool Storage (15°C)'),
('MAT-003', 'Menthol Arvensis Crystals', 'KG', 'Cool and Dry'),
('MAT-004', 'Linalool (Synthetic)', 'KG', 'Standard Dry'),
('MAT-005', 'Citral (High Purity)', 'KG', 'Cool Storage (10°C)'),
('MAT-006', 'Bergamot Essential Oil', 'KG', 'Cold-chain (5°C)'),
('MAT-007', 'Sandalwood Oil (Mysore Grade)', 'KG', 'Standard Dry'),
('MAT-008', 'Ethyl Maltol (Cotton Candy Note)', 'KG', 'Standard Dry'),
('MAT-009', 'Iso E Super', 'KG', 'Standard Dry'),
('MAT-010', 'Hedione (High Cis)', 'KG', 'Standard Dry'),
('MAT-011', 'Galaxolide (50% in IPM)', 'KG', 'Standard Dry'),
('MAT-012', 'Patchouli Oil (Iron-free)', 'KG', 'Cool Storage'),
('MAT-013', 'Lavender Oil (Bulgarian)', 'KG', 'Cold-chain (5°C)'),
('MAT-014', 'Cinnamic Aldehyde', 'KG', 'Standard Dry'),
('MAT-015', 'Cis-3-Hexenyl Acetate (Green Note)', 'KG', 'Cold-chain (-20°C)'),
('MAT-016', 'Benzaldehyde', 'KG', 'Cool Storage'),
('MAT-017', 'Coumarin Powder', 'KG', 'Standard Dry'),
('MAT-018', 'Alpha-Isomethyl Ionone', 'KG', 'Standard Dry'),
('MAT-019', 'Geraniol (Fine Grade)', 'KG', 'Cool Storage'),
('MAT-020', 'Peppermint Oil (Piperita)', 'KG', 'Cold-chain (5°C)');

-- 3. Initial Admin User (Password is 'admin123' - Hashed)
-- Password hashed using bcrypt: $2b$12$6K2fB/8T5Nq1TjB8yO5pOu0P0Fp6O.7h9x/k8S.q/p.u.K.q.u.K.
-- Note: Replace with actual hash from security.py if needed.
INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S.', 'SUPER_ADMIN'),
('intake_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S.', 'INTAKE_STAFF'),
('qc_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S.', 'QC_INSPECTOR'),
('ppic_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa31S.', 'PPIC_MANAGER');
