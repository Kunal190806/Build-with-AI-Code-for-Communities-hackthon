from sqlalchemy import Column, String, Float, Integer, DateTime
from database import Base
import datetime
import uuid

class IssueModel(Base):
    __tablename__ = "issues"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True)
    description = Column(String)
    category = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    language = Column(String)
    priority_score = Column(Integer)
    sentiment = Column(String)
    urgency = Column(String)
    explanation = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Open")
