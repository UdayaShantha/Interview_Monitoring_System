import asyncio
import base64
import csv
import os
import time
from datetime import datetime
import httpx
import uvicorn
import json
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from basicDetect import run as basic_detect
from faceVerify import run as face_verify
from reportGeneration import run as report_generation
from faceRecognition import run as face_recognition
import threading
from database import get_db, create_tables
from models import InterviewReport

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

    return {"message": "Face landmark detection started successfully"}


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
        for _ in range(60 * 45):  # 45 minutes timeout
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


async def convert_spring_photos_to_base64(photos_data):
    """Convert byte arrays from Spring Boot to base64 strings for DeepFace"""
    base64_photos = []
    for photo_bytes in photos_data:
        # If the photos are already strings, use them directly
        if isinstance(photo_bytes, str):
            base64_photos.append(photo_bytes)
        else:
            # Convert byte arrays to base64 strings
            base64_str = base64.b64encode(photo_bytes).decode('utf-8')
            base64_photos.append(base64_str)
    return base64_photos


async def get_candidate_data(interview_id: int):
    """Get candidate ID and photos from Spring Boot endpoints"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Get candidate ID
            candidate_response = await client.get(
                "http://localhost:9191/api/v1/interviews/get/candidateId/by/interviewId",
                params={"interviewId": interview_id}
            )
            candidate_response.raise_for_status()
            candidate_data = candidate_response.json()

            if 'data' not in candidate_data or candidate_data['data'] is None:
                raise HTTPException(status_code=404, detail="Candidate ID not found")

            candidate_id = candidate_data['data']

            # Get candidate photos
            photos_response = await client.get(
                "http://localhost:9191/api/v1/users/get/candidate/photos",
                params={"userId": candidate_id}
            )
            photos_response.raise_for_status()
            photos_data = photos_response.json()

            if 'data' not in photos_data or 'photos' not in photos_data['data'] or not photos_data['data']['photos']:
                raise HTTPException(status_code=404, detail="Candidate photos not found")

            # Convert photos to base64 for storage and processing
            photos = await convert_spring_photos_to_base64(photos_data['data']['photos'])

            return candidate_id, photos

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"External service error: {e.response.text}"
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Connection error: {str(e)}"
            )


@app.get("/load/model/face-recognition/{interview_id}")
async def start_face_recognition(
        interview_id: int,
        db: AsyncSession = Depends(get_db)
):
    """
    Endpoint to start face recognition for an interview.
    1. Checks if interview exists
    2. Gets candidate data and photos
    3. Stores data in database
    4. Starts face recognition process
    5. Returns report when complete
    """
    try:
        # Check if interview already exists
        existing = await db.execute(
            select(InterviewReport).where(InterviewReport.interview_id == interview_id)
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=400,
                detail=f"Interview ID {interview_id} already exists. Please use a different ID."
            )

        # Get candidate data from Spring Boot
        candidate_id, candidate_photos = await get_candidate_data(interview_id)

        if not candidate_photos:
            raise HTTPException(
                status_code=400,
                detail="No candidate photos found. Unable to proceed with face recognition."
            )

        # Create database entry with initial data
        photos_json = json.dumps(candidate_photos)
        db_report = InterviewReport(
            interview_id=interview_id,
            candidate_id=candidate_id,
            photos=photos_json,
            report="",
            csv_file_path=""
        )
        db.add(db_report)
        await db.commit()
        await db.refresh(db_report)

        # Start face recognition process with stop event
        stop_event = threading.Event()
        process = {
            "stop_event": stop_event,
            "report_path": None,
            "thread": None,
            "completed": False
        }

        # Define the thread function for face recognition
        def run_face_recognition_process():
            try:
                report_path = face_recognition(
                    candidate_photos=candidate_photos,
                    stop_event=stop_event,
                    camera_id=0,
                    width=720,
                    height=480
                )
                process["report_path"] = report_path
                process["completed"] = True

                # Update the database with the report path
                asyncio.run(update_db_with_report(interview_id, report_path, db))

            except Exception as e:
                print(f"Face recognition error: {str(e)}")
                process["error"] = str(e)

        # Start the thread
        thread = threading.Thread(target=run_face_recognition_process, daemon=True)
        process["thread"] = thread
        active_processes[interview_id] = process
        thread.start()

        return {
            "message": "Face recognition started",
            "interview_id": interview_id,
            "status": "The webcam will open for face verification. Press ESC to end the session."
        }

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        # Rollback database and provide error details
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error starting face recognition: {str(e)}"
        )


async def update_db_with_report(interview_id, report_path, db):
    """Update the database with the report after face recognition completes"""
    try:
        async with db.begin():
            result = await db.execute(
                select(InterviewReport).where(InterviewReport.interview_id == interview_id)
            )
            report = result.scalars().first()

            if report and report_path and os.path.exists(report_path):
                with open(report_path, "r") as f:
                    csv_content = f.read()

                report.report = csv_content
                report.csv_file_path = report_path
                await db.commit()

    except Exception as e:
        print(f"Error updating database with report: {str(e)}")
        await db.rollback()


@app.get("/monitoring/report/{interview_id}")
async def get_report(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Get the report for a completed interview"""
    # Check database for existing report
    result = await db.execute(
        select(InterviewReport).where(InterviewReport.interview_id == interview_id)
    )
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not report.csv_file_path or not os.path.exists(report.csv_file_path):
        # Check if there's an active process
        process = active_processes.get(interview_id)
        if process and process["thread"].is_alive():
            return {"status": "processing", "message": "Report generation in progress"}

        raise HTTPException(status_code=404, detail="Report not found or not ready yet")

    # Return the CSV file
    return FileResponse(
        report.csv_file_path,
        media_type="text/csv",
        filename=f"interview_report_{interview_id}.csv"
    )


@app.get("/monitoring/status/{interview_id}")
async def get_status(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Get the status of an ongoing face recognition process"""
    # Check if there's an active process
    process = active_processes.get(interview_id)

    if process:
        return {
            "status": "running" if process["thread"].is_alive() else "completed",
            "report_ready": process["report_path"] is not None and os.path.exists(process["report_path"]),
            "completed": process.get("completed", False)
        }

    # Check database for completed report
    result = await db.execute(
        select(InterviewReport).where(InterviewReport.interview_id == interview_id)
    )
    report = result.scalars().first()

    if report and report.csv_file_path and os.path.exists(report.csv_file_path):
        return {
            "status": "completed",
            "report_ready": True,
            "completed": True
        }

    return {"status": "not_found"}


@app.get("/stop/monitoring/{interview_id}")
async def stop_monitoring(interview_id: int):
    """Stop an ongoing face recognition process"""
    process = active_processes.get(interview_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    process["stop_event"].set()
    return {"message": "Stopping face recognition process"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)