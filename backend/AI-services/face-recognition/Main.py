import os
import uvicorn
from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, Field
from typing import List,Annotated
import subprocess
import sys

from sqlalchemy.ext.asyncio import AsyncSession

from basicDetect import run as basic_detect
from faceVerify import run as face_verify
import threading
from database import get_db,create_tables
from models import Transcription,InterviewReport

app = FastAPI(title="Face-Recognition")

@app.on_event("startup")
async def startup_event():
    await create_tables()

@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model():
    """Starts the face landmark detection process asynchronously when called."""

    def start_detection():
        basic_detect(
            model='face_landmarker.task',
            num_faces=5,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            camera_id=0,
            width=1920,
            height=1080
        )

    # Run the detection in a separate thread to avoid blocking FastAPI
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()

    return {"message": "Face landmark detection started successfully"}


@app.get("/load/model/mesh")
async def load_stream_mesh():
    """
    Starts the face landmark detection asynchronously for a given interview ID.
    """

    def start_detection():
        face_verify(
            model='face_landmarker.task',
            num_faces=5,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            camera_id=0,
            width=1920,
            height=1080
        )

    # Run the detection in a separate thread to avoid blocking FastAPI
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()

    return {"message": f"Face landmark detection started successfully"}


# Global variable to track the running process
report_process = None

@app.get("/load/model/report")
async def load_stream_report(interviewId: int, candidateId: int, db: AsyncSession = Depends(get_db)):
    """
    Start the interview monitoring system, generate a report, and store it in the database.
    """
    global report_process

    # Check if the process is already running
    if report_process and report_process.is_alive():
        raise HTTPException(status_code=400, detail="Report generation is already running.")

    # Function to run the report generation process
    def run_report_generation():
        try:
            # Run the main function of the report generation script
            subprocess.run([sys.executable, "reportGeneration.py"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error during report generation: {e}")

    # Start the report generation process in a separate thread
    report_process = threading.Thread(target=run_report_generation, daemon=True)
    report_process.start()

    return {"message": "Report generation started successfully"}

@app.get("/stop/model/report")
async def stop_stream_report(interviewId: int, candidateId: int, db: AsyncSession = Depends(get_db)):
    """
    Stop the interview monitoring system, save the report to the database, and return the CSV file.
    """
    global report_process

    # Check if the process is running
    if not report_process or not report_process.is_alive():
        raise HTTPException(status_code=400, detail="No report generation process is running.")

    # Wait for the process to finish
    report_process.join()

    # Find the latest generated CSV file
    reports_dir = "interview_reports"
    if not os.path.exists(reports_dir):
        raise HTTPException(status_code=404, detail="No reports directory found.")

    # Get the most recent CSV file
    csv_files = [f for f in os.listdir(reports_dir) if f.endswith(".csv")]
    if not csv_files:
        raise HTTPException(status_code=404, detail="No CSV report files found.")

    latest_csv = max(csv_files, key=lambda f: os.path.getmtime(os.path.join(reports_dir, f)))
    csv_path = os.path.join(reports_dir, latest_csv)

    # Read the CSV file content
    with open(csv_path, "r") as file:
        csv_content = file.read()

    # Save the report to the database
    interview_report = InterviewReport(
        interview_id=interviewId,
        candidate_id=candidateId,
        photos=[],  # Add photo data if available
        report=csv_content
    )

    db.add(interview_report)
    await db.commit()
    await db.refresh(interview_report)

    # Return the CSV file as a response
    return {
        "message": "Report generation stopped and saved successfully",
        "report_id": interview_report.interview_id,  # Use appropriate ID
        "csv_content": csv_content
    }

@app.get("/load/model/face-recognition")
async def load_stream_face_recognition():
    return NotImplemented

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)