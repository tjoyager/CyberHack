import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from datetime import datetime
from app.main import app
from app.core.db import get_session
from app.models.models import User, UserRole, Material, Supplier, Lot, LotStatus
from app.core.security import get_password_hash, create_access_token

# Setup in-memory SQLite for testing
engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # Create dummy master data
        m1 = Material(sku="M1", name="Material 1", storage_condition="Dry")
        s1 = Supplier(name="Supplier 1")
        session.add(m1)
        session.add(s1)
        
        # Create users for different roles
        u_admin = User(username="admin", password_hash="hash", role=UserRole.SUPER_ADMIN)
        u_intake = User(username="intake", password_hash="hash", role=UserRole.INTAKE_STAFF)
        u_qc = User(username="qc", password_hash="hash", role=UserRole.QC_INSPECTOR)
        session.add(u_admin)
        session.add(u_intake)
        session.add(u_qc)
        
        session.commit()
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def get_token(user_id: str):
    return create_access_token(user_id)

def test_create_lot_as_intake(client: TestClient, session: Session):
    user = session.exec(select(User).where(User.username == "intake")).first()
    token = get_token(str(user.id))
    
    response = client.post(
        "/api/v1/lots/",
        json={
            "material_id": 1,
            "supplier_id": 1,
            "initial_quantity": 100.0,
            "expiry_date": "2027-01-01T00:00:00"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == LotStatus.PENDING_QC
    assert data["lot_number"].startswith("LOT-")

def test_qc_approve_lot(client: TestClient, session: Session):
    # 1. Create a lot first
    user_intake = session.exec(select(User).where(User.username == "intake")).first()
    lot = Lot(
        lot_number="LOT-TEST-001",
        material_id=1,
        supplier_id=1,
        initial_quantity=50.0,
        remaining_quantity=50.0,
        status=LotStatus.PENDING_QC,
        expiry_date=datetime(2027, 1, 1)
    )
    session.add(lot)
    session.commit()
    
    # 2. Approve as QC
    user_qc = session.exec(select(User).where(User.username == "qc")).first()
    token = get_token(str(user_qc.id))
    
    response = client.patch(
        f"/api/v1/lots/{lot.id}/qc",
        json={"status": "APPROVED", "qc_notes": "All good"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == LotStatus.APPROVED

def test_ppic_route_lot(client: TestClient, session: Session):
    # 1. Create an APPROVED lot
    lot = Lot(
        lot_number="LOT-TEST-003",
        material_id=1,
        supplier_id=1,
        initial_quantity=50.0,
        remaining_quantity=50.0,
        status=LotStatus.APPROVED,
        expiry_date=datetime(2027, 1, 1)
    )
    session.add(lot)
    session.commit()
    
    # Create PPIC user
    u_ppic = User(username="ppic", password_hash="hash", role=UserRole.PPIC_MANAGER)
    session.add(u_ppic)
    session.commit()
    
    token = get_token(str(u_ppic.id))
    
    response = client.patch(
        f"/api/v1/lots/{lot.id}/ppic",
        json={"warehouse_slot": "ZONE-B-01", "status": "IN_PRODUCTION"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == LotStatus.IN_PRODUCTION
    assert response.json()["warehouse_slot"] == "ZONE-B-01"

def test_rbac_intake_cannot_approve(client: TestClient, session: Session):
    lot = Lot(
        lot_number="LOT-TEST-002",
        material_id=1,
        supplier_id=1,
        initial_quantity=50.0,
        remaining_quantity=50.0,
        status=LotStatus.PENDING_QC,
        expiry_date=datetime(2027, 1, 1)
    )
    session.add(lot)
    session.commit()
    
    user_intake = session.exec(select(User).where(User.username == "intake")).first()
    token = get_token(str(user_intake.id))
    
    response = client.patch(
        f"/api/v1/lots/{lot.id}/qc",
        json={"status": "APPROVED"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403 # Role check handles this
