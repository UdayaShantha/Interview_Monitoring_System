from sqlalchemy import Column, Integer, Text, LargeBinary, ARRAY
from database import Base

class InterviewReport(Base):
    __tablename__ = "interview_reports"
    interview_id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, primary_key=True)
    photos = Column(ARRAY(LargeBinary))  # Stores array of binary data
    report = Column(Text)  # Stores CSV content as text

    def __repr__(self):
        return f"<InterviewReport {self.interview_id}-{self.candidate_id}>"