import uvicorn
from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel, Field
from typing import List,Annotated
import subprocess
import sys
from basicDetect import run
import threading

app = FastAPI()


@app.get("/load/basic/model/mesh/matrice")
async def load_basic_model():
    """Starts the face landmark detection process asynchronously when called."""

    def start_detection():
        run(
            model='face_landmarker.task',  # Replace with your actual model path if different
            num_faces=5,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            camera_id=0,  # Default camera
            width=1920,
            height=1080
        )

    # Run the detection in a separate thread to avoid blocking FastAPI
    thread = threading.Thread(target=start_detection, daemon=True)
    thread.start()

    return {"message": "Face landmark detection started successfully"}

@app.get("/load/model/mesh")
async def load_stream_mesh(interviewId : int):
    return NotImplemented

@app.get("/load/model/report")
async def load_stream_report(interviewId : int):
    return NotImplemented

@app.get("/load/model/face-recognition")
async def load_stream_face_recognition(interviewId : int):
    return NotImplemented

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)