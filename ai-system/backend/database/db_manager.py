import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, SessionModel, MessageModel, InteractionModel
from services.config import settings

# Database connection URL
# Use connection string from settings or env
db_url = os.getenv("DATABASE_URL", "postgresql://postgres:rohit@localhost:5432/sentinel_db")

engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DBManager:
    @staticmethod
    def initialize_db():
        """Create tables if they don't exist."""
        # Note: In a real prod environment, we would use Alembic for migrations
        Base.metadata.create_all(bind=engine)

    @staticmethod
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    @staticmethod
    def create_chat_session(title: str):
        db = SessionLocal()
        try:
            session = SessionModel(title=title)
            db.add(session)
            db.commit()
            db.refresh(session)
            return session
        finally:
            db.close()

    @staticmethod
    def add_message(session_id: str, role: str, content: str):
        if not session_id:
            return None
        db = SessionLocal()
        try:
            # Ensure it is a UUID object for SQLAlchemy
            u_id = uuid.UUID(session_id) if isinstance(session_id, str) else session_id
            message = MessageModel(session_id=u_id, role=role, content=content)
            db.add(message)
            db.commit()
            db.refresh(message)
            return message
        except Exception as e:
            # If session doesn't exist or other DB error, log and return None
            db.rollback()
            return None
        finally:
            db.close()

    @staticmethod
    def get_session_history(session_id: str):
        if not session_id:
            return []
        db = SessionLocal()
        try:
            u_id = uuid.UUID(session_id) if isinstance(session_id, str) else session_id
            messages = db.query(MessageModel).filter(MessageModel.session_id == u_id).order_by(MessageModel.timestamp).all()
            return messages
        except Exception:
            # If session ID is malformed or invalid, just return empty history
            return []
        finally:
            db.close()

    @staticmethod
    def add_interaction(session_id: str, user_input: str, assistant_response: str):
        """Saves a user-assistant pair as a single interaction."""
        if not session_id:
            return None
        db = SessionLocal()
        try:
            u_id = uuid.UUID(session_id) if isinstance(session_id, str) else session_id
            interaction = InteractionModel(
                session_id=u_id,
                user_input=user_input,
                assistant_response=assistant_response
            )
            db.add(interaction)
            db.commit()
            db.refresh(interaction)
            return interaction
        except Exception as e:
            # If session doesn't exist or other DB error, log and return None
            db.rollback()
            return None
        finally:
            db.close()

db_manager = DBManager()
