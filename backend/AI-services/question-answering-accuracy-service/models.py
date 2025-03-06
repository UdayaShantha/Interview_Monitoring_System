from sqlalchemy import Column, Integer, Text, Float
from database import Base
class AnsweringAccuracy(Base):
    __tablename__ = "answering_accuracy"
    interview_id = Column(Integer, primary_key=True)
    question_id = Column(Integer, primary_key=True)
    keywords = Column(Text, nullable=False)
    accuracy = Column(Float, nullable=False)

    def __repr__(self):
        return f"<Answering Accuracy {self.interview_id}-{self.question_id}>"