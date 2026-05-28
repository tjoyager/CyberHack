from sqlmodel import create_engine, Session
from backend.app.core.config import settings

engine = create_engine(settings.get_database_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
