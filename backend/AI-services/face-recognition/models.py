from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, LargeBinary, ARRAY
from database import Base

class InterviewReport(Base):
    __tablename__ = "facial_recognition_report"
    interview_id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, primary_key=True)
    photos = Column(ARRAY(LargeBinary))
    report = Column(Text)

    def __repr__(self):
        return f"<InterviewReport {self.interview_id}-{self.candidate_id}>"