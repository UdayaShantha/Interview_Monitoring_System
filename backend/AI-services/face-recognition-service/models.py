from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, LargeBinary, ARRAY, JSON
from database import Base

class InterviewReport(Base):
    __tablename__ = "facial_recognition_data"
    interview_id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, primary_key=True)
    photos = Column(JSON)
    report = Column(Text)
    csv_file_path = Column(String(255))

    def __repr__(self):
        return f"<InterviewReport {self.interview_id}-{self.candidate_id}>"