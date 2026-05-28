import random
import uuid
from datetime import datetime, timedelta

def generate_seed_lots(num_records=550):
    statuses = ['PENDING_QC', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'CONSUMED']
    status_weights = [0.1, 0.1, 0.05, 0.25, 0.5] 
    
    sql_statements = ["-- 500+ Simulated Transactional Lots for Demo\n"]
    material_ids = list(range(1, 21))
    supplier_ids = list(range(1, 6))
    base_date = datetime(2026, 1, 1)
    
    for i in range(num_records):
        lot_id = str(uuid.uuid4())
        material_id = random.choice(material_ids)
        supplier_id = random.choice(supplier_ids)
        
        created_at = base_date + timedelta(days=random.randint(0, 150))
        lot_number = f"LOT-{created_at.strftime('%Y%m%d')}-{i+100:03d}"
        
        qty = round(random.uniform(10.0, 500.0), 2)
        status = random.choices(statuses, weights=status_weights)[0]
        
        expiry_date = created_at + timedelta(days=random.randint(365, 730))
        mfg_date = created_at - timedelta(days=random.randint(5, 30))
        
        rem_qty = qty
        if status in ['IN_PRODUCTION', 'CONSUMED']:
            rem_qty = round(qty * random.uniform(0, 0.5), 2) if status == 'IN_PRODUCTION' else 0.0
            
        warehouse_slot = f"WH-{random.choice(['A', 'B', 'C'])}-{random.randint(1, 20):02d}" if status != 'REJECTED' else None
        slot_val = f"'{warehouse_slot}'" if warehouse_slot else 'NULL'
        
        qc_notes = "Standard inspection passed." if status != 'REJECTED' else "Impurities detected above threshold."
        
        stmt = (
            f"INSERT INTO lots (id, lot_number, material_id, supplier_id, initial_quantity, "
            f"remaining_quantity, status, warehouse_slot, expiry_date, manufactured_date, qc_notes, created_at) "
            f"VALUES ('{lot_id}', '{lot_number}', {material_id}, {supplier_id}, {qty}, {rem_qty}, '{status}', "
            f"{slot_val}, '{expiry_date.date()}', '{mfg_date.date()}', '{qc_notes}', '{created_at}');"
        )
        
        sql_statements.append(stmt)

    with open('db/03_enterprise_data.sql', 'w') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"Successfully generated db/03_enterprise_data.sql with {num_records} records.")

if __name__ == "__main__":
    generate_seed_lots()
