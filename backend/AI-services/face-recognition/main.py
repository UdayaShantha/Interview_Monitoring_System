import asyncio
import csv
import os
from datetime import time, datetime

import uvicorn
from fastapi import FastAPI,HTTPException,Depends

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import FileResponse

from basicDetect import run as basic_detect
from faceVerify import run as face_verify
from reportGeneration import run as report_generation
import threading
from database import get_db,create_tables
from models import InterviewReport

app = FastAPI(title="Face-Recognition")

report_process = None
stop_event = threading.Event()

@app.on_event("startup")
async def startup_event():
    await create_tables()

@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model():
    """Starts the face landmark detection process asynchronously when called."""

    def start_detection():
        basic_detect(
            model='face_landmarker.task',
            num_faces=3,
            min_face_detection_confidence=0.6,
            min_face_presence_confidence=0.6,
            min_tracking_confidence=0.6,
            camera_id=0,
            width=720,
            height=480
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
            num_faces=3,
            min_face_detection_confidence=0.6,
            min_face_presence_confidence=0.6,
            min_tracking_confidence=0.6,
            camera_id=0,
            width=720,
            height=480
        )

    # Run the detection in a separate thread to avoid blocking FastAPI
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()

    return {"message": f"Face landmark detection started successfully"}


def find_latest_report():
    """Finds the most recently created CSV report in interview_reports directory"""
    try:
        reports_dir = "interview_reports"
        if not os.path.exists(reports_dir):
            return None

        csv_files = [f for f in os.listdir(reports_dir) if f.endswith(".csv")]
        if not csv_files:
            return None

        # Get most recently modified CSV file
        latest = max(csv_files, key=lambda f: os.path.getmtime(os.path.join(reports_dir, f)))
        return os.path.join(reports_dir, latest)
    except Exception as e:
        print(f"Error finding report: {e}")
        return None


@app.get("/load/model/report")
async def load_stream_report(interviewId: int, candidateId: int, db: AsyncSession = Depends(get_db)):
    """Start and manage the entire report generation lifecycle"""
    global report_process, stop_event

    if report_process and report_process.is_alive():
        raise HTTPException(status_code=400, detail="Report generation already running")

    # Create interview_reports directory if not exists
    os.makedirs("interview_reports", exist_ok=True)

    # Get initial list of CSV files
    initial_files = set()
    if os.path.exists("interview_reports"):
        initial_files = set(os.listdir("interview_reports"))

    def run_monitoring():
        """Wrapper function to run report generation"""
        try:
            report_generation(
                model='face_landmarker.task',
                num_faces=3,
                min_face_detection_confidence=0.6,
                min_face_presence_confidence=0.6,
                min_tracking_confidence=0.6,
                camera_id=0,
                width=720,
                height=480
            )
        except Exception as e:
            print(f"Report generation error: {str(e)}")
        finally:
            stop_event.set()

    # Start monitoring thread
    stop_event.clear()
    report_process = threading.Thread(target=run_monitoring, daemon=True)
    report_process.start()

    # Wait for process completion with timeout
    try:
        for _ in range(60):  # 60 retries = 30 seconds timeout
            if not report_process.is_alive():
                break
            await asyncio.sleep(0.5)
        else:
            raise HTTPException(status_code=504, detail="Report generation timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monitoring error: {str(e)}")

    # Find new CSV files created after our process started
    final_files = set(os.listdir("interview_reports")) if os.path.exists("interview_reports") else set()
    new_files = [f for f in final_files - initial_files if f.endswith(".csv")]

    if not new_files:
        raise HTTPException(status_code=500, detail="No CSV generated - check report generation logs")

    # Get most recent CSV file
    csv_files = [os.path.join("interview_reports", f) for f in new_files]
    latest_csv = max(csv_files, key=os.path.getctime)

    # Database operations
    try:
        with open(latest_csv, "r") as f:
            csv_content = f.read()

        interview_report = InterviewReport(
            interview_id=interviewId,
            candidate_id=candidateId,
            photos=[],
            report=csv_content,
            csv_file_path=latest_csv
        )

        db.add(interview_report)
        await db.commit()
        await db.refresh(interview_report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # Return generated report
    return FileResponse(
        latest_csv,
        media_type="text/csv",
        filename=f"report_{interviewId}_{candidateId}.csv"
    )
@app.get("/load/model/face-recognition")
async def load_stream_face_recognition():
    return NotImplemented

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)