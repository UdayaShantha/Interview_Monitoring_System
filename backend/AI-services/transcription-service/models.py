from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from database import Base

class Transcription(Base):
    __tablename__ = "transcriptions"
    interview_id = Column(Integer, primary_key=True)
    question_id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<Transcription {self.interview_id}-{self.question_id}>"