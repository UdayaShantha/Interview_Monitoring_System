import asyncio
import base64
import csv
import os
import sys
import threading
import time
from datetime import datetime
import httpx
import uvicorn
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from basicDetect import run as basic_detect
from faceVerify import run as face_verify
from reportGeneration import run as report_generation
from faceRecognition import run as face_recognition
from database import get_db, create_tables, async_session_maker
from models import InterviewReport
import cv2

app = FastAPI(title="Face-Recognition")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Token configuration
CLIENT_ID = "python-service"
CLIENT_SECRET = "super-secret-key"
TOKEN_URL = "http://localhost:8081/api/v1/auth/client-token"

token = None
expiration_time = 0
active_processes = {}

async def get_token():
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

@app.on_event("startup")
async def startup_event():
    await create_tables()

@app.get("/")
async def root():
    return {"message": "Face Recognition API is running"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model():
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
    reports_dir = "interview_reports"
    if not os.path.exists(reports_dir):
        return None
    csv_files = [f for f in os.listdir(reports_dir) if f.endswith(".csv")]
    if not csv_files:
        return None
    latest = max(csv_files, key=lambda f: os.path.getmtime(os.path.join(reports_dir, f)))
    return os.path.join(reports_dir, latest)

@app.get("/load/model/report")
async def load_stream_report(interviewId: int, candidateId: int, db: AsyncSession = Depends(get_db)):
    if interviewId in active_processes and active_processes[interviewId]["thread"].is_alive():
        raise HTTPException(status_code=400, detail="Report generation already running")
    os.makedirs("interview_reports", exist_ok=True)
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

    thread = threading.Thread(target=run_monitoring, daemon=True)
    thread.start()
    active_processes[interviewId] = {"thread": thread, "stop_event": stop_event}

    try:
        for _ in range(60 * 45):  # 45 minutes timeout
            if not thread.is_alive():
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
    base64_photos = []
    for photo_bytes in photos_data:
        if isinstance(photo_bytes, str):
            base64_photos.append(photo_bytes)
        else:
            base64_str = base64.b64encode(photo_bytes).decode('utf-8')
            base64_photos.append(base64_str)
    return base64_photos

async def get_candidate_data(interview_id: int):
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            current_token = await get_token()
            headers = {"Authorization": f"Bearer {current_token}"}

            try:
                candidate_response = await client.get(
                    "http://localhost:9191/api/v1/interviews/get/candidateId/by/interviewId",
                    params={"interviewId": interview_id},
                    headers=headers
                )
                candidate_response.raise_for_status()
                candidate_data = candidate_response.json()
                candidate_id = candidate_data.get('data', interview_id)
            except Exception as e:
                print(f"Error getting candidate ID: {str(e)}, using interview ID as candidate ID")
                candidate_id = interview_id

            try:
                photos_response = await client.get(
                    "http://localhost:9191/api/v1/users/hr/get/candidate/photos",
                    params={"userId": candidate_id},
                    headers=headers
                )
                photos_response.raise_for_status()
                photos_data = photos_response.json()
                photos = await convert_spring_photos_to_base64(photos_data['data']['photos']) if 'data' in photos_data and 'photos' in photos_data['data'] else []
            except Exception as e:
                print(f"Error getting candidate photos: {str(e)}, using empty list")
                photos = []

            return candidate_id, photos
        except Exception as e:
            print(f"Connection error during candidate data retrieval: {str(e)}")
            return interview_id, []

@app.get("/load/model/face-recognition/{interview_id}")
async def start_face_recognition(
    interview_id: int,
    emotion_library: str = "deepface",
    min_face_detection: float = 0.5,
    min_face_presence: float = 0.5,
    min_tracking: float = 0.5,
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(select(InterviewReport).where(InterviewReport.interview_id == interview_id))
    if existing.scalars().first():
        return {"message": f"Interview ID {interview_id} already exists", "status": "existing", "interview_id": interview_id}

    candidate_id, candidate_photos = await get_candidate_data(interview_id)
    photos_json = json.dumps(candidate_photos)

    try:
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
    except Exception as db_error:
        print(f"Database error: {str(db_error)}")
        await db.rollback()

    stop_event = threading.Event()

    def run_face_recognition_process():
        try:
            print(f"Starting face recognition for interview {interview_id} with {len(candidate_photos)} photos")
            report_path = face_recognition(
                candidate_photos=candidate_photos,
                stop_event=stop_event,
                emotion_library=emotion_library,
                min_face_detection_confidence=min_face_detection,
                min_face_presence_confidence=min_face_presence,
                min_tracking_confidence=min_tracking
            )
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(update_db_with_report(interview_id, report_path))
            loop.close()
            active_processes[interview_id]["report_path"] = report_path
            active_processes[interview_id]["completed"] = True
        except Exception as e:
            error_msg = str(e)
            print(f"Face recognition process error: {error_msg}")
            active_processes[interview_id]["error"] = error_msg
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(update_db_with_report(interview_id, error_message=error_msg))
            loop.close()

    thread = threading.Thread(
        target=run_face_recognition_process,
        daemon=False
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
        "candidate_id": candidate_id,
        "photos_count": len(candidate_photos),
        "parameters": {
            "detection_confidence": min_face_detection,
            "presence_confidence": min_face_presence,
            "tracking_confidence": min_tracking
        }
    }

async def update_db_with_report(interview_id: int, report_path: str = None, error_message: str = None):
    try:
        async with async_session_maker() as db:
            async with db.begin():
                result = await db.execute(
                    select(InterviewReport).where(InterviewReport.interview_id == interview_id).with_for_update()
                )
                report = result.scalars().first()
                if report:
                    if report_path and os.path.exists(report_path):
                        with open(report_path, "r", encoding="utf-8") as f:
                            report.report = f.read()
                        report.csv_file_path = report_path
                    elif error_message:
                        report.report = f"Face recognition failed: {error_message}"
                        report.csv_file_path = ""
                    await db.commit()
                    print(f"Successfully updated report for interview {interview_id}")
    except Exception as e:
        print(f"Database update error: {str(e)}")
        raise

@app.get("/video_feed/{interview_id}")
async def video_feed(interview_id: int):
    def generate_frames():
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Cannot open camera")
            return

        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 20)

        try:
            while interview_id in active_processes and not active_processes[interview_id]["stop_event"].is_set():
                success, frame = cap.read()
                if not success:
                    print("Failed to grab frame")
                    break

                ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                if not ret:
                    continue

                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        finally:
            cap.release()

    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.post("/start/stream/{interview_id}")
async def start_stream(
    interview_id: int,
    emotion_library: str = "deepface",
    min_face_detection: float = 0.5,
    min_face_presence: float = 0.5,
    min_tracking: float = 0.5,
    db: AsyncSession = Depends(get_db)
):
    return await start_face_recognition(
        interview_id,
        emotion_library,
        min_face_detection,
        min_face_presence,
        min_tracking,
        db
    )

@app.get("/monitoring/report/{interview_id}")
async def get_report(interview_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InterviewReport).where(InterviewReport.interview_id == interview_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Interview not found")
    if not report.csv_file_path or not os.path.exists(report.csv_file_path):
        process = active_processes.get(interview_id)
        if process and process["thread"].is_alive():
            return {"status": "processing", "message": "Report generation in progress"}
        raise HTTPException(status_code=404, detail="Report not found or not ready yet")

    with open(report.csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        data = list(reader)

    return JSONResponse(content={"status": "completed", "data": data})

@app.get("/monitoring/status/{interview_id}")
async def get_status(interview_id: int, db: AsyncSession = Depends(get_db)):
    process = active_processes.get(interview_id)
    if process:
        if process["thread"].is_alive():
            return {"status": "running", "report_ready": False}
        else:
            result = await db.execute(select(InterviewReport).where(InterviewReport.interview_id == interview_id))
            report = result.scalars().first()
            if report and report.csv_file_path and os.path.exists(report.csv_file_path):
                return {"status": "completed", "report_ready": True, "completed": True}
            return {
                "status": "error" if process.get("error") else "completed",
                "report_ready": False,
                "error": process.get("error")
            }
    result = await db.execute(select(InterviewReport).where(InterviewReport.interview_id == interview_id))
    report = result.scalars().first()
    if report and report.csv_file_path and os.path.exists(report.csv_file_path):
        return {"status": "completed", "report_ready": True, "completed": True}
    return {"status": "not_found"}

@app.get("/stop/monitoring/{interview_id}")
async def stop_monitoring(interview_id: int):
    process = active_processes.get(interview_id)
    if not process:
        async with async_session_maker() as db:
            result = await db.execute(select(InterviewReport).where(InterviewReport.interview_id == interview_id))
            if not result.scalars().first():
                raise HTTPException(status_code=404, detail="Interview not found")
        return {"message": "No active face recognition process to stop", "status": "completed"}

    process["stop_event"].set()
    process["thread"].join()  # Wait for the thread to finish
    del active_processes[interview_id]  # Clean up
    return {"message": "Face recognition process stopped", "status": "stopped"}

if __name__ == "_main_":
    uvicorn.run(app, host="127.0.0.1",port=8001)
