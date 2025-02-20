from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, LargeBinary, ARRAY
from database import Base

class Transcription(Base):
    __tablename__ = "transcriptions"
    interview_id = Column(Integer, primary_key=True)
    question_id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    def __repr__(self):
        return f"<Transcription {self.interview_id}-{self.question_id}>"

class InterviewReport(Base):
    __tablename__ = "interview_reports"
    interview_id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, primary_key=True)
    photos = Column(ARRAY(LargeBinary))  # Stores array of binary data
    report = Column(Text)  # Stores CSV content as text

    def __repr__(self):
        return f"<InterviewReport {self.interview_id}-{self.candidate_id}>"