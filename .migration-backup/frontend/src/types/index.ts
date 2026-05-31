export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INTAKE_STAFF = 'INTAKE_STAFF',
  QC_INSPECTOR = 'QC_INSPECTOR',
  PPIC_MANAGER = 'PPIC_MANAGER',
}

export enum LotStatus {
  PENDING_QC = 'PENDING_QC',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  CONSUMED = 'CONSUMED',
  EXPIRED = 'EXPIRED',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Material {
  id: number;
  sku: string;
  name: string;
  uom: string;
  storage_condition: string;
  created_at: string;
}

export interface Lot {
  id: string;
  lot_number: string;
  material_id: number;
  supplier_id: number;
  initial_quantity: number;
  remaining_quantity: number;
  status: LotStatus;
  warehouse_slot?: string;
  expiry_date: string;
  manufactured_date?: string;
  qc_notes?: string;
  qc_metrics?: any;
  created_at: string;
  updated_at: string;
}
