import asyncio
import base64
import csv
import os
import sys
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
from faceRecognition import run as face_recognition, run
import threading
from database import get_db, create_tables, async_session_maker
from models import InterviewReport

app = FastAPI(title="Face-Recognition")

# Token configuration for JWT authentication
CLIENT_ID = "python-service"
CLIENT_SECRET = "super-secret-key"
TOKEN_URL = "http://localhost:8081/api/v1/auth/client-token"

# Token cache
token = None
expiration_time = 0

async def get_token():
    """Fetch and cache a JWT token from the User Management Service."""
    global token, expiration_time
    if time.time() < expiration_time:
        return token

    async with httpx.AsyncClient() as client:
        payload = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
        response = await client.post(TOKEN_URL, json=payload)
        response.raise_for_status()
        token_data = response.json()
        token = token_data["accessToken"]
        expiration_time = time.time() + 86400  # 24 hours
        return token

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
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()
    return {"message": "Face landmark detection started successfully"}

@app.get("/load/model/mesh")
async def load_stream_mesh():
    """Starts the face landmark detection asynchronously for a given interview ID."""
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
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()
    return {"message": "Face landmark detection started successfully"}

def find_latest_report():
    """Finds the most recently created CSV report in interview_reports directory."""
    try:
        reports_dir = "interview_reports"
        if not os.path.exists(reports_dir):
            return None
        csv_files = [f for f in os.listdir(reports_dir) if f.endswith(".csv")]
        if not csv_files:
            return None
        latest = max(csv_files, key=lambda f: os.path.getmtime(os.path.join(reports_dir, f)))
        return os.path.join(reports_dir, latest)
    except Exception as e:
        print(f"Error finding report: {e}")
        return None

@app.get("/load/model/report")
async def load_stream_report(interviewId: int, candidateId: int, db: AsyncSession = Depends(get_db)):
    """Enhanced report generation endpoint."""
    global report_process, stop_event
    if report_process and report_process.is_alive():
        raise HTTPException(status_code=400, detail="Report generation already running")
    os.makedirs("interview_reports", exist_ok=True)
    initial_files = set(os.listdir("interview_reports"))
    stop_event = threading.Event()

    def run_monitoring():
        try:
            report_generation(
                model='face_landmarker.task',
                num_faces=1,
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

    report_process = threading.Thread(target=run_monitoring, daemon=True)
    report_process.start()

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

    latest_csv = find_latest_report()
    if not latest_csv or not os.path.exists(latest_csv):
        raise HTTPException(status_code=500, detail="No CSV generated")

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
    """Convert byte arrays from Spring Boot to base64 strings for DeepFace."""
    base64_photos = []
    for photo_bytes in photos_data:
        if isinstance(photo_bytes, str):
            base64_photos.append(photo_bytes)
        else:
            base64_str = base64.b64encode(photo_bytes).decode('utf-8')
            base64_photos.append(base64_str)
    return base64_photos

async def get_candidate_data(interview_id: int):
    """Get candidate ID and photos from Spring Boot endpoints with authentication."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            # Fetch JWT token
            current_token = await get_token()
            headers = {"Authorization": f"Bearer {current_token}"}

            # Get candidate ID
            candidate_response = await client.get(
                "http://localhost:9191/api/v1/interviews/get/candidateId/by/interviewId",
                params={"interviewId": interview_id},
                headers=headers
            )
            candidate_response.raise_for_status()
            candidate_data = candidate_response.json()

            if 'data' not in candidate_data or candidate_data['data'] is None:
                raise HTTPException(status_code=404, detail="Candidate ID not found")

            candidate_id = candidate_data['data']

            # Get candidate photos
            photos_response = await client.get(
                "http://localhost:9191/api/v1/users/hr/get/candidate/photos",
                params={"userId": candidate_id},
                headers=headers
            )
            photos_response.raise_for_status()
            photos_data = photos_response.json()

            if 'data' not in photos_data or 'photos' not in photos_data['data'] or not photos_data['data']['photos']:
                raise HTTPException(status_code=404, detail="Candidate photos not found")

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
        emotion_library: str = "deepface",
        min_face_detection: float = 0.5,
        min_face_presence: float = 0.5,
        min_tracking: float = 0.5,
        db: AsyncSession = Depends(get_db)
):
    """Endpoint to start face recognition for an interview."""
    try:
        existing = await db.execute(
            select(InterviewReport).where(InterviewReport.interview_id == interview_id)
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=400,
                detail=f"Interview ID {interview_id} already exists. Please use a different ID."
            )

        candidate_id, candidate_photos = await get_candidate_data(interview_id)
        if not candidate_photos:
            raise HTTPException(
                status_code=400,
                detail="No candidate photos found. Unable to proceed with face recognition."
            )

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

        stop_event = threading.Event()
        process = {
            "stop_event": stop_event,
            "report_path": None,
            "thread": None,
            "completed": False,
            "error": None
        }

        def run_face_recognition_process(
                photos: list,
                stop_event: threading.Event,
                emotion_lib: str,
                min_detect: float,
                min_presence: float,
                min_track: float,
                interview_id: int  # Add interview_id parameter
        ):
            try:
                report_path = run(
                    candidate_photos=photos,
                    stop_event=stop_event,
                    emotion_library=emotion_lib,
                    min_face_detection_confidence=min_detect,
                    min_face_presence_confidence=min_presence,
                    min_tracking_confidence=min_track
                )

                if not report_path or not os.path.exists(report_path):
                    error_msg = f"Report file not found or not generated"
                    # Create new event loop for async database operations
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(update_db_with_report(interview_id, error_message=error_msg))
                    loop.close()

                    active_processes[interview_id]["error"] = error_msg
                    return

                # Create new event loop for async database operations
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(update_db_with_report(interview_id, report_path))
                loop.close()

                active_processes[interview_id]["report_path"] = report_path
                active_processes[interview_id]["completed"] = True
            except Exception as e:
                error_msg = str(e)
                active_processes[interview_id]["error"] = error_msg
                print(f"Face recognition process error: {error_msg}")

                # Even on exception, update the database with the error
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(update_db_with_report(interview_id, error_message=error_msg))
                    loop.close()
                except Exception as db_error:
                    print(f"Failed to update database with error: {str(db_error)}")

        # Updated thread creation in the start_face_recognition function
        thread = threading.Thread(
            target=run_face_recognition_process,
            daemon=False,
            kwargs={
                'photos': candidate_photos,
                'stop_event': stop_event,
                'emotion_lib': emotion_library,
                'min_detect': min_face_detection,
                'min_presence': min_face_presence,
                'min_track': min_tracking,
                'interview_id': interview_id  # Pass the interview_id
            }
        )

        active_processes[interview_id] = {
            "thread": thread,
            "stop_event": stop_event,
            "report_path": None,
            "completed": False,
            "error": None
        }
        thread.start()

        return {
            "message": "Face recognition started",
            "interview_id": interview_id,
            "parameters": {
                "detection_confidence": min_face_detection,
                "presence_confidence": min_face_presence,
                "tracking_confidence": min_tracking
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error starting face recognition: {str(e)}"
        )


async def face_recognition_task(photos, stop_event):
    """
    Dedicated async task for face recognition.
    """
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: face_recognition(candidate_photos=photos, stop_event=stop_event)
    )


async def update_db_with_report(interview_id: int, report_path: str = None, error_message: str = None):
    """Update database with generated report using independent session."""
    try:
        async with async_session_maker() as db:
            async with db.begin():
                result = await db.execute(
                    select(InterviewReport)
                    .where(InterviewReport.interview_id == interview_id)
                    .with_for_update()
                )
                report = result.scalars().first()
                if report:
                    if report_path and os.path.exists(report_path):
                        with open(report_path, "r", encoding="utf-8") as f:
                            report.report = f.read()
                        report.csv_file_path = report_path
                    elif error_message:
                        report.report = f"Face recognition failed: {error_message}"
                        report.csv_file_path = ""  # No CSV file when there's an error
                    await db.commit()
                    print(f"Successfully updated report for interview {interview_id}")
    except Exception as e:
        print(f"Database update error: {str(e)}")
        raise

@app.get("/monitoring/report/{interview_id}")
async def get_report(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Get the report for a completed interview."""
    result = await db.execute(
        select(InterviewReport).where(InterviewReport.interview_id == interview_id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Interview not found")
    if not report.csv_file_path or not os.path.exists(report.csv_file_path):
        process = active_processes.get(interview_id)
        if process and process["thread"].is_alive():
            return {"status": "processing", "message": "Report generation in progress"}
        raise HTTPException(status_code=404, detail="Report not found or not ready yet")
    return FileResponse(
        report.csv_file_path,
        media_type="text/csv",
        filename=f"interview_report_{interview_id}.csv"
    )

@app.get("/monitoring/status/{interview_id}")
async def get_status(interview_id: int, db: AsyncSession = Depends(get_db)):
    """Get the status of an ongoing face recognition process."""
    process = active_processes.get(interview_id)
    if process:
        if process["thread"].is_alive():
            return {"status": "running", "report_ready": False}
        else:
            # Double-check database if thread completed but status not updated
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
            return {
                "status": "error" if process.get("error") else "completed",
                "report_ready": False,
                "error": process.get("error")
            }
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
    """Stop an ongoing face recognition process."""
    process = active_processes.get(interview_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    process["stop_event"].set()
    return {"message": "Stopping face recognition process"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)