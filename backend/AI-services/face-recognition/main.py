import asyncio
import base64
import csv
import os
from datetime import time, datetime
import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import FileResponse
from sqlalchemy.future import select
from basicDetect import run as basic_detect
from faceVerify import run as face_verify
from reportGeneration import run as report_generation
import threading
from database import get_db,create_tables
from models import InterviewReport
from faceRecognition import run as face_recognition

app = FastAPI(title="Face-Recognition")

report_process = None
stop_event = threading.Event()
active_processes = {}

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
    """Enhanced report generation endpoint"""
    global report_process, stop_event

    if report_process and report_process.is_alive():
        raise HTTPException(status_code=400, detail="Report generation already running")

    # Initialize tracking
    os.makedirs("interview_reports", exist_ok=True)
    initial_files = set(os.listdir("interview_reports"))

    # Create a stop event for controlled shutdown
    stop_event = threading.Event()

    def run_monitoring():
        try:
            report_generation(
                model='face_landmarker.task',
                num_faces=1,  # Expect only 1 face
                min_face_detection_confidence=0.7,
                min_face_presence_confidence=0.7,
                min_tracking_confidence=0.7,
                camera_id=0,
                width=720,
                height=480,
                stop_event=stop_event
            )
        except Exception as e:
            print(f"Report generation error: {str(e)}")
        finally:
            stop_event.set()

    # Start and monitor thread
    report_process = threading.Thread(target=run_monitoring, daemon=True)
    report_process.start()

    # Wait with increased timeout
    try:
        for _ in range(120):  # 60 seconds timeout
            if not report_process.is_alive():
                break
            await asyncio.sleep(0.5)
        else:
            stop_event.set()
            raise HTTPException(status_code=504, detail="Report generation timeout")
    except Exception as e:
        stop_event.set()
        raise HTTPException(status_code=500, detail=f"Monitoring error: {str(e)}")

    # Find and process report
    latest_csv = find_latest_report()
    if not latest_csv or not os.path.exists(latest_csv):
        raise HTTPException(status_code=500, detail="No CSV generated")

    # Database operations with transaction management
    try:
        async with db.begin():
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

        return FileResponse(
            latest_csv,
            media_type="text/csv",
            filename=f"report_{interviewId}_{candidateId}.csv"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def get_candidate_data(interview_id: int):
    async with httpx.AsyncClient() as client:
        try:
            # Get candidate ID
            candidate_response = await client.get(
                "http://localhost:9191/api/v1/interviews/get/candidateId/by/interviewId",
                params={"interviewId": interview_id}
            )
            candidate_response.raise_for_status()
            candidate_id = candidate_response.json()['data']

            # Get candidate photos
            photos_response = await client.get(
                "http://localhost:9191/api/v1/users/get/candidate/photos",
                params={"userId": candidate_id}
            )
            photos_response.raise_for_status()
            return candidate_id, photos_response.json()['data']['photos']

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"External service error: {e.response.text}"
            )


@app.get("/load/model/face-recognition")
async def load_stream_face_recognition(
        interview_id: int,
        db: AsyncSession = Depends(get_db)
):
    # Check existing interview
    existing = await db.execute(
        select(InterviewReport).where(InterviewReport.interview_id == interview_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Interview ID already exists")

    try:
        candidate_id, candidate_photos = await get_candidate_data(interview_id)

        # Store in database
        db_report = InterviewReport(
            interview_id=interview_id,
            candidate_id=candidate_id,
            photos=candidate_photos,
            report="",
            csv_file_path=""
        )
        db.add(db_report)
        await db.commit()
        await db.refresh(db_report)

        # Start face recognition process
        from faceRecognition import run_face_recognition
        report_path = await run_face_recognition(candidate_photos)

        # Update report
        with open(report_path, "r") as f:
            db_report.report = f.read()
            db_report.csv_file_path = report_path
            await db.commit()

        return FileResponse(
            report_path,
            media_type="text/csv",
            filename=f"report_{interview_id}_{candidate_id}.csv"
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/monitoring/status/{interviewId}")
async def get_monitoring_status(interviewId: int):
    process = active_processes.get(interviewId)
    if not process:
        return {"status": "not_found"}

    return {
        "status": "running" if process["thread"].is_alive() else "completed",
        "report_generated": process["report_path"] is not None
    }

@app.get("/stop/monitoring/{interviewId}")
async def stop_monitoring(interviewId: int):
    process = active_processes.get(interviewId)
    if not process:
        return {"status": "not_found"}

    process["stop_event"].set()
    return {"status": "stopping"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)