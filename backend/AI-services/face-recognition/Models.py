from sqlalchemy import Column, Integer, LargeBinary, ForeignKey
from sqlalchemy.orm import relationship
from Base import Base  # Import Base from the separate module

# Define the FaceRecognition model
class FaceRecognition(Base):
    __tablename__ = "face_recognition"

    interview_id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, primary_key=True)

    # Relationship to multiple photos (one-to-many relationship with CandidatePhoto)
    photos = relationship("CandidatePhoto", back_populates="face_recognition", cascade="all, delete-orphan")

    # Store the report as BYTEA (could be a CSV or other binary data)
    report = Column(LargeBinary)

# Define the CandidatePhoto model for storing candidate images as byte arrays
class CandidatePhoto(Base):
    __tablename__ = "candidate_photos"

    photo_id = Column(Integer, primary_key=True, autoincrement=True)
    interview_id = Column(Integer, ForeignKey("face_recognition.interview_id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("face_recognition.candidate_id"), nullable=False)

    # Store each photo as BYTEA
    photo = Column(LargeBinary, nullable=False)

    # Define the relationship back to the FaceRecognition model
    face_recognition = relationship("FaceRecognition", back_populates="photos")
